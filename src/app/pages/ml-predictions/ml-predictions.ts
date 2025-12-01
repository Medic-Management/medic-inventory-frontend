import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MlPredictionService } from '../../services/ml-prediction.service';
import {
  PrediccionPicoDemanda,
  PrediccionRiesgoVencimiento,
  ResumenPredicciones
} from '../../models/ml-prediction.interface';

@Component({
  selector: 'app-ml-predictions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ml-predictions.html',
  styleUrls: ['./ml-predictions.scss']
})
export class MlPredictionsComponent implements OnInit {
  loading = false;
  error: string | null = null;

  picosDemanda: PrediccionPicoDemanda[] = [];
  riesgosVencimiento: PrediccionRiesgoVencimiento[] = [];

  totalProductos = 0;
  productosConPico = 0;
  productosEnRiesgo = 0;

  selectedTab: 'demanda' | 'vencimiento' = 'demanda';
  selectedNivel: 'TODOS' | 'ALTO' | 'MEDIO' | 'BAJO' = 'TODOS';

  constructor(private mlService: MlPredictionService) {}

  ngOnInit(): void {
    this.cargarPredicciones();
  }

  cargarPredicciones(): void {
    this.loading = true;
    this.error = null;

    this.mlService.getResumenPredicciones().subscribe({
      next: (resumen: ResumenPredicciones) => {
        this.picosDemanda = resumen.picos_demanda.predicciones;
        this.productosConPico = resumen.picos_demanda.productosConPico;

        this.riesgosVencimiento = resumen.riesgo_vencimiento.predicciones;
        this.productosEnRiesgo = resumen.riesgo_vencimiento.productosEnRiesgo;

        this.totalProductos = resumen.picos_demanda.totalProductos;

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar predicciones:', err);
        this.error = 'Error al cargar las predicciones. Verifica que el servicio ML esté activo.';
        this.loading = false;
      }
    });
  }

  get prediccionesFiltradas(): (PrediccionPicoDemanda | PrediccionRiesgoVencimiento)[] {
    const predicciones = this.selectedTab === 'demanda' ? this.picosDemanda : this.riesgosVencimiento;

    if (this.selectedNivel === 'TODOS') {
      return predicciones;
    }

    return predicciones.filter(p => p.nivelRiesgo === this.selectedNivel);
  }

  selectTab(tab: 'demanda' | 'vencimiento'): void {
    this.selectedTab = tab;
    this.selectedNivel = 'TODOS';
  }

  selectNivel(nivel: 'TODOS' | 'ALTO' | 'MEDIO' | 'BAJO'): void {
    this.selectedNivel = nivel;
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
}
