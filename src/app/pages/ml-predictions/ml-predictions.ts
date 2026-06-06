import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MlPredictionService } from '../../services/ml-prediction.service';
import { AlertaCoberturaService, AlertaCoberturaResponse } from '../../services/alerta-cobertura.service';
import {
  PrediccionPicoDemanda,
  PrediccionRiesgoVencimiento,
  ResumenPredicciones
} from '../../models/ml-prediction.interface';

/**
 * HU-18 / CP018: Ítem de riesgo de quiebre por cobertura insuficiente.
 * Datos derivados de la cobertura ya calculada en el backend (/api/alertas-cobertura).
 */
export interface ItemRiesgoQuiebre {
  productoId: number;
  nombre: string;
  stockActual: number;
  consumoDiario: number;
  diasCobertura: number;
  umbralDias: number;
  nivel: 'ALTO' | 'MEDIO' | 'BAJO';
}

@Component({
  selector: 'app-ml-predictions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ml-predictions.html',
  styleUrls: ['./ml-predictions.scss']
})
export class MlPredictionsComponent implements OnInit {
  loading = false;
  // Error del servicio ML (Python/Flask :5000). Solo afecta a Picos de Demanda y Riesgo de Vencimiento.
  errorMl: string | null = null;

  picosDemanda: PrediccionPicoDemanda[] = [];
  riesgosVencimiento: PrediccionRiesgoVencimiento[] = [];

  // HU-18 / CP018: ítems con cobertura insuficiente (riesgo de quiebre)
  riesgosQuiebre: ItemRiesgoQuiebre[] = [];
  coberturaCargada = false;

  totalProductos = 0;
  productosConPico = 0;
  productosEnRiesgo = 0;
  productosEnQuiebre = 0;
  confianzaPronostico = 0;

  selectedTab: 'demanda' | 'vencimiento' | 'quiebre' = 'demanda';
  selectedNivel: 'TODOS' | 'ALTO' | 'MEDIO' | 'BAJO' = 'TODOS';

  constructor(
    private mlService: MlPredictionService,
    private coberturaService: AlertaCoberturaService
  ) {}

  ngOnInit(): void {
    this.cargarPredicciones();
  }

  cargarPredicciones(): void {
    this.loading = true;
    this.errorMl = null;

    this.mlService.getResumenPredicciones().subscribe({
      next: (resumen: ResumenPredicciones) => {
        this.picosDemanda = resumen.picos_demanda.predicciones;
        this.productosConPico = resumen.picos_demanda.productosConPico;

        this.riesgosVencimiento = resumen.riesgo_vencimiento.predicciones;
        this.productosEnRiesgo = resumen.riesgo_vencimiento.productosEnRiesgo;

        this.totalProductos = resumen.picos_demanda.totalProductos;

        // HU-06 Escenario 2: Calcular confianza del pronóstico
        this.calcularConfianza();

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar predicciones:', err);
        this.errorMl = 'Error al cargar las predicciones. Verifica que el servicio ML esté activo.';
        this.picosDemanda = [];
        this.riesgosVencimiento = [];
        this.loading = false;
      }
    });

    // HU-18 / CP018: cargar en paralelo el panel de riesgo de quiebre por cobertura
    this.cargarRiesgoQuiebre();
  }

  // HU-18 / CP018: obtiene los ítems con cobertura insuficiente desde el backend
  cargarRiesgoQuiebre(): void {
    this.coberturaCargada = false;
    this.coberturaService.getAlertasCoberturaActivas().subscribe({
      next: (alertas: AlertaCoberturaResponse[]) => {
        this.riesgosQuiebre = alertas.map(a => this.mapAlertaAItemQuiebre(a));
        this.productosEnQuiebre = this.riesgosQuiebre.length;
        this.coberturaCargada = true;
      },
      error: (err) => {
        console.error('Error al cargar riesgo de quiebre:', err);
        // No bloquea las otras pestañas; se trata como "sin proyección disponible"
        this.riesgosQuiebre = [];
        this.productosEnQuiebre = 0;
        this.coberturaCargada = true;
      }
    });
  }

  /**
   * HU-18 / CP018: convierte una AlertaCoberturaResponse en un ItemRiesgoQuiebre.
   * El backend ya entrega stock actual y umbral en días; la cobertura y el consumo
   * diario vienen embebidos en el texto de 'sugerencia', de donde se extraen.
   */
  private mapAlertaAItemQuiebre(a: AlertaCoberturaResponse): ItemRiesgoQuiebre {
    const texto = a.sugerencia || '';
    const coberturaMatch = texto.match(/Cobertura:\s*(\d+)\s*d[ií]as/i);
    const consumoMatch = texto.match(/Consumo promedio:\s*([\d.]+)/i);

    const diasCobertura = coberturaMatch ? parseInt(coberturaMatch[1], 10) : 0;
    const consumoDiario = consumoMatch ? parseFloat(consumoMatch[1]) : 0;

    return {
      productoId: a.productoId,
      nombre: a.productoNombre,
      stockActual: a.stockActual ?? 0,
      consumoDiario,
      diasCobertura,
      umbralDias: a.nivelAlerta ?? 0,
      nivel: this.normalizarNivel(a.nivel)
    };
  }

  // El backend de cobertura usa ALTA/MEDIA/BAJA; el resto de la pantalla usa ALTO/MEDIO/BAJO
  private normalizarNivel(nivel: string): 'ALTO' | 'MEDIO' | 'BAJO' {
    switch ((nivel || '').toUpperCase()) {
      case 'ALTA': return 'ALTO';
      case 'MEDIA': return 'MEDIO';
      case 'BAJA': return 'BAJO';
      default: return 'BAJO';
    }
  }

  get prediccionesFiltradas(): (PrediccionPicoDemanda | PrediccionRiesgoVencimiento)[] {
    const predicciones = this.selectedTab === 'demanda' ? this.picosDemanda : this.riesgosVencimiento;

    if (this.selectedNivel === 'TODOS') {
      return predicciones;
    }

    return predicciones.filter(p => p.nivelRiesgo === this.selectedNivel);
  }

  // HU-18 / CP018: lista de riesgo de quiebre filtrada por nivel
  get riesgosQuiebreFiltrados(): ItemRiesgoQuiebre[] {
    if (this.selectedNivel === 'TODOS') {
      return this.riesgosQuiebre;
    }
    return this.riesgosQuiebre.filter(r => r.nivel === this.selectedNivel);
  }

  selectTab(tab: 'demanda' | 'vencimiento' | 'quiebre'): void {
    this.selectedTab = tab;
    this.selectedNivel = 'TODOS';
  }

  selectNivel(nivel: 'TODOS' | 'ALTO' | 'MEDIO' | 'BAJO'): void {
    this.selectedNivel = nivel;
  }

  // HU-18 / CP018: etiqueta de estado para la pestaña de quiebre (sin probabilidad)
  getEstadoQuiebreLabel(nivel: 'ALTO' | 'MEDIO' | 'BAJO'): string {
    switch (nivel) {
      case 'ALTO': return 'Crítico';
      case 'MEDIO': return 'Medio';
      case 'BAJO': return 'Bajo';
      default: return 'Bajo';
    }
  }

  getNivelClass(nivel: string): string {
    switch (nivel) {
      case 'ALTO': return 'nivel-alto';
      case 'MEDIO': return 'nivel-medio';
      case 'BAJO': return 'nivel-bajo';
      default: return '';
    }
  }

  getProbabilidadPorcentaje(probabilidad: number): number {
    return Math.round(probabilidad * 100);
  }

  recargar(): void {
    this.cargarPredicciones();
  }

  // HU-06 Escenario 2: Calcular confianza del pronóstico basado en probabilidades
  calcularConfianza(): void {
    const todasPredicciones = [...this.picosDemanda];

    if (todasPredicciones.length === 0) {
      this.confianzaPronostico = 0;
      return;
    }

    // Calcular confianza promedio basada en probabilidades
    const promedioConfianza = todasPredicciones.reduce(
      (sum, pred) => sum + pred.probabilidad, 0
    ) / todasPredicciones.length;

    this.confianzaPronostico = Math.round(promedioConfianza * 100);
  }

  getConfianzaLabel(): string {
    if (this.confianzaPronostico >= 70) return 'ALTA';
    if (this.confianzaPronostico >= 50) return 'MEDIA';
    return 'BAJA';
  }

  getConfianzaClass(): string {
    if (this.confianzaPronostico >= 70) return 'confianza-alta';
    if (this.confianzaPronostico >= 50) return 'confianza-media';
    return 'confianza-baja';
  }

  mostrarAdvertenciaConfianza(): boolean {
    return this.confianzaPronostico < 50;
  }
}
