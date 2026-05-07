import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DispensacionService, DispensacionRequest } from '../../services/dispensacion.service';

// HU-11: Interfaz para lotes ordenados por FEFO
interface LoteResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  codigoLote: string;
  fechaVencimiento: string;
  cantidadDisponible: number;
  diasHastaVencimiento: number;
  estado: string;
  precioUnitario: number;
}

@Component({
  selector: 'app-dispensacion-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './dispensacion-modal.html',
  styleUrl: './dispensacion-modal.scss',
})
export class DispensacionModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() productId?: number;
  @Input() productName?: string;
  @Output() closeModal = new EventEmitter<void>();
  @Output() dispensationCompleted = new EventEmitter<void>();

  private http = inject(HttpClient);
  private dispensacionService = inject(DispensacionService);

  lotes: LoteResponse[] = [];
  loadingLotes = false;
  errorMessage = '';
  isSubmitting = false;

  formData: DispensacionRequest = {
    productoId: 0,
    loteId: 0,
    cantidad: 0,
    motivo: '',
    documentoReferencia: ''
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen && this.productId) {
      this.formData.productoId = this.productId;
      this.loadLotes();
    }
  }

  // HU-11 Escenario 2: Cargar lotes ordenados por FEFO (First Expired, First Out)
  loadLotes() {
    if (!this.productId) return;

    this.loadingLotes = true;
    this.lotes = [];
    this.formData.loteId = 0;
    this.errorMessage = '';

    // Endpoint FEFO: retorna lotes ordenados por fecha de vencimiento (más próximo primero)
    this.http.get<LoteResponse[]>(`http://172.200.21.101:8080/api/lotes/producto/${this.productId}/fefo`)
      .subscribe({
        next: (lotes) => {
          this.lotes = lotes.filter(l => l.cantidadDisponible > 0); // Solo lotes con stock
          this.loadingLotes = false;
          console.log('Lotes FEFO cargados:', this.lotes);
        },
        error: (error) => {
          console.error('Error loading lotes:', error);
          this.errorMessage = 'Error al cargar los lotes disponibles';
          this.loadingLotes = false;
        }
      });
  }

  // HU-11 Escenario 2: Determinar si un lote es el sugerido por FEFO (el primero)
  esPrimerLote(lote: LoteResponse): boolean {
    return this.lotes.length > 0 && this.lotes[0].id === lote.id;
  }

  onClose() {
    this.isOpen = false;
    this.closeModal.emit();
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      productoId: this.productId || 0,
      loteId: 0,
      cantidad: 0,
      motivo: '',
      documentoReferencia: ''
    };
    this.lotes = [];
    this.errorMessage = '';
    this.isSubmitting = false;
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

    this.isSubmitting = true;
    this.errorMessage = '';

    const request: DispensacionRequest = {
      productoId: Number(this.formData.productoId),
      loteId: Number(this.formData.loteId),
      cantidad: Number(this.formData.cantidad),
      motivo: this.formData.motivo || undefined,
      documentoReferencia: this.formData.documentoReferencia || undefined
    };

    console.log('Enviando dispensación:', JSON.stringify(request, null, 2));

    this.dispensacionService.registrarDispensacion(request).subscribe({
      next: (response) => {
        console.log('Dispensación registrada:', response);
        this.dispensationCompleted.emit();
        this.onClose();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al registrar la dispensación. Por favor intente nuevamente.';
        this.isSubmitting = false;
        console.error('Error:', error);
      }
    });
  }
}
