import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertaVencimientoService, AlertaVencimientoResponse } from '../../services/alerta-vencimiento.service';

@Component({
  selector: 'app-alertas-vencimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alertas-vencimiento.html',
  styleUrl: './alertas-vencimiento.scss',
})
export class AlertasVencimientoComponent implements OnInit {
  private alertaService = inject(AlertaVencimientoService);

  alertas: AlertaVencimientoResponse[] = [];
  loading = false;
  filtroNivel = 'TODOS';

  ngOnInit() {
    this.loadAlertas();
  }

  loadAlertas() {
    this.loading = true;
    this.alertaService.obtenerAlertasVencimiento().subscribe({
      next: (alertas) => {
        this.alertas = alertas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading alertas:', error);
        this.loading = false;
      }
    });
  }

  get alertasFiltradas(): AlertaVencimientoResponse[] {
    if (this.filtroNivel === 'TODOS') {
      return this.alertas;
    }
    return this.alertas.filter(a => a.nivelAlerta === this.filtroNivel);
  }

  onFiltroChange() {
    // Filtrado se maneja reactivamente con get alertasFiltradas()
  }

  getNivelClass(nivel: string): string {
    const classes: { [key: string]: string } = {
      'CRITICO': 'nivel-critico',
      'ALERTA': 'nivel-alerta',
      'ADVERTENCIA': 'nivel-advertencia'
    };
    return classes[nivel] || 'nivel-advertencia';
  }

  getNivelTexto(nivel: string): string {
    const textos: { [key: string]: string } = {
      'CRITICO': 'Crítico (<30 días)',
      'ALERTA': 'Alerta (<60 días)',
      'ADVERTENCIA': 'Advertencia (<90 días)'
    };
    return textos[nivel] || nivel;
  }

  formatFechaVencimiento(fechaStr: string): string {
    if (!fechaStr) return 'N/A';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  getUrgenciaTexto(diasRestantes: number): string {
    if (diasRestantes < 0) return 'VENCIDO';
    if (diasRestantes === 0) return 'Vence hoy';
    if (diasRestantes === 1) return 'Vence mañana';
    return `Vence en ${diasRestantes} días`;
  }
}
