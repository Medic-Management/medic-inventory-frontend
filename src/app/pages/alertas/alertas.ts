import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertaService, AlertaResponse } from '../../services/alerta.service';
import { StockAlertModalComponent } from '../../components/stock-alert-modal/stock-alert-modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, StockAlertModalComponent],
  templateUrl: './alertas.html',
  styleUrl: './alertas.scss'
})
export class AlertasComponent implements OnInit {
  private alertaService = inject(AlertaService);
  private router = inject(Router);

  alertas: AlertaResponse[] = [];
  loading = false;
  isAlertModalOpen = false;
  currentAlertData: any = null;
  selectedProductForRestock: number | null = null;

  private alertQueue: AlertaResponse[] = [];
  private currentAlertIndex = 0;
  private autoShowEnabled = false;

  ngOnInit() {
    this.loadAlertas();
  }

  loadAlertas() {
    this.loading = true;
    this.alertaService.obtenerAlertasActivas().subscribe({
      next: (alertas) => {
        this.alertas = alertas.sort((a, b) => a.stockActual - b.stockActual);
        this.loading = false;

        this.initAutoShowModals();
      },
      error: (error) => {
        console.error('Error loading alertas:', error);
        this.loading = false;
      }
    });
  }

  initAutoShowModals() {
    if (this.alertas.length > 0) {
      this.alertQueue = [...this.alertas];
      this.currentAlertIndex = 0;
      this.autoShowEnabled = true;
      setTimeout(() => {
        this.showNextAlert();
      }, 500);
    }
  }

  showNextAlert() {
    if (!this.autoShowEnabled || this.currentAlertIndex >= this.alertQueue.length) {
      this.autoShowEnabled = false;
      return;
    }

    const alerta = this.alertQueue[this.currentAlertIndex];
    this.openAlertModal(alerta);
    this.currentAlertIndex++;
  }

  openAlertModal(alerta: AlertaResponse) {
    this.currentAlertData = {
      productId: alerta.productoId,
      productName: alerta.productoNombre,
      alertType: this.getTipoTexto(alerta.tipo),
      currentStock: `${alerta.stockActual} unidades`,
      alertLevel: `Mínimo ${alerta.nivelAlerta} unidades`,
      detectionDate: new Date(alerta.disparadaEn).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      priority: alerta.nivel === 'ALTA' ? 'Alta' : 'Media',
      systemSuggestion: alerta.sugerencia || 'Reabastecer lo antes posible'
    };
    this.selectedProductForRestock = alerta.productoId;
    this.isAlertModalOpen = true;
  }

  onModalClose() {
    this.isAlertModalOpen = false;

    if (this.autoShowEnabled) {
      setTimeout(() => {
        this.showNextAlert();
      }, 300);
    }
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
      'STOCK_AGOTADO': 'Stock agotado',
      'STOCK_CRITICO': 'Stock crítico',
      'STOCK_BAJO': 'Stock bajo'
    };
    return textos[tipo] || tipo;
  }

  getNivelBadgeClass(nivel: string): string {
    return nivel === 'ALTA' ? 'badge-high' : 'badge-medium';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  resolverAlerta(alerta: AlertaResponse) {
    this.alertaService.resolverAlerta(alerta.id).subscribe({
      next: () => {
        this.loadAlertas();
      },
      error: (error) => {
        console.error('Error resolviendo alerta:', error);
      }
    });
  }
}
