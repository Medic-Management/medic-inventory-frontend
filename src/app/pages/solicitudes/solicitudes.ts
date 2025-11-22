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
  productos: any[] = [];
  proveedores: any[] = [];
  showForm = false;
  successMessage = '';
  errorMessage = '';

  formData: SolicitudCompraRequest = {
    productoId: 0,
    proveedorId: 0,
    cantidadSolicitada: 0,
    notas: ''
  };

  ngOnInit() {
    this.loadSolicitudes();
    this.loadProductos();
    this.loadProveedores();
  }

  loadSolicitudes() {
    this.solicitudService.obtenerSolicitudes().subscribe({
      next: (solicitudes) => {
        this.solicitudes = solicitudes;
      },
      error: (error) => {
        console.error('Error loading solicitudes:', error);
      }
    });
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
      'PENDING': 'badge-warning',
      'SENT': 'badge-info',
      'CONFIRMED': 'badge-success',
      'IN_TRANSIT': 'badge-primary',
      'DELIVERED': 'badge-success',
      'CANCELLED': 'badge-danger'
    };
    return classes[estado] || 'badge-secondary';
  }

  getEstadoTexto(estado: string): string {
    const textos: any = {
      'PENDING': 'Pendiente',
      'SENT': 'Enviado',
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
}
