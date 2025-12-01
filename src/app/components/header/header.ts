import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertaService, AlertaResponse } from '../../services/alerta.service';
import { ToastService } from '../../services/toast.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent implements OnInit {
  private alertaService = inject(AlertaService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  alertas: AlertaResponse[] = [];
  showNotificationDropdown = false;
  alertCount = 0;
  private previousAlertCount = 0;
  private shownAlertIds = new Set<number>();

  ngOnInit() {
    this.loadAlertas();
    interval(30000).subscribe(() => {
      this.loadAlertas();
    });
  }

  loadAlertas() {
    this.alertaService.obtenerAlertasActivas().subscribe({
      next: (alertas) => {
        this.alertas = alertas.sort((a, b) => a.stockActual - b.stockActual).slice(0, 3);
        this.alertCount = alertas.length;

        this.checkForNewAlerts(alertas);
      },
      error: (error) => {
        console.error('Error loading alertas:', error);
      }
    });
  }

  checkForNewAlerts(alertas: AlertaResponse[]) {
    if (this.previousAlertCount === 0) {
      this.previousAlertCount = alertas.length;
      alertas.forEach(a => this.shownAlertIds.add(a.id));
      return;
    }

    const newAlerts = alertas.filter(a => !this.shownAlertIds.has(a.id));

    if (newAlerts.length > 0) {
      newAlerts.forEach(a => this.shownAlertIds.add(a.id));

      if (newAlerts.length === 1) {
        const alerta = newAlerts[0];
        const tipoTexto = this.getTipoTexto(alerta.tipo);
        this.toastService.warning(
          `${alerta.productoNombre} - ${tipoTexto} (${alerta.stockActual} unidades)`,
          8000
        );
      } else {
        this.toastService.warning(
          `Tienes ${newAlerts.length} nuevas alertas de stock pendientes`,
          8000
        );
      }
    }

    this.previousAlertCount = alertas.length;
  }

  toggleNotificationDropdown() {
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  closeNotificationDropdown() {
    this.showNotificationDropdown = false;
  }

  goToAlertas() {
    this.closeNotificationDropdown();
    this.router.navigate(['/alertas']);
  }

  getTipoBadgeClass(tipo: string): string {
    const classes: any = {
      'STOCK_AGOTADO': 'badge-critical',
      'STOCK_CRITICO': 'badge-critical',
      'STOCK_BAJO': 'badge-warning'
    };
    return classes[tipo] || 'badge-warning';
  }

  getTipoTexto(tipo: string): string {
    const textos: any = {
      'STOCK_AGOTADO': 'Agotado',
      'STOCK_CRITICO': 'Crítico',
      'STOCK_BAJO': 'Bajo'
    };
    return textos[tipo] || tipo;
  }
}
