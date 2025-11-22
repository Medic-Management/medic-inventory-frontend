import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ProductData {
  name: string;
  batchNumber: string;
  expirationDate: string;
  quantity: number;
  supplier: string;
  observations: string;
}

@Component({
  selector: 'app-add-product-modal',
  imports: [FormsModule],
  templateUrl: './add-product-modal.html',
  styleUrl: './add-product-modal.scss',
})
export class AddProductModalComponent {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveProduct = new EventEmitter<ProductData>();

  productData: ProductData = {
    name: '',
    batchNumber: '',
    expirationDate: '',
    quantity: 0,
    supplier: '',
    observations: ''
  };

  onClose() {
    this.isOpen = false;
    this.closeModal.emit();
    this.resetForm();
  }

  onSubmit() {
    this.saveProduct.emit(this.productData);
    this.resetForm();
  }

  private resetForm() {
    this.productData = {
      name: '',
      batchNumber: '',
      expirationDate: '',
      quantity: 0,
      supplier: '',
      observations: ''
    };
  }
}
