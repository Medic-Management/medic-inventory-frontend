import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../services/order.service';

interface CalendarioGroup {
  fecha: Date;
  fechaStr: string;
  ordenes: Order[];
}

@Component({
  selector: 'app-calendario-recepciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario-recepciones.html',
  styleUrl: './calendario-recepciones.scss'
})
export class CalendarioRecepcionesComponent implements OnInit {
  private orderService = inject(OrderService);

  ordenes: Order[] = [];
  gruposPorFecha: CalendarioGroup[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    this.cargarCalendario();
  }

  cargarCalendario() {
    this.isLoading = true;
    this.orderService.getOrdersForCalendar().subscribe({
      next: (ordenes) => {
        this.ordenes = ordenes;
        this.agruparPorFecha();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando calendario:', error);
        this.errorMessage = 'Error al cargar el calendario de recepciones';
        this.isLoading = false;
      }
    });
  }

  agruparPorFecha() {
    const grupos = new Map<string, Order[]>();

    this.ordenes.forEach(orden => {
      if (orden.deliveryDate) {
        const fecha = new Date(orden.deliveryDate);
        const fechaKey = fecha.toISOString().split('T')[0];

        if (!grupos.has(fechaKey)) {
          grupos.set(fechaKey, []);
        }
        grupos.get(fechaKey)?.push(orden);
      }
    });

    this.gruposPorFecha = Array.from(grupos.entries()).map(([fechaKey, ordenes]) => ({
      fecha: new Date(fechaKey),
      fechaStr: this.formatearFecha(new Date(fechaKey)),
      ordenes: ordenes
    }));
  }

  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getEstadoClass(status: string): string {
    const clases: {[key: string]: string} = {
      'CONFIRMED': 'status-confirmed',
      'IN_TRANSIT': 'status-transit',
      'DELIVERED': 'status-delivered',
      'PENDING': 'status-pending',
      'CANCELLED': 'status-cancelled'
    };
    return clases[status] || '';
  }

  getEstadoTexto(status: string): string {
    const textos: {[key: string]: string} = {
      'CONFIRMED': 'Confirmado',
      'IN_TRANSIT': 'En tránsito',
      'DELIVERED': 'Entregado',
      'PENDING': 'Pendiente',
      'CANCELLED': 'Cancelado'
    };
    return textos[status] || status;
  }
}
