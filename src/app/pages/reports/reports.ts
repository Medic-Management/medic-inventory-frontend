import { Component, inject, OnInit } from '@angular/core';
import { ReporteService, ReporteResponse, DatoGraficoMensualDTO } from '../../services/reporte.service';

@Component({
  selector: 'app-reports',
  imports: [],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class ReportsComponent implements OnInit {
  private reporteService = inject(ReporteService);
  reporte: ReporteResponse | null = null;
  datosGrafico: DatoGraficoMensualDTO[] = [];

  ngOnInit() {
    this.loadReporte();
    this.loadGrafico();
  }

  loadReporte() {
    this.reporteService.obtenerReporteGeneral().subscribe({
      next: (reporte) => {
        this.reporte = reporte;
        console.log('Reporte cargado:', reporte);
      },
      error: (error) => {
        console.error('Error loading reporte:', error);
      }
    });
  }

  loadGrafico() {
    this.reporteService.obtenerDatosGraficoMensual().subscribe({
      next: (datos) => {
        this.datosGrafico = datos;
        console.log('Datos gráfico cargados:', datos);
      },
      error: (error) => {
        console.error('Error loading datos gráfico:', error);
      }
    });
  }

  formatCurrency(value: number): string {
    return 'S/ ' + value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatPercentage(value: number): string {
    return value.toFixed(1) + '%';
  }

  getYCoord(value: number, maxValue: number): number {
    const chartHeight = 180;
    const margin = 70;
    return margin + chartHeight - (value / maxValue * chartHeight);
  }

  getMaxValue(): number {
    if (this.datosGrafico.length === 0) return 100;
    const maxIngresos = Math.max(...this.datosGrafico.map(d => d.ingresos));
    const maxDespachos = Math.max(...this.datosGrafico.map(d => d.despachos));
    return Math.max(maxIngresos, maxDespachos) * 1.1;
  }

  getLinePoints(type: 'ingresos' | 'despachos'): string {
    if (this.datosGrafico.length === 0) return '';
    const maxValue = this.getMaxValue();
    const spacing = 670 / (this.datosGrafico.length - 1);

    return this.datosGrafico.map((dato, index) => {
      const x = 80 + (index * spacing);
      const value = type === 'ingresos' ? dato.ingresos : dato.despachos;
      const y = this.getYCoord(value, maxValue);
      return `${x},${y}`;
    }).join(' ');
  }
}
