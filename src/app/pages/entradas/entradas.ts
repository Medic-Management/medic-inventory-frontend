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
  lastEntradaId: number | null = null;

  formData: EntradaRequest = {
    productoId: 0,
    codigoLote: '',
    fechaVencimiento: '',
    cantidad: 0,
    documentoReferencia: '',
    observaciones: '',
    confirmarVencimientoCercano: false
  };

  ngOnInit() {
    this.loadProductos();
  }

  loadProductos() {
    this.productService.getProductsWithInventory().subscribe({
      next: (products) => {
        console.log('Productos cargados:', products);
        console.log('Cantidad de productos:', products.length);
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
      observaciones: '',
      confirmarVencimientoCercano: false
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
        this.lastEntradaId = response.id;
        this.successMessage = `Entrada registrada exitosamente. ID: ${response.id}, Stock anterior: ${response.stockAnterior}, Stock nuevo: ${response.stockNuevo}`;
        this.errorMessage = '';
        this.resetForm();
        setTimeout(() => {
          this.showForm = false;
          this.successMessage = '';
          this.lastEntradaId = null;
        }, 5000);
      },
      error: (error) => {
        console.error('Error completo:', error);

        // HU-01 Escenario 2: Manejar advertencia de vencimiento cercano
        if (error.error?.message && error.error.message.includes('VENCIMIENTO_CERCANO')) {
          const mensaje = error.error.message.replace('VENCIMIENTO_CERCANO: ', '');
          if (confirm(mensaje)) {
            // Usuario confirmó, reenviar con confirmación
            this.formData.confirmarVencimientoCercano = true;
            this.onSubmit(); // Reintentar con confirmación
            return;
          } else {
            this.errorMessage = 'Registro cancelado por el usuario';
            return;
          }
        }

        // HU-01 Escenario 3: Manejar error de lote duplicado
        if (error.error?.message && error.error.message.includes('LOTE_DUPLICADO')) {
          this.errorMessage = error.error.message.replace('LOTE_DUPLICADO: ', '');
          this.successMessage = '';
          return;
        }

        // Error genérico
        this.errorMessage = error.error?.message || 'Error al registrar la entrada. Por favor intente nuevamente.';
        this.successMessage = '';
      }
    });
  }

  // HU-01: Descargar comprobante PDF de entrada
  descargarComprobante(entradaId: number) {
    this.entradaService.descargarComprobante(entradaId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `comprobante-entrada-${entradaId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error descargando comprobante:', error);
        this.errorMessage = 'Error al descargar el comprobante';
      }
    });
  }
}
