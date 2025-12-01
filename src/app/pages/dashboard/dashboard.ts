import { Component, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AlertaService, AlertaResponse } from '../../services/alerta.service';
import { AlertaVencimientoService, AlertaVencimientoResponse } from '../../services/alerta-vencimiento.service';
import { AlertaCoberturaService, AlertaCoberturaResponse, ResumenCobertura } from '../../services/alerta-cobertura.service';
import { ReporteService, DatoGraficoMensualDTO, MetricasDashboardDTO } from '../../services/reporte.service';
import { MlPredictionService } from '../../services/ml-prediction.service';
import { SugerenciaService, SugerenciaPedido } from '../../services/sugerencia.service';
import { ResumenPredicciones, PrediccionPicoDemanda } from '../../models/ml-prediction.interface';

interface TopMedication {
  name: string;
  dispatched: number;
  remaining: number;
  price: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [NgClass],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private alertaService = inject(AlertaService);
  private alertaVencimientoService = inject(AlertaVencimientoService);
  private alertaCoberturaService = inject(AlertaCoberturaService);
  private reporteService = inject(ReporteService);
  private mlService = inject(MlPredictionService);
  private sugerenciaService = inject(SugerenciaService);
  private router = inject(Router);

  loading = false;
  mlLoading = false;
  sugerenciasLoading = false;
  stats: MetricasDashboardDTO = {
    totalProductos: 0,
    productosStockCritico: 0,
    productosStockBajo: 0,
    cantidadTotalStock: 0,
    proveedoresActivos: 0,
    totalCategorias: 0,
    enTransito: 0,
    resumenDespachos: {
      despachados: 0,
      entregadas: 0,
      ganancia: 0,
      costoTotal: 0
    },
    resumenIngresos: {
      ordenes: 0,
      costoTotal: 0,
      canceladas: 0,
      devueltos: 0
    }
  };

  chartData: DatoGraficoMensualDTO[] = [];

  topMedications: TopMedication[] = [];
  criticalProducts: any[] = [];
  alertas: AlertaResponse[] = [];
  alertasVencimiento: AlertaVencimientoResponse[] = [];

  // HU-17: Coverage Alerts
  alertasCobertura: AlertaCoberturaResponse[] = [];
  resumenCobertura: ResumenCobertura = {
    totalAlertas: 0,
    alertasAltas: 0,
    alertasMedias: 0,
    alertasBajas: 0
  };

  // ML Predictions
  prediccionesML: ResumenPredicciones | null = null;
  top10RiesgoQuiebre: PrediccionPicoDemanda[] = [];
  confianzaPronostico = 0;

  // HU-07: Sugerencias de Pedido
  sugerenciasPedido: SugerenciaPedido[] = [];

  ngOnInit() {
    this.loadDashboardData();
    this.loadMetricas();
    this.loadGraficoMensual();
    this.loadAlertas();
    this.loadAlertasVencimiento();
    this.loadAlertasCobertura();
    this.loadMLPredictions();
    this.loadSugerenciasPedido();
  }

  loadMetricas() {
    this.reporteService.obtenerMetricasDashboard().subscribe({
      next: (metricas) => {
        this.stats = metricas;
        console.log('Métricas dashboard loaded:', metricas);
      },
      error: (error) => {
        console.error('Error loading métricas dashboard:', error);
      }
    });
  }

  loadGraficoMensual() {
    this.reporteService.obtenerDatosGraficoMensual().subscribe({
      next: (datos) => {
        this.chartData = datos;
        console.log('Datos gráfico mensual loaded:', datos);
      },
      error: (error) => {
        console.error('Error loading datos gráfico mensual:', error);
      }
    });
  }

  loadDashboardData() {
    this.loading = true;
    this.productService.getProductsWithInventory().subscribe({
      next: (products: any[]) => {
        const sortedByQuantity = [...products]
          .filter(p => p.cantidad > 0)
          .sort((a, b) => b.cantidad - a.cantidad)
          .slice(0, 3);

        this.topMedications = sortedByQuantity.map(p => ({
          name: p.nombre || p.codigo,
          dispatched: 0,
          remaining: p.cantidad,
          price: 'S/ ' + (p.precio ? Number(p.precio).toFixed(2) : '2.50')
        }));

        // Get critical stock products
        this.criticalProducts = products
          .filter(p => p.status === 'CRITICAL' || p.status === 'LOW_STOCK')
          .slice(0, 5);

        this.loading = false;
        console.log('Dashboard data loaded:', {
          topMeds: this.topMedications.length,
          critical: this.criticalProducts.length
        });
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  loadAlertas() {
    this.alertaService.obtenerAlertasActivas().subscribe({
      next: (alertas) => {
        this.alertas = alertas;
        console.log('Alertas loaded:', alertas.length);
      },
      error: (error) => {
        console.error('Error loading alertas:', error);
      }
    });
  }

  resolverAlerta(alertaId: number) {
    this.alertaService.resolverAlerta(alertaId).subscribe({
      next: () => {
        this.loadAlertas();
      },
      error: (error) => {
        console.error('Error resolving alerta:', error);
      }
    });
  }

  loadAlertasVencimiento() {
    this.alertaVencimientoService.obtenerAlertasCriticas().subscribe({
      next: (alertas) => {
        this.alertasVencimiento = alertas;
        console.log('Alertas vencimiento loaded:', alertas.length);
      },
      error: (error) => {
        console.error('Error loading alertas vencimiento:', error);
      }
    });
  }

  // HU-17: Cargar alertas de cobertura
  loadAlertasCobertura() {
    this.alertaCoberturaService.getAlertasCoberturaActivas().subscribe({
      next: (alertas) => {
        this.alertasCobertura = alertas.slice(0, 5); // Top 5 para dashboard
        console.log('Alertas cobertura loaded:', alertas.length);
      },
      error: (error) => {
        console.error('Error loading alertas cobertura:', error);
      }
    });

    this.alertaCoberturaService.getResumenCobertura().subscribe({
      next: (resumen) => {
        this.resumenCobertura = resumen;
      },
      error: (error) => {
        console.error('Error loading resumen cobertura:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  getNivelVencimientoClass(nivel: string): string {
    if (nivel === 'CRITICO') return 'badge-red';
    if (nivel === 'ALERTA') return 'badge-orange';
    return 'badge-yellow';
  }

  loadMLPredictions() {
    this.mlLoading = true;
    this.mlService.getResumenPredicciones().subscribe({
      next: (resumen) => {
        this.prediccionesML = resumen;

        // Obtener top 10 con mayor riesgo (ordenar por nivelRiesgo ALTO primero, luego por probabilidad)
        this.top10RiesgoQuiebre = [...resumen.picos_demanda.predicciones]
          .sort((a, b) => {
            if (a.nivelRiesgo === 'ALTO' && b.nivelRiesgo !== 'ALTO') return -1;
            if (a.nivelRiesgo !== 'ALTO' && b.nivelRiesgo === 'ALTO') return 1;
            return b.probabilidad - a.probabilidad;
          })
          .slice(0, 10);

        // Calcular confianza promedio del pronóstico (basado en las predicciones)
        const totalPredicciones = resumen.picos_demanda.predicciones.length;
        if (totalPredicciones > 0) {
          const promedioConfianza = resumen.picos_demanda.predicciones.reduce(
            (sum, pred) => sum + pred.probabilidad, 0
          ) / totalPredicciones;
          this.confianzaPronostico = Math.round(promedioConfianza * 100);
        }

        this.mlLoading = false;
        console.log('ML Predictions loaded:', resumen);
      },
      error: (error) => {
        console.error('Error loading ML predictions:', error);
        this.mlLoading = false;
      }
    });
  }

  getNivelRiesgoClass(nivel: string): string {
    if (nivel === 'ALTO') return 'badge-red';
    if (nivel === 'MEDIO') return 'badge-orange';
    return 'badge-yellow';
  }

  getProbabilidadPorcentaje(probabilidad: number): number {
    return Math.round(probabilidad * 100);
  }

  getConfianzaClass(): string {
    if (this.confianzaPronostico >= 70) return 'confianza-alta';
    if (this.confianzaPronostico >= 50) return 'confianza-media';
    return 'confianza-baja';
  }

  getConfianzaLabel(): string {
    if (this.confianzaPronostico >= 70) return 'ALTA';
    if (this.confianzaPronostico >= 50) return 'MEDIA';
    return 'BAJA';
  }

  // HU-17: Helper methods for coverage alerts
  getNivelCoberturaClass(nivel: string): string {
    if (nivel === 'ALTA') return 'badge-red';
    if (nivel === 'MEDIA') return 'badge-orange';
    return 'badge-yellow';
  }

  extractDiasCobertura(sugerencia: string): number {
    const match = sugerencia.match(/Cobertura:\s*(\d+)\s*días/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * HU-03 Escenario 2: Descargar reporte consolidado de alertas
   */
  descargarReporteAlertas() {
    this.alertaService.descargarReporteConsolidado().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-alertas-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('Reporte de alertas descargado exitosamente');
      },
      error: (error) => {
        console.error('Error descargando reporte de alertas:', error);
        alert('Error al descargar el reporte de alertas');
      }
    });
  }

  // HU-07: Sugerencias de Pedido
  loadSugerenciasPedido() {
    this.sugerenciasLoading = true;
    this.sugerenciaService.obtenerSugerenciasPedido().subscribe({
      next: (sugerencias) => {
        this.sugerenciasPedido = sugerencias;
        this.sugerenciasLoading = false;
        console.log('Sugerencias de pedido cargadas:', sugerencias.length);
      },
      error: (error) => {
        console.error('Error cargando sugerencias de pedido:', error);
        this.sugerenciasLoading = false;
      }
    });
  }

  getCriticidadClass(criticidad: string): string {
    if (criticidad === 'ALTA') return 'badge-red';
    if (criticidad === 'MEDIA') return 'badge-orange';
    return 'badge-yellow';
  }

  crearBorradorDesdeSugerencia(sugerencia: SugerenciaPedido) {
    if (!confirm(`¿Crear borrador de pedido para ${sugerencia.productoNombre}?`)) {
      return;
    }

    this.sugerenciaService.crearBorradorDesdeSugerencia(sugerencia).subscribe({
      next: (borrador) => {
        console.log('Borrador creado:', borrador);
        alert(`Borrador creado exitosamente para ${sugerencia.productoNombre}. Redirigiendo...`);
        this.router.navigate(['/solicitudes-compra']);
      },
      error: (error) => {
        console.error('Error creando borrador:', error);
        alert('Error al crear borrador: ' + (error.error?.message || 'Error desconocido'));
      }
    });
  }
}
