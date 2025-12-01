import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-download-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './download-modal.html',
  styleUrl: './download-modal.scss',
})
export class DownloadModalComponent {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() download = new EventEmitter<'excel' | 'pdf'>();

  downloadSuccess: boolean = false;

  onClose() {
    this.downloadSuccess = false;
    this.closeModal.emit();
  }

  onDownload(format: 'excel' | 'pdf') {
    this.download.emit(format);
    this.downloadSuccess = true;

    setTimeout(() => {
      this.onClose();
    }, 1500);
  }
}
