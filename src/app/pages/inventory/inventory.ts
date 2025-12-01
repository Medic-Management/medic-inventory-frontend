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

interface Medication {
  id: number;
  name: string;
  price: string;
  quantity: number;
  alertValue: number;
  expirationDate: string;
  status: 'critical' | 'in-stock' | 'low-stock';
  statusText: string;
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
    DispensacionModalComponent
  ],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class InventoryComponent implements OnInit {
  private exportService = inject(ExportService);
  private restockService = inject(AutoRestockService);
  private productService = inject(ProductService);

  isModalOpen = false;
  isFilterModalOpen = false;
  isDownloadModalOpen = false;
  isSuccessModalOpen = false;
  isConfirmationModalOpen = false;
  isAlertModalOpen = false;
  isDispensacionModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
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
    notas: ''
  };

  deleteProductId?: number;
  deleteProductName?: string;

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
          statusText: this.getStatusText(this.mapStatus(p.status))
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

      if (filters.priceMin !== null || filters.priceMax !== null) {
        const price = parseFloat(med.price.replace('S/ ', ''));
        if (filters.priceMin !== null && price < filters.priceMin) return false;
        if (filters.priceMax !== null && price > filters.priceMax) return false;
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
      next: (product) => {
        this.editProductData = {
          id: product.id,
          codigo: product.codigo,
          nombre: product.nombre,
          notas: product.notas || ''
        };
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
      notas: ''
    };
  }

  onEditSubmit() {
    this.productService.updateProduct(this.editProductData.id, this.editProductData).subscribe({
      next: () => {
        this.successMessage = 'Producto actualizado exitosamente';
        this.isSuccessModalOpen = true;
        this.closeEditModal();
        this.loadProducts();
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
}
