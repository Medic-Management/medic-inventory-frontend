import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss',
})
export class ConfirmationModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirmación';
  @Input() message: string = 'Confirmar el envío del correo';
  @Input() cancelText: string = 'Descartar';
  @Input() confirmText: string = 'Enviar';

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
