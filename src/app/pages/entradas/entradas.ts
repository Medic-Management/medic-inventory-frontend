import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntradaService, EntradaRequest } from '../../services/entrada.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-entradas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entradas.html',
  styleUrl: './entradas.scss',
})
export class EntradasComponent implements OnInit {
  private entradaService = inject(EntradaService);
  private productService = inject(ProductService);

  productos: any[] = [];
  showForm = false;
  successMessage = '';
  errorMessage = '';

  formData: EntradaRequest = {
    productoId: 0,
    codigoLote: '',
    fechaVencimiento: '',
    cantidad: 0,
    documentoReferencia: '',
    observaciones: ''
  };

  ngOnInit() {
    this.loadProductos();
  }

  loadProductos() {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.productos = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.resetForm();
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  resetForm() {
    this.formData = {
      productoId: 0,
      codigoLote: '',
      fechaVencimiento: '',
      cantidad: 0,
      documentoReferencia: '',
      observaciones: ''
    };
  }

  onSubmit() {
    if (!this.formData.productoId || !this.formData.codigoLote ||
        !this.formData.fechaVencimiento || this.formData.cantidad <= 0) {
      this.errorMessage = 'Por favor complete todos los campos obligatorios';
      return;
    }

    this.entradaService.registrarEntrada(this.formData).subscribe({
      next: (response) => {
        this.successMessage = `Entrada registrada exitosamente. Stock anterior: ${response.stockAnterior}, Stock nuevo: ${response.stockNuevo}`;
        this.errorMessage = '';
        this.resetForm();
        setTimeout(() => {
          this.showForm = false;
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al registrar la entrada. Por favor intente nuevamente.';
        this.successMessage = '';
        console.error('Error:', error);
      }
    });
  }
}
