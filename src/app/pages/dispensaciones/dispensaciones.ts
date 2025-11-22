import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DispensacionService, DispensacionRequest, DispensacionResponse } from '../../services/dispensacion.service';
import { ProductService } from '../../services/product.service';
import { HttpClient } from '@angular/common/http';

interface Lote {
  id: number;
  codigoProductoProv: string;
  fechaVencimiento: string;
  stockDisponible: number;
}

@Component({
  selector: 'app-dispensaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispensaciones.html',
  styleUrl: './dispensaciones.scss',
})
export class DispensacionesComponent implements OnInit {
  private dispensacionService = inject(DispensacionService);
  private productService = inject(ProductService);
  private http = inject(HttpClient);

  productos: any[] = [];
  lotes: Lote[] = [];
  dispensaciones: DispensacionResponse[] = [];
  showForm = false;
  successMessage = '';
  errorMessage = '';
  loadingLotes = false;

  formData: DispensacionRequest = {
    productoId: 0,
    loteId: 0,
    cantidad: 0,
    motivo: '',
    documentoReferencia: ''
  };

  ngOnInit() {
    this.loadProductos();
    this.loadMisDispensaciones();
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

  loadMisDispensaciones() {
    this.dispensacionService.obtenerMisDispensaciones().subscribe({
      next: (dispensaciones) => {
        this.dispensaciones = dispensaciones;
      },
      error: (error) => {
        console.error('Error loading dispensaciones:', error);
      }
    });
  }

  onProductoChange() {
    if (this.formData.productoId > 0) {
      this.loadingLotes = true;
      this.lotes = [];
      this.formData.loteId = 0;

      // Obtener lotes disponibles del producto
      this.http.get<any[]>(`http://localhost:8080/api/products/${this.formData.productoId}/lotes-disponibles`)
        .subscribe({
          next: (lotes) => {
            this.lotes = lotes;
            this.loadingLotes = false;
          },
          error: (error) => {
            console.error('Error loading lotes:', error);
            this.errorMessage = 'Error al cargar los lotes disponibles';
            this.loadingLotes = false;
          }
        });
    } else {
      this.lotes = [];
      this.formData.loteId = 0;
    }
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
      loteId: 0,
      cantidad: 0,
      motivo: '',
      documentoReferencia: ''
    };
    this.lotes = [];
  }

  onSubmit() {
    if (!this.formData.productoId || !this.formData.loteId || this.formData.cantidad <= 0) {
      this.errorMessage = 'Por favor complete todos los campos obligatorios';
      return;
    }

    // Verificar que no exceda el stock disponible
    const loteSeleccionado = this.lotes.find(l => l.id === this.formData.loteId);
    if (loteSeleccionado && this.formData.cantidad > loteSeleccionado.stockDisponible) {
      this.errorMessage = `La cantidad excede el stock disponible (${loteSeleccionado.stockDisponible} unidades)`;
      return;
    }

    this.dispensacionService.registrarDispensacion(this.formData).subscribe({
      next: (response) => {
        this.successMessage = `Dispensación registrada exitosamente. ${response.cantidad} unidades de ${response.productoNombre}`;
        this.errorMessage = '';
        this.resetForm();
        this.loadMisDispensaciones(); // Recargar la lista
        setTimeout(() => {
          this.showForm = false;
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al registrar la dispensación. Por favor intente nuevamente.';
        this.successMessage = '';
        console.error('Error:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
