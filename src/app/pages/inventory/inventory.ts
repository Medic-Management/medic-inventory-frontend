import { Component, inject, OnInit } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AddProductModalComponent } from '../../components/add-product-modal/add-product-modal';
import { FilterModalComponent, FilterOptions } from '../../components/filter-modal/filter-modal';
import { DownloadModalComponent } from '../../components/download-modal/download-modal';
import { SuccessModalComponent } from '../../components/success-modal/success-modal';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal';
import { StockAlertModalComponent } from '../../components/stock-alert-modal/stock-alert-modal';
import { DispensacionModalComponent } from '../../components/dispensacion-modal/dispensacion-modal';
import { ExportService } from '../../services/export';
import { AutoRestockService } from '../../services/auto-restock';
import { ProductService } from '../../services/product.service';
import { UmbralStockService } from '../../services/umbral-stock.service';
import { BloqueoModalComponent } from '../../components/bloqueo-modal/bloqueo-modal';

interface Medication {
  id: number;
  name: string;
  price: string;
  quantity: number;
  alertValue: number;
  expirationDate: string;
  status: 'critical' | 'in-stock' | 'low-stock';
  statusText: string;
  // CP021: Campos de bloqueo
  bloqueado?: boolean;
  motivoBloqueo?: string;
  bloqueadoEn?: string;
}

@Component({
  selector: 'app-inventory',
  imports: [
    NgClass,
    CommonModule,
    FormsModule,
    AddProductModalComponent,
    FilterModalComponent,
    DownloadModalComponent,
    SuccessModalComponent,
    ConfirmationModalComponent,
    StockAlertModalComponent,
    DispensacionModalComponent,
    BloqueoModalComponent
  ],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class InventoryComponent implements OnInit {
  private exportService = inject(ExportService);
  private restockService = inject(AutoRestockService);
  private productService = inject(ProductService);
  private umbralStockService = inject(UmbralStockService);

  isModalOpen = false;
  isFilterModalOpen = false;
  isDownloadModalOpen = false;
  isSuccessModalOpen = false;
  isConfirmationModalOpen = false;
  isAlertModalOpen = false;
  isDispensacionModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isBloqueoModalOpen = false; // CP021
  activeFilters: FilterOptions | null = null;
  loading = false;

  successMessage = '';
  selectedProductForRestock?: number;
  selectedProductId?: number;
  selectedProductName?: string;

  editProductData: any = {
    id: 0,
    codigo: '',
    nombre: '',
    notas: '',
    quantity: 0,
    alertValue: 10,
    umbralId: null,
    minimo: 10,
    puntoPedido: 20,
    stockMaximo: null,
    stockSeguridad: null
  };

  deleteProductId?: number;
  deleteProductName?: string;

  // CP021: Variables para modal de bloqueo
  bloqueoProductId?: number;
  bloqueoProductName?: string;
  bloqueoIsBlocked = false;

  alertData: any = {
    productName: '',
    alertType: '',
    currentStock: '',
    alertLevel: '',
    detectionDate: '',
    priority: '',
    systemSuggestion: ''
  };

  allMedications: Medication[] = [];
  medications: Medication[] = [];
  paginatedMedications: Medication[] = [];
  userRole: string = '';

  stats = {
    totalCategories: 0,
    totalMedications: 0,
    totalUnits: 0,
    topRotatedCount: 0,
    criticalStock: 0,
    outOfStock: 0
  };

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  constructor(private router: Router) {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.userRole = user.role || '';
    }
  }

  hasAccess(roles: string[]): boolean {
    return roles.includes(this.userRole);
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProductsWithInventory().subscribe({
      next: (products: any[]) => {
        this.allMedications = products.map(p => ({
          id: p.id,
          name: p.nombre || p.codigo || 'Sin nombre',
          price: 'S/ ' + (p.precio ? Number(p.precio).toFixed(2) : '0.00'),
          quantity: p.cantidad || 0,
          alertValue: p.alertValue || 10,
          expirationDate: this.formatDate(p.fechaVencimiento),
          status: this.mapStatus(p.status),
          statusText: this.getStatusText(this.mapStatus(p.status)),
          // CP021: Campos de bloqueo
          bloqueado: p.bloqueado,
          motivoBloqueo: p.motivoBloqueo,
          bloqueadoEn: p.bloqueadoEn
        }));
        this.medications = [...this.allMedications];
        this.calculateStats();
        this.updatePagination();
        this.loading = false;
        console.log('Productos cargados:', this.medications.length);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  calculateStats() {
    this.stats.totalCategories = new Set(this.allMedications.map(m => m.name.split(' ')[0])).size;

    this.stats.totalMedications = this.allMedications.length;

    this.stats.totalUnits = this.allMedications.reduce((sum, m) => sum + m.quantity, 0);

    this.stats.topRotatedCount = Math.min(5, this.allMedications.length);

    // Critical stock count (status = 'critical' or 'low-stock')
    this.stats.criticalStock = this.allMedications.filter(m =>
      m.status === 'critical' || m.status === 'low-stock'
    ).length;

    this.stats.outOfStock = this.allMedications.filter(m => m.quantity === 0).length;
  }

  formatDate(dateStr: string): string {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    } catch {
      return 'N/A';
    }
  }

  mapStatus(status: string): 'critical' | 'in-stock' | 'low-stock' {
    if (status === 'CRITICAL') return 'critical';
    if (status === 'LOW_STOCK') return 'low-stock';
    return 'in-stock';
  }

  calculateStatus(quantity: number, alertValue: number): 'critical' | 'in-stock' | 'low-stock' {
    if (quantity === 0) return 'critical';
    if (quantity <= alertValue) return 'critical';
    if (quantity <= alertValue * 1.5) return 'low-stock';
    return 'in-stock';
  }

  getStatusText(status: 'critical' | 'in-stock' | 'low-stock'): string {
    const statusMap = {
      'critical': 'Crítico',
      'low-stock': 'Stock bajo',
      'in-stock': 'En stock'
    };
    return statusMap[status];
  }

  openAddProductModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onProductSaved(productData: any) {
    console.log('Product saved:', productData);
    this.isModalOpen = false;

    const newProductId = this.medications.length + 1;

    this.router.navigate(['/producto', newProductId], {
      state: {
        product: {
          name: productData.name,
          batchNumber: productData.batchNumber,
          expirationDate: productData.expirationDate,
          quantity: productData.quantity,
          supplierName: productData.supplier,
          supplierContact: '987 898 677', // Dato de ejemplo
          initialStock: productData.quantity,
          remainingStock: productData.quantity,
          inTransit: 0,
          imageUrl: ''
        }
      }
    });
  }

  openFilterModal() {
    this.isFilterModalOpen = true;
  }

  closeFilterModal() {
    this.isFilterModalOpen = false;
  }

  applyFilters(filters: FilterOptions) {
    this.activeFilters = filters;
    this.medications = this.allMedications.filter(med => {
      if (filters.inStock || filters.lowStock || filters.critical || filters.outOfStock) {
        const statusMatch =
          (filters.inStock && med.status === 'in-stock') ||
          (filters.lowStock && med.status === 'low-stock') ||
          (filters.critical && med.status === 'critical') ||
          (filters.outOfStock && med.quantity === 0);
        if (!statusMatch) return false;
      }

      // CP012: Filter by stock level instead of price
      if (filters.stockMin !== null || filters.stockMax !== null) {
        if (filters.stockMin !== null && med.quantity < filters.stockMin) return false;
        if (filters.stockMax !== null && med.quantity > filters.stockMax) return false;
      }

      // CP013: Filter by expiration date
      if (filters.expirationRange) {
        if (med.expirationDate === 'N/A') {
          return false;
        }

        // Parse date from DD/MM/YY format
        const parts = med.expirationDate.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt('20' + parts[2]); // Convert YY to YYYY
          const expirationDate = new Date(year, month, day);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (filters.expirationRange === 'expired') {
            // Show only expired products
            if (expirationDate >= today) return false;
          } else {
            // Show products expiring within X days
            const daysUntilExpiration = parseInt(filters.expirationRange);
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + daysUntilExpiration);

            if (expirationDate < today || expirationDate > futureDate) {
              return false;
            }
          }
        }
      }

      return true;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  openDownloadModal() {
    this.isDownloadModalOpen = true;
  }

  closeDownloadModal() {
    this.isDownloadModalOpen = false;
  }

  onDownload(format: 'excel' | 'pdf') {
    const exportData = this.medications.map(med => ({
      nombre: med.name,
      precio: med.price,
      cantidad: `${med.quantity} cajas`,
      valorAlerta: `${med.alertValue} cajas`,
      fechaVencimiento: med.expirationDate,
      disponibilidad: med.statusText
    }));

    const filename = `inventario_${new Date().toISOString().split('T')[0]}`;

    if (format === 'excel') {
      this.exportService.exportToExcel(exportData, filename);
    } else {
      this.exportService.exportToPDF(exportData, filename);
    }

    this.successMessage = 'Se descargó correctamente la lista de inventario.';
    this.isSuccessModalOpen = true;
  }

  closeSuccessModal() {
    this.isSuccessModalOpen = false;
  }

  onRequestRestock(productId?: number) {
    if (productId) {
      this.selectedProductForRestock = productId;
      this.isConfirmationModalOpen = true;
    }
  }

  closeConfirmationModal() {
    this.isConfirmationModalOpen = false;
  }

  confirmRestock() {
    if (this.selectedProductForRestock) {
      const product = this.medications.find(m => m.id === this.selectedProductForRestock);

      if (product) {
        const requestedQuantity = Math.max(
          product.alertValue * 3 - product.quantity,
          product.alertValue * 2
        );

        const restockRequest = {
          productId: product.id,
          supplierId: 1,
          requestedQuantity: requestedQuantity,
          notes: `Solicitud automática - Stock crítico (${product.quantity} unidades)`
        };

        this.restockService.createRestockRequest(restockRequest).subscribe({
          next: (response) => {
            console.log('Restock request created:', response);

            this.successMessage = 'Solicitud de reabastecimiento enviada correctamente.';
            this.isSuccessModalOpen = true;

            setTimeout(() => {
              this.router.navigate(['/reabastecimiento', response.id]);
            }, 2000);
          },
          error: (error) => {
            console.error('Error creating restock request:', error);
            this.successMessage = 'Error al crear la solicitud. Por favor, intente nuevamente.';
            this.isSuccessModalOpen = true;
          }
        });
      }
    }
    this.isConfirmationModalOpen = false;
  }

  closeAlertModal() {
    this.isAlertModalOpen = false;
  }

  openStockAlertModal(medication: Medication) {
    this.alertData = {
      productId: medication.id,
      productName: medication.name,
      alertType: medication.status === 'critical' ? 'Stock crítico' : 'Stock bajo',
      currentStock: `${medication.quantity} cajas`,
      alertLevel: `Mínimo ${medication.alertValue} cajas`,
      detectionDate: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      priority: medication.status === 'critical' ? 'Alta' : 'Media',
      systemSuggestion: `Reabastecer antes de ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
    };

    this.selectedProductForRestock = medication.id;

    this.isAlertModalOpen = true;
  }

  openDispensacionModal(medication: Medication) {
    this.selectedProductId = medication.id;
    this.selectedProductName = medication.name;
    this.isDispensacionModalOpen = true;
  }

  closeDispensacionModal() {
    this.isDispensacionModalOpen = false;
    this.selectedProductId = undefined;
    this.selectedProductName = undefined;
  }

  onDispensationCompleted() {
    this.loadProducts();

    this.successMessage = 'Dispensación registrada exitosamente. El inventario se ha actualizado.';
    this.isSuccessModalOpen = true;
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.medications.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedMedications = this.medications.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  openEditModal(medication: Medication) {
    this.productService.getProductById(medication.id).subscribe({
      next: (product: any) => {
        this.editProductData = {
          id: product.id,
          codigo: product.codigo || '',
          nombre: product.name || medication.name,
          notas: product.observations || '',
          quantity: product.quantity || medication.quantity || 0,
          alertValue: product.alertValue || medication.alertValue || 10,
          umbralId: null,
          minimo: 10,
          puntoPedido: 20,
          stockMaximo: null,
          stockSeguridad: null
        };

        // CP012: Load stock levels (umbral) - sede_id = 1 is default
        this.umbralStockService.getUmbralByProductoAndSede(medication.id, 1).subscribe({
          next: (umbral) => {
            this.editProductData.umbralId = umbral.id;
            this.editProductData.minimo = umbral.minimo;
            this.editProductData.puntoPedido = umbral.puntoPedido;
            this.editProductData.stockMaximo = umbral.stockMaximo;
            this.editProductData.stockSeguridad = umbral.stockSeguridad;
          },
          error: (error) => {
            console.log('No umbral found for this product, will create new one');
          }
        });

        this.isEditModalOpen = true;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        alert('Error al cargar el producto');
      }
    });
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editProductData = {
      id: 0,
      codigo: '',
      nombre: '',
      notas: '',
      quantity: 0,
      alertValue: 10,
      umbralId: null,
      minimo: 10,
      puntoPedido: 20,
      stockMaximo: null,
      stockSeguridad: null
    };
  }

  onEditSubmit() {
    // Transform data to match ProductRequest format
    const productRequest = {
      codigo: this.editProductData.codigo,
      name: this.editProductData.nombre, // Backend expects 'name' not 'nombre'
      quantity: this.editProductData.quantity,
      alertValue: this.editProductData.alertValue,
      observations: this.editProductData.notas
    };

    // First update the product
    this.productService.updateProduct(this.editProductData.id, productRequest).subscribe({
      next: () => {
        // CP012: Then update or create umbral stock
        const umbralRequest = {
          sedeId: 1, // Default sede
          productoId: this.editProductData.id,
          minimo: this.editProductData.minimo,
          puntoPedido: this.editProductData.puntoPedido,
          stockSeguridad: this.editProductData.stockSeguridad,
          stockMaximo: this.editProductData.stockMaximo
        };

        if (this.editProductData.umbralId) {
          // Update existing umbral
          this.umbralStockService.updateUmbral(this.editProductData.umbralId, umbralRequest).subscribe({
            next: () => {
              this.successMessage = 'Producto y niveles de stock actualizados exitosamente (CP012)';
              this.isSuccessModalOpen = true;
              this.closeEditModal();
              this.loadProducts();
            },
            error: (error) => {
              console.error('Error updating umbral:', error);
              this.successMessage = 'Producto actualizado, pero error al actualizar niveles de stock';
              this.isSuccessModalOpen = true;
              this.loadProducts();
            }
          });
        } else {
          // Create new umbral
          this.umbralStockService.createUmbral(umbralRequest).subscribe({
            next: () => {
              this.successMessage = 'Producto y niveles de stock creados exitosamente (CP012)';
              this.isSuccessModalOpen = true;
              this.closeEditModal();
              this.loadProducts();
            },
            error: (error) => {
              console.error('Error creating umbral:', error);
              this.successMessage = 'Producto actualizado, pero error al crear niveles de stock';
              this.isSuccessModalOpen = true;
              this.loadProducts();
            }
          });
        }
      },
      error: (error) => {
        console.error('Error updating product:', error);
        alert('Error al actualizar el producto');
      }
    });
  }

  confirmDelete(medication: Medication) {
    this.deleteProductId = medication.id;
    this.deleteProductName = medication.name;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deleteProductId = undefined;
    this.deleteProductName = undefined;
  }

  // HU-12 Escenario 3: Eliminar producto con validación de movimientos
  executeDelete() {
    if (this.deleteProductId) {
      this.productService.deleteProduct(this.deleteProductId).subscribe({
        next: () => {
          this.successMessage = 'Producto eliminado exitosamente';
          this.isSuccessModalOpen = true;
          this.closeDeleteModal();
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          // HU-12: Mostrar mensaje específico del backend
          let errorMsg = 'Error al eliminar el producto.';
          if (error.status === 409 || error.status === 400) {
            errorMsg = error.error?.message || 'El medicamento está en uso y no se puede eliminar.';
          } else if (error.status === 404) {
            errorMsg = 'Producto no encontrado.';
          }
          alert(errorMsg);
          this.closeDeleteModal();
        }
      });
    }
  }

  // CP021: Abrir modal de bloqueo
  openBloqueoModal(medication: Medication) {
    this.bloqueoProductId = medication.id;
    this.bloqueoProductName = medication.name;
    this.bloqueoIsBlocked = medication.bloqueado || false;
    this.isBloqueoModalOpen = true;
  }

  // CP021: Cerrar modal de bloqueo
  closeBloqueoModal() {
    this.isBloqueoModalOpen = false;
    this.bloqueoProductId = undefined;
    this.bloqueoProductName = undefined;
    this.bloqueoIsBlocked = false;
  }

  // CP021: Confirmar bloqueo/desbloqueo
  onConfirmBloqueo(motivo: string) {
    if (!this.bloqueoProductId) return;

    const userStr = localStorage.getItem('currentUser');
    const userId = userStr ? JSON.parse(userStr).userId : 1;

    if (this.bloqueoIsBlocked) {
      // Desbloquear
      this.productService.desbloquearProducto(this.bloqueoProductId).subscribe({
        next: () => {
          this.successMessage = 'Producto desbloqueado exitosamente';
          this.isSuccessModalOpen = true;
          this.closeBloqueoModal();
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error desbloqueando producto:', error);
          alert(error.error?.message || 'Error al desbloquear el producto');
          this.closeBloqueoModal();
        }
      });
    } else {
      // Bloquear
      this.productService.bloquearProducto(this.bloqueoProductId, motivo, userId).subscribe({
        next: () => {
          this.successMessage = 'Producto bloqueado exitosamente por retiro sanitario';
          this.isSuccessModalOpen = true;
          this.closeBloqueoModal();
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error bloqueando producto:', error);
          alert(error.error?.message || 'Error al bloquear el producto');
          this.closeBloqueoModal();
        }
      });
    }
  }
}
