import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudCompraService, SolicitudCompraRequest, SolicitudCompraResponse } from '../../services/solicitud-compra.service';
import { ProductService } from '../../services/product.service';
import { SupplierManagementService } from '../../services/supplier-management.service';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.scss',
})
export class SolicitudesComponent implements OnInit {
  private solicitudService = inject(SolicitudCompraService);
  private productService = inject(ProductService);
  private supplierService = inject(SupplierManagementService);

  solicitudes: SolicitudCompraResponse[] = [];
  solicitudesFiltradas: SolicitudCompraResponse[] = [];
  productos: any[] = [];
  proveedores: any[] = [];
  showForm = false;
  showEditModal = false;
  successMessage = '';
  errorMessage = '';

  // Filtros
  filtroEstado = 'TODOS';

  // Edición
  solicitudEditando: SolicitudCompraResponse | null = null;

  formData: SolicitudCompraRequest = {
    productoId: 0,
    proveedorId: 0,
    cantidadSolicitada: 0,
    notas: ''
  };

  editFormData: SolicitudCompraRequest = {
    productoId: 0,
    proveedorId: 0,
    cantidadSolicitada: 0,
    notas: ''
  };

  userRole = '';

  ngOnInit() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.userRole = user.role || '';
    }

    this.loadSolicitudes();
    this.loadProductos();
    this.loadProveedores();
  }

  loadSolicitudes() {
    this.solicitudService.obtenerSolicitudes().subscribe({
      next: (solicitudes) => {
        this.solicitudes = solicitudes;
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error loading solicitudes:', error);
      }
    });
  }

  aplicarFiltros() {
    if (this.filtroEstado === 'TODOS') {
      this.solicitudesFiltradas = [...this.solicitudes];
    } else {
      this.solicitudesFiltradas = this.solicitudes.filter(s => s.estado === this.filtroEstado);
    }
  }

  onFiltroChange() {
    this.aplicarFiltros();
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

  loadProveedores() {
    this.supplierService.getAllSuppliers().subscribe({
      next: (suppliers) => {
        this.proveedores = suppliers;
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
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
      proveedorId: 0,
      cantidadSolicitada: 0,
      notas: ''
    };
  }

  onSubmit() {
    if (!this.formData.productoId || !this.formData.proveedorId || this.formData.cantidadSolicitada <= 0) {
      this.errorMessage = 'Por favor complete todos los campos obligatorios';
      return;
    }

    this.solicitudService.crearSolicitud(this.formData).subscribe({
      next: (response) => {
        this.successMessage = `Solicitud creada exitosamente. ID: ${response.id}`;
        this.errorMessage = '';
        this.resetForm();
        this.loadSolicitudes();
        setTimeout(() => {
          this.showForm = false;
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al crear la solicitud. Por favor intente nuevamente.';
        this.successMessage = '';
        console.error('Error:', error);
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: any = {
      'DRAFT': 'badge-draft',
      'PENDING': 'badge-warning',
      'SENT': 'badge-info',
      'SEND_FAILED': 'badge-danger',
      'CONFIRMED': 'badge-success',
      'IN_TRANSIT': 'badge-primary',
      'DELIVERED': 'badge-success',
      'CANCELLED': 'badge-secondary'
    };
    return classes[estado] || 'badge-secondary';
  }

  getEstadoTexto(estado: string): string {
    const textos: any = {
      'DRAFT': 'Borrador',
      'PENDING': 'Pendiente',
      'SENT': 'Enviado',
      'SEND_FAILED': 'Fallo de Envío',
      'CONFIRMED': 'Confirmado',
      'IN_TRANSIT': 'En Tránsito',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return textos[estado] || estado;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  // HU-08: Editar borrador
  abrirModalEdicion(solicitud: SolicitudCompraResponse) {
    if (solicitud.estado !== 'DRAFT') {
      this.errorMessage = 'Solo se pueden editar solicitudes en estado BORRADOR';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.solicitudEditando = solicitud;
    this.editFormData = {
      productoId: solicitud.productoId,
      proveedorId: solicitud.proveedorId,
      cantidadSolicitada: solicitud.cantidadSolicitada,
      notas: solicitud.notas || ''
    };
    this.showEditModal = true;
  }

  cerrarModalEdicion() {
    this.showEditModal = false;
    this.solicitudEditando = null;
    this.editFormData = {
      productoId: 0,
      proveedorId: 0,
      cantidadSolicitada: 0,
      notas: ''
    };
  }

  guardarEdicion() {
    if (!this.solicitudEditando) return;

    if (!this.editFormData.productoId || !this.editFormData.proveedorId || this.editFormData.cantidadSolicitada <= 0) {
      this.errorMessage = 'Por favor complete todos los campos obligatorios';
      return;
    }

    this.solicitudService.editarBorrador(this.solicitudEditando.id, this.editFormData).subscribe({
      next: () => {
        this.successMessage = 'Solicitud actualizada exitosamente';
        this.cerrarModalEdicion();
        this.loadSolicitudes();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al actualizar la solicitud';
        console.error('Error:', error);
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // HU-08: Aprobar borrador
  aprobarSolicitud(solicitud: SolicitudCompraResponse) {
    if (solicitud.estado !== 'DRAFT') {
      this.errorMessage = 'Solo se pueden aprobar solicitudes en estado BORRADOR';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (!confirm(`¿Está seguro de aprobar la solicitud #${solicitud.id}? Esto la enviará al proveedor.`)) {
      return;
    }

    this.solicitudService.aprobarBorrador(solicitud.id).subscribe({
      next: () => {
        this.successMessage = `Solicitud #${solicitud.id} aprobada exitosamente`;
        this.loadSolicitudes();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al aprobar la solicitud';
        console.error('Error:', error);
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // HU-09/HU-19: Reenviar pedido con fallo
  reenviarSolicitud(solicitud: SolicitudCompraResponse) {
    if (solicitud.estado !== 'SEND_FAILED') {
      this.errorMessage = 'Solo se pueden reenviar solicitudes con fallo de envío';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (!confirm(`¿Desea reenviar la solicitud #${solicitud.id} al proveedor?`)) {
      return;
    }

    this.solicitudService.reenviarPedido(solicitud.id).subscribe({
      next: () => {
        this.successMessage = `Solicitud #${solicitud.id} marcada para reenvío`;
        this.loadSolicitudes();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al reenviar la solicitud';
        console.error('Error:', error);
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // Permisos
  puedeEditarOAprobar(): boolean {
    return this.userRole === 'Jefe de Farmacia' || this.userRole === 'Administrador';
  }

  puedeAprobar(): boolean {
    return this.userRole === 'Jefe de Farmacia' || this.userRole === 'Administrador';
  }

  mostrarAcciones(solicitud: SolicitudCompraResponse): boolean {
    return (solicitud.estado === 'DRAFT' && this.puedeEditarOAprobar()) ||
           (solicitud.estado === 'SEND_FAILED' && this.puedeAprobar());
  }
}
