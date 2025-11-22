import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOptions {
  inStock: boolean;
  lowStock: boolean;
  critical: boolean;
  outOfStock: boolean;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  expirationRange: string;
  supplier: string;
}

@Component({
  selector: 'app-filter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-modal.html',
  styleUrl: './filter-modal.scss',
})
export class FilterModalComponent {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() applyFilters = new EventEmitter<FilterOptions>();

  filters: FilterOptions = {
    inStock: false,
    lowStock: false,
    critical: false,
    outOfStock: false,
    category: '',
    priceMin: null,
    priceMax: null,
    expirationRange: '',
    supplier: ''
  };

  onClose() {
    this.closeModal.emit();
  }

  onClear() {
    this.filters = {
      inStock: false,
      lowStock: false,
      critical: false,
      outOfStock: false,
      category: '',
      priceMin: null,
      priceMax: null,
      expirationRange: '',
      supplier: ''
    };
  }

  onApply() {
    this.applyFilters.emit(this.filters);
    this.closeModal.emit();
  }
}
