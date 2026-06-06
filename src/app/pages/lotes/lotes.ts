import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoteService, LoteResponse } from '../../services/lote.service';

@Component({
  selector: 'app-lotes',
  imports: [CommonModule, FormsModule],
  templateUrl: './lotes.html',
  styleUrl: './lotes.scss'
})
export class LotesComponent implements OnInit {
  private loteService = inject(LoteService);

  lotes: LoteResponse[] = [];
  filteredLotes: LoteResponse[] = [];
  filterEstado: 'todos' | 'activos' | 'bloqueados' = 'todos';
  
  showBloqueoModal = false;
  showDesbloqueoModal = false;
  loteSeleccionado: LoteResponse | null = null;
  motivo = '';
  
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  ngOnInit() {
    this.loadLotes();
  }

  loadLotes() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.loteService.obtenerTodosLosLotes().subscribe({
      next: (lotes) => {
        this.lotes = lotes;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading lotes:', error);
        this.errorMessage = 'Error al cargar los lotes';
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    if (this.filterEstado === 'todos') {
      this.filteredLotes = this.lotes;
    } else if (this.filterEstado === 'activos') {
      this.filteredLotes = this.lotes.filter(l => l.estado);
    } else {
      this.filteredLotes = this.lotes.filter(l => !l.estado);
    }
  }

  onFilterChange() {
    this.applyFilter();
  }

  openBloqueoModal(lote: LoteResponse) {
    this.loteSeleccionado = lote;
    this.motivo = '';
    this.showBloqueoModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openDesbloqueoModal(lote: LoteResponse) {
    this.loteSeleccionado = lote;
    this.motivo = '';
    this.showDesbloqueoModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeBloqueoModal() {
    this.showBloqueoModal = false;
    this.loteSeleccionado = null;
    this.motivo = '';
  }

  closeDesbloqueoModal() {
    this.showDesbloqueoModal = false;
    this.loteSeleccionado = null;
    this.motivo = '';
  }

  confirmarBloqueo() {
    if (!this.loteSeleccionado || !this.motivo.trim()) {
      this.errorMessage = 'Por favor ingrese el motivo del bloqueo';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.loteService.bloquearLote(this.loteSeleccionado.id, this.motivo).subscribe({
      next: (lote) => {
        this.successMessage = `Lote ${lote.codigoLote} bloqueado exitosamente`;
        this.closeBloqueoModal();
        this.loadLotes();
      },
      error: (error) => {
        console.error('Error bloqueando lote:', error);
        this.errorMessage = error.error?.message || 'Error al bloquear el lote';
        this.isLoading = false;
      }
    });
  }

  confirmarDesbloqueo() {
    if (!this.loteSeleccionado || !this.motivo.trim()) {
      this.errorMessage = 'Por favor ingrese el motivo del desbloqueo';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.loteService.desbloquearLote(this.loteSeleccionado.id, this.motivo).subscribe({
      next: (lote) => {
        this.successMessage = `Lote ${lote.codigoLote} desbloqueado exitosamente`;
        this.closeDesbloqueoModal();
        this.loadLotes();
      },
      error: (error) => {
        console.error('Error desbloqueando lote:', error);
        this.errorMessage = error.error?.message || 'Error al desbloquear el lote';
        this.isLoading = false;
      }
    });
  }

  getEstadoClass(lote: LoteResponse): string {
    return lote.estado ? 'estado-activo' : 'estado-bloqueado';
  }

  getVencimientoClass(lote: LoteResponse): string {
    if (lote.diasHastaVencimiento < 0) return 'vencido';
    if (lote.diasHastaVencimiento <= 30) return 'proximo';
    return 'normal';
  }
}
