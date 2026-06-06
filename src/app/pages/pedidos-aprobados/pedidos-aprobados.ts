import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudCompraService, SolicitudCompraResponse } from '../../services/solicitud-compra.service';

@Component({
  selector: 'app-pedidos-aprobados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos-aprobados.html',
  styleUrls: ['./pedidos-aprobados.scss']
})
export class PedidosAprobadosComponent implements OnInit {
  private solicitudService = inject(SolicitudCompraService);

  pedidosAprobados: SolicitudCompraResponse[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';
  enviandoTodos = false;

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.loading = true;
    this.solicitudService.obtenerSolicitudesAprobadas().subscribe({
      next: (pedidos) => {
        this.pedidosAprobados = pedidos;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pedidos aprobados:', error);
        this.errorMessage = 'Error al cargar pedidos aprobados';
        this.loading = false;
      }
    });
  }

  enviarPedido(pedido: SolicitudCompraResponse) {
    if (!confirm(`¿Enviar Pedido #${pedido.id} al proveedor ${pedido.proveedorNombre}?\n\nSe creará un trabajo RPA para que UiPath procese el envío del correo.`)) {
      return;
    }

    this.solicitudService.enviarAlProveedor(pedido.id).subscribe({
      next: () => {
        this.successMessage = `✅ Pedido #${pedido.id} enviado al proveedor (CP009). UiPath procesará el envío.`;
        this.errorMessage = '';

        // Recargar listas
        setTimeout(() => {
          this.cargarPedidos();
          this.successMessage = '';
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al enviar el pedido';
        this.successMessage = '';
      }
    });
  }

  enviarTodos() {
    const total = this.pedidosAprobados.length;
    if (total === 0) {
      alert('No hay pedidos aprobados para enviar');
      return;
    }

    if (!confirm(`¿Enviar TODOS los ${total} pedidos aprobados a sus proveedores?\n\nSe crearán ${total} trabajos RPA para que UiPath procese los envíos.`)) {
      return;
    }

    this.enviandoTodos = true;
    this.solicitudService.enviarTodasAlProveedor().subscribe({
      next: (response) => {
        this.successMessage = `✅ ${response.message} - Total enviados: ${response.cantidad}`;
        this.errorMessage = '';
        this.enviandoTodos = false;

        // Recargar listas
        setTimeout(() => {
          this.cargarPedidos();
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al enviar los pedidos';
        this.successMessage = '';
        this.enviandoTodos = false;
      }
    });
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
