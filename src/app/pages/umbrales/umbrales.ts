import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UmbralStockService, UmbralStockRequest, UmbralStockResponse } from '../../services/umbral-stock.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-umbrales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './umbrales.html',
  styleUrl: './umbrales.scss',
})
export class UmbralesComponent implements OnInit {
  private umbralService = inject(UmbralStockService);
  private productService = inject(ProductService);

  umbrales: UmbralStockResponse[] = [];
  productos: any[] = [];
  showForm = false;
  isEdit = false;
  selectedId: number = 0;

  formData: UmbralStockRequest = {
    sedeId: 1, // Sede por defecto
    productoId: 0,
    minimo: 0,
    puntoPedido: 0,
    stockSeguridad: 0
  };

  ngOnInit() {
    this.loadUmbrales();
    this.loadProductos();
  }

  loadUmbrales() {
    this.umbralService.getAllUmbrales().subscribe({
      next: (umbrales) => {
        this.umbrales = umbrales;
      },
      error: (error) => console.error('Error:', error)
    });
  }

  loadProductos() {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.productos = products;
      },
      error: (error) => console.error('Error:', error)
    });
  }

  openCreateForm() {
    this.isEdit = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(umbral: UmbralStockResponse) {
    this.isEdit = true;
    this.showForm = true;
    this.selectedId = umbral.id;
    this.formData = {
      sedeId: umbral.sedeId,
      productoId: umbral.productoId,
      minimo: umbral.minimo,
      puntoPedido: umbral.puntoPedido || 0,
      stockSeguridad: umbral.stockSeguridad || 0
    };
  }

  resetForm() {
    this.formData = {
      sedeId: 1,
      productoId: 0,
      minimo: 0,
      puntoPedido: 0,
      stockSeguridad: 0
    };
  }

  onSubmit() {
    if (this.isEdit) {
      this.umbralService.updateUmbral(this.selectedId, this.formData).subscribe({
        next: () => {
          this.loadUmbrales();
          this.showForm = false;
        },
        error: () => alert('Error al actualizar umbral')
      });
    } else {
      this.umbralService.createUmbral(this.formData).subscribe({
        next: () => {
          this.loadUmbrales();
          this.showForm = false;
        },
        error: () => alert('Error al crear umbral')
      });
    }
  }

  deleteUmbral(id: number) {
    if (confirm('¿Está seguro de eliminar este umbral?')) {
      this.umbralService.deleteUmbral(id).subscribe({
        next: () => this.loadUmbrales(),
        error: () => alert('Error al eliminar umbral')
      });
    }
  }
}
