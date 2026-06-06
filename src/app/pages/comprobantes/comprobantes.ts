import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComprobanteService } from '../../services/comprobante.service';

interface Comprobante {
  id: number;
  tipo: 'ENTRADA' | 'SALIDA';
  productoId: number;
  productoNombre: string;
  cantidad: number;
  documentoReferencia?: string;
  ocurrioEn: string;
  responsable: string;
  codigoLote: string;
}

@Component({
  selector: 'app-comprobantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comprobantes.html',
  styleUrl: './comprobantes.scss',
})
export class ComprobantesComponent implements OnInit {
  private comprobanteService = inject(ComprobanteService);

  comprobantes: Comprobante[] = [];
  comprobantesFiltrados: Comprobante[] = [];
  loading = false;
  errorMessage = '';

  // CP023: Filtros
  filtros = {
    tipo: 'TODOS', // TODOS, ENTRADA, SALIDA
    fechaDesde: '',
    fechaHasta: '',
    codigoProducto: '',
    nombreProducto: ''
  };

  ngOnInit() {
    this.cargarComprobantes();
  }

  cargarComprobantes() {
    this.loading = true;
    this.errorMessage = '';

    // Cargar entradas y salidas en paralelo
    Promise.all([
      this.comprobanteService.obtenerTodasLasEntradas().toPromise(),
      this.comprobanteService.obtenerTodasLasDispensaciones().toPromise()
    ]).then(([entradas, salidas]) => {
      // Mapear entradas
      const comprobantesEntradas: Comprobante[] = (entradas || []).map(e => ({
        id: e.id,
        tipo: 'ENTRADA' as const,
        productoId: e.productoId,
        productoNombre: e.productoNombre || 'Sin nombre',
        cantidad: e.cantidad,
        documentoReferencia: e.documentoReferencia,
        ocurrioEn: e.ocurrioEn,
        responsable: e.registradoPorNombre || 'N/A',
        codigoLote: e.codigoLote || 'N/A'
      }));

      // Mapear salidas
      const comprobantesSalidas: Comprobante[] = (salidas || []).map(s => ({
        id: s.id,
        tipo: 'SALIDA' as const,
        productoId: s.productoId,
        productoNombre: s.productoNombre || 'Sin nombre',
        cantidad: s.cantidad,
        documentoReferencia: s.documentoReferencia,
        ocurrioEn: s.ocurrioEn,
        responsable: s.dispensadoPorNombre || 'N/A',
        codigoLote: s.codigoLote || 'N/A'
      }));

      // Combinar y ordenar por fecha descendente
      this.comprobantes = [...comprobantesEntradas, ...comprobantesSalidas]
        .sort((a, b) => new Date(b.ocurrioEn).getTime() - new Date(a.ocurrioEn).getTime());

      this.aplicarFiltros();
      this.loading = false;
    }).catch(error => {
      console.error('Error cargando comprobantes:', error);
      this.errorMessage = 'Error al cargar los comprobantes';
      this.loading = false;
    });
  }

  // CP023: Aplicar filtros
  aplicarFiltros() {
    this.comprobantesFiltrados = this.comprobantes.filter(comp => {
      // Filtro por tipo
      if (this.filtros.tipo !== 'TODOS' && comp.tipo !== this.filtros.tipo) {
        return false;
      }

      // Filtro por fecha desde
      if (this.filtros.fechaDesde) {
        const fechaComp = new Date(comp.ocurrioEn);
        const fechaDesde = new Date(this.filtros.fechaDesde);
        if (fechaComp < fechaDesde) {
          return false;
        }
      }

      // Filtro por fecha hasta
      if (this.filtros.fechaHasta) {
        const fechaComp = new Date(comp.ocurrioEn);
        const fechaHasta = new Date(this.filtros.fechaHasta);
        fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
        if (fechaComp > fechaHasta) {
          return false;
        }
      }

      // Filtro por nombre de producto
      if (this.filtros.nombreProducto) {
        const nombreBusqueda = this.filtros.nombreProducto.toLowerCase();
        if (!comp.productoNombre.toLowerCase().includes(nombreBusqueda)) {
          return false;
        }
      }

      return true;
    });
  }

  limpiarFiltros() {
    this.filtros = {
      tipo: 'TODOS',
      fechaDesde: '',
      fechaHasta: '',
      codigoProducto: '',
      nombreProducto: ''
    };
    this.aplicarFiltros();
  }

  descargarComprobante(comprobante: Comprobante) {
    if (comprobante.tipo === 'ENTRADA') {
      this.comprobanteService.descargarComprobanteEntrada(comprobante.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `comprobante-entrada-${comprobante.id}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error descargando comprobante:', error);
          this.errorMessage = 'Error al descargar el comprobante de entrada';
        }
      });
    } else {
      this.comprobanteService.descargarComprobanteDispensacion(comprobante.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `comprobante-dispensacion-${comprobante.id}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error descargando comprobante:', error);
          this.errorMessage = 'Error al descargar el comprobante de dispensación';
        }
      });
    }
  }

  formatearFecha(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
