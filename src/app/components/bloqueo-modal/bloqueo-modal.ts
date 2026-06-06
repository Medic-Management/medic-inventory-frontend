import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bloqueo-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bloqueo-modal.html',
  styleUrl: './bloqueo-modal.scss'
})
export class BloqueoModalComponent {
  @Input() isOpen = false;
  @Input() productName = '';
  @Input() isBlocked = false; // true = desbloquear, false = bloquear
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<string>();

  motivoBloqueo = '';

  onClose() {
    this.motivoBloqueo = '';
    this.close.emit();
  }

  onConfirm() {
    if (!this.isBlocked && (!this.motivoBloqueo || this.motivoBloqueo.trim().length === 0)) {
      alert('Debe especificar un motivo de bloqueo');
      return;
    }
    this.confirm.emit(this.motivoBloqueo);
    this.motivoBloqueo = '';
  }
}
