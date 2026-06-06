import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudCompraService, SolicitudCompraResponse } from '../../services/solicitud-compra.service';

@Component({
  selector: 'app-pedidos-sin-confirmar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos-sin-confirmar.html',
  styleUrl: './pedidos-sin-confirmar.scss',
})
export class PedidosSinConfirmarComponent implements OnInit {
  private solicitudService = inject(SolicitudCompraService);

  pedidosSinConfirmar: SolicitudCompraResponse[] = [];
  pedidosEnviados: SolicitudCompraResponse[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.loading = true;

    // Cargar pedidos sin confirmar (> 48h)
    this.solicitudService.obtenerSolicitudesSinConfirmar().subscribe({
      next: (pedidos) => {
        this.pedidosSinConfirmar = pedidos;
      },
      error: (error) => {
        console.error('Error loading pedidos sin confirmar:', error);
      }
    });

    // Cargar todos los pedidos enviados (para mostrar botón de confirmar)
    this.solicitudService.obtenerSolicitudesEnviadas().subscribe({
      next: (pedidos) => {
        this.pedidosEnviados = pedidos;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pedidos enviados:', error);
        this.loading = false;
      }
    });
  }

  confirmarAcuse(pedido: SolicitudCompraResponse) {
    if (!confirm(`¿Confirmar que se recibió el acuse de recibo del proveedor ${pedido.proveedorNombre} para el Pedido #${pedido.id}?`)) {
      return;
    }

    this.solicitudService.confirmarAcuseRecibo(pedido.id).subscribe({
      next: () => {
        this.successMessage = `✅ Pedido #${pedido.id} confirmado exitosamente (CP010)`;
        this.errorMessage = '';

        // Recargar listas
        setTimeout(() => {
          this.cargarPedidos();
          this.successMessage = '';
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al confirmar el pedido';
        this.successMessage = '';
      }
    });
  }

  calcularHorasTranscurridas(fechaCreacion: string): number {
    if (!fechaCreacion) return 0;
    const fecha = new Date(fechaCreacion);
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    return Math.floor(diff / (1000 * 60 * 60));
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
