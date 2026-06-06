import { Component, OnInit } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [NgClass, CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class OrdersComponent implements OnInit {
  // CP024: Datos de órdenes desde el backend
  allOrders: Order[] = [];
  displayedOrders: Order[] = [];

  // CP024: Estadísticas
  stats = {
    totalOrders: 0,
    totalReceived: 0,
    receivedAmount: 0,
    totalCancelled: 0,
    cancelledAmount: 0,
    inTransit: 0,
    inTransitAmount: 0
  };

  // CP024: Filtros
  selectedStatus: string = 'TODAS';
  searchTerm: string = '';

  // CP024: Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // CP024: Modal de historial
  showHistoryModal: boolean = false;
  historyOrders: Order[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  // CP024: Cargar órdenes desde el backend
  loadOrders() {
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.allOrders = orders;
        this.applyFilters();
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error al cargar órdenes:', error);
        alert('Error al cargar las órdenes');
      }
    });
  }

  // CP024: Calcular estadísticas
  calculateStats() {
    this.stats.totalOrders = this.allOrders.length;

    const delivered = this.allOrders.filter(o => o.status === 'DELIVERED');
    this.stats.totalReceived = delivered.length;
    this.stats.receivedAmount = delivered.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const cancelled = this.allOrders.filter(o => o.status === 'CANCELLED');
    this.stats.totalCancelled = cancelled.length;
    this.stats.cancelledAmount = cancelled.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const inTransit = this.allOrders.filter(o => o.status === 'IN_TRANSIT');
    this.stats.inTransit = inTransit.length;
    this.stats.inTransitAmount = inTransit.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  // CP024: Aplicar filtros
  applyFilters() {
    let filtered = [...this.allOrders];

    // Filtrar por estado
    if (this.selectedStatus !== 'TODAS') {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }

    // Filtrar por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(term) ||
        (order.supplier?.nombre && order.supplier.nombre.toLowerCase().includes(term))
      );
    }

    this.displayedOrders = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  // CP024: Obtener órdenes paginadas
  getPaginatedOrders(): Order[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.displayedOrders.slice(start, end);
  }

  // CP024: Cambiar página
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // CP024: Abrir modal de historial
  openHistoryModal() {
    this.showHistoryModal = true;
    this.historyOrders = [...this.allOrders].sort((a, b) => {
      return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    });
  }

  closeHistoryModal() {
    this.showHistoryModal = false;
  }

  // CP024: Traducir estado a español
  getStatusText(status: string): string {
    const statusMap: any = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmado',
      'IN_TRANSIT': 'En Camino',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  // CP024: Obtener clase CSS del estado
  getStatusClass(status: string): string {
    const classMap: any = {
      'PENDING': 'pending',
      'CONFIRMED': 'confirmed',
      'IN_TRANSIT': 'in-transit',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled'
    };
    return classMap[status] || 'pending';
  }

  // CP024: Formatear fecha
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE');
  }

  // CP024: Formatear moneda
  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }

  // CP024: Obtener total de items de una orden
  getTotalItems(order: Order): number {
    if (!order.items || order.items.length === 0) return 0;
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  openAddOrderModal() {
    console.log('Funcionalidad de agregar orden pendiente de implementación');
    alert('Esta funcionalidad estará disponible próximamente');
  }
}
