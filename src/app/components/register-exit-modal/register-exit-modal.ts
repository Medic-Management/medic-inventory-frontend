import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ExitData {
  name: string;
  batchNumber: string;
  expirationDate: string;
  quantity: number;
  supplier: string;
  productoId?: number;
  loteId?: number;
}

@Component({
  selector: 'app-register-exit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-exit-modal.html',
  styleUrl: './register-exit-modal.scss',
})
export class RegisterExitModalComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() productData: any = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() registerExit = new EventEmitter<ExitData>();

  exitData: ExitData = {
    name: '',
    batchNumber: '',
    expirationDate: '',
    quantity: 1,
    supplier: '',
    productoId: undefined,
    loteId: undefined
  };

  ngOnInit() {
    if (this.productData) {
      this.exitData = {
        name: this.productData.name || '',
        batchNumber: this.productData.batchNumber || '',
        expirationDate: this.productData.expirationDate || '',
        quantity: 1,
        supplier: this.productData.supplierName || '',
        productoId: this.productData.id,
        loteId: this.productData.loteId
      };
    }
  }

  ngOnChanges() {
    if (this.productData && this.isOpen) {
      this.exitData = {
        name: this.productData.name || '',
        batchNumber: this.productData.batchNumber || '',
        expirationDate: this.productData.expirationDate || '',
        quantity: 1,
        supplier: this.productData.supplierName || '',
        productoId: this.productData.id,
        loteId: this.productData.loteId
      };
    }
  }

  onClose() {
    this.closeModal.emit();
  }

  onDiscard() {
    this.exitData.quantity = 1;
    this.closeModal.emit();
  }

  onSubmit() {
    if (this.exitData.quantity > 0) {
      this.registerExit.emit(this.exitData);
      this.exitData.quantity = 1;
      this.closeModal.emit();
    }
  }
}
