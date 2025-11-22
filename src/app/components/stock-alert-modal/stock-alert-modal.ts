import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AutoRestockService } from '../../services/auto-restock';

interface AlertData {
  productName: string;
  alertType: string;
  currentStock: string;
  alertLevel: string;
  detectionDate: string;
  priority: string;
  systemSuggestion: string;
  productId?: number;
}

@Component({
  selector: 'app-stock-alert-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-alert-modal.html',
  styleUrl: './stock-alert-modal.scss',
})
export class StockAlertModalComponent {
  @Input() isOpen: boolean = false;
  @Input() alertData: AlertData = {
    productName: '',
    alertType: 'Stock crítico',
    currentStock: '5 cajas',
    alertLevel: 'Mínimo 8 cajas',
    detectionDate: '07/10/2025',
    priority: 'Alta',
    systemSuggestion: 'Reabastecer antes de 12/10/2025'
  };

  @Output() closeModal = new EventEmitter<void>();
  @Output() discard = new EventEmitter<void>();
  @Output() viewDetail = new EventEmitter<number>();
  @Output() requestRestock = new EventEmitter<number>();

  private router = inject(Router);
  private restockService = inject(AutoRestockService);

  onClose() {
    this.closeModal.emit();
  }

  onDiscard() {
    this.discard.emit();
    this.closeModal.emit();
  }

  onViewDetail() {
    if (this.alertData.productId) {
      // Extract numbers from strings like "5 cajas" or "Mínimo 8 cajas"
      const currentStock = parseInt(this.alertData.currentStock);
      const alertLevel = parseInt(this.alertData.alertLevel);

      // Calculate requested quantity (same logic as confirmRestock in inventory.ts)
      const requestedQuantity = Math.max(
        alertLevel * 3 - currentStock,
        alertLevel * 2
      );

      // Create restock request
      const restockRequest = {
        productId: this.alertData.productId,
        supplierId: 1, // Default supplier
        requestedQuantity: requestedQuantity,
        notes: `Solicitud desde alerta - ${this.alertData.alertType} (${currentStock} unidades)`
      };

      this.restockService.createRestockRequest(restockRequest).subscribe({
        next: (response) => {
          console.log('Restock request created:', response);
          // Navigate to restock detail page
          this.router.navigate(['/reabastecimiento', response.id]);
          this.closeModal.emit();
        },
        error: (error) => {
          console.error('Error creating restock request:', error);
          this.closeModal.emit();
        }
      });
    } else {
      this.closeModal.emit();
    }
  }

  onRequestRestock() {
    this.requestRestock.emit(this.alertData.productId);
    this.closeModal.emit();
  }
}
