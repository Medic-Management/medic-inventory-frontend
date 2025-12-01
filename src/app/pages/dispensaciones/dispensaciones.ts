import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DispensacionService, DispensacionRequest, DispensacionResponse } from '../../services/dispensacion.service';
import { ProductService } from '../../services/product.service';
import { LoteService, LoteResponse } from '../../services/lote.service';

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
  private loteService = inject(LoteService);

  productos: any[] = [];
  lotes: LoteResponse[] = [];
  dispensaciones: DispensacionResponse[] = [];
  showForm = false;
  successMessage = '';
  errorMessage = '';
  loadingLotes = false;
  sedeId = 1; // TODO: Obtener de la sesión del usuario

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

  // HU-11: Cargar lotes ordenados por FEFO (First Expired, First Out)
  onProductoChange() {
    if (this.formData.productoId > 0) {
      this.loadingLotes = true;
      this.lotes = [];
      this.formData.loteId = 0;

      this.loteService.obtenerLotesFEFO(this.formData.productoId, this.sedeId)
        .subscribe({
          next: (lotes) => {
            this.lotes = lotes;
            this.loadingLotes = false;

            // Auto-seleccionar el primer lote FEFO si existe
            if (lotes.length > 0) {
              this.formData.loteId = lotes[0].id;
            }
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

    const loteSeleccionado = this.lotes.find(l => l.id === this.formData.loteId);
    if (loteSeleccionado && this.formData.cantidad > loteSeleccionado.cantidadDisponible) {
      this.errorMessage = `La cantidad excede el stock disponible (${loteSeleccionado.cantidadDisponible} unidades)`;
      return;
    }

    this.dispensacionService.registrarDispensacion(this.formData).subscribe({
      next: (response) => {
        this.successMessage = `Dispensación registrada exitosamente. ${response.cantidad} unidades de ${response.productoNombre}`;
        this.errorMessage = '';
        this.resetForm();
        this.loadMisDispensaciones();
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

  descargarComprobante(dispensacionId: number) {
    this.dispensacionService.descargarComprobante(dispensacionId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `comprobante-dispensacion-${dispensacionId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error descargando comprobante:', error);
        this.errorMessage = 'Error al descargar el comprobante';
      }
    });
  }

  // HU-11: Helper methods para FEFO
  formatFechaVencimiento(fechaStr: string): string {
    if (!fechaStr) return 'N/A';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  getUrgenciaClass(diasHastaVencimiento: number): string {
    if (diasHastaVencimiento < 30) return 'urgencia-critica';
    if (diasHastaVencimiento < 60) return 'urgencia-alta';
    if (diasHastaVencimiento < 90) return 'urgencia-media';
    return 'urgencia-normal';
  }

  getUrgenciaTexto(diasHastaVencimiento: number): string {
    if (diasHastaVencimiento < 0) return 'VENCIDO';
    if (diasHastaVencimiento === 0) return 'Vence hoy';
    if (diasHastaVencimiento === 1) return 'Vence mañana';
    if (diasHastaVencimiento < 30) return `Vence en ${diasHastaVencimiento} días`;
    if (diasHastaVencimiento < 60) return `${diasHastaVencimiento} días`;
    if (diasHastaVencimiento < 90) return `${diasHastaVencimiento} días`;
    return `${diasHastaVencimiento} días`;
  }

  esPrimerLoteFEFO(index: number): boolean {
    return index === 0;
  }
}
