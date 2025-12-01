import { Component, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { AlertaService, AlertaResponse } from '../../services/alerta.service';
import { AlertaVencimientoService, AlertaVencimientoResponse } from '../../services/alerta-vencimiento.service';
import { ReporteService, DatoGraficoMensualDTO, MetricasDashboardDTO } from '../../services/reporte.service';

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
  private reporteService = inject(ReporteService);

  loading = false;
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

  ngOnInit() {
    this.loadDashboardData();
    this.loadMetricas();
    this.loadGraficoMensual();
    this.loadAlertas();
    this.loadAlertasVencimiento();
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
}
