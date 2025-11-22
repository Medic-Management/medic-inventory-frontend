import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success-modal.html',
  styleUrl: './success-modal.scss',
})
export class SuccessModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Descarga Exitosa';
  @Input() message: string = 'Se descargó correctamente la lista de inventario.';
  @Input() cancelText: string = 'Descartar';
  @Input() confirmText: string = 'Aceptar';

  @Output() closeModal = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onClose() {
    this.closeModal.emit();
  }

  onCancel() {
    this.cancel.emit();
    this.closeModal.emit();
  }

  onConfirm() {
    this.confirm.emit();
    this.closeModal.emit();
  }
}
