import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DownloadModalComponent } from '../../components/download-modal/download-modal';
import { RegisterExitModalComponent } from '../../components/register-exit-modal/register-exit-modal';
import { ExportService } from '../../services/export';
import { DispensacionService } from '../../services/dispensacion.service';

interface Product {
  id?: number;
  name: string;
  batchNumber: string;
  expirationDate: string;
  quantity: number;
  supplierName: string;
  supplierContact: string;
  initialStock: number;
  remainingStock: number;
  inTransit: number;
  imageUrl?: string;
  loteId?: number;
}

@Component({
  selector: 'app-product-detail',
  imports: [DownloadModalComponent, RegisterExitModalComponent],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailComponent implements OnInit {
  private exportService = inject(ExportService);
  private dispensacionService = inject(DispensacionService);
  private router = inject(Router);

  isDownloadModalOpen = false;
  isRegisterExitModalOpen = false;
  product: Product = {
    name: 'Paracetamol 500mg',
    batchNumber: '456567',
    expirationDate: '13/10/25',
    quantity: 34,
    supplierName: 'Ronald Martin',
    supplierContact: '987 898 677',
    initialStock: 34,
    remainingStock: 34,
    inTransit: 34,
    imageUrl: ''
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Aquí se cargaría el producto desde el servicio
    // basado en el ID de la ruta
    const productData = history.state.product;
    if (productData) {
      this.product = {
        ...this.product,
        ...productData
      };
    }
  }

  openDownloadModal() {
    this.isDownloadModalOpen = true;
  }

  closeDownloadModal() {
    this.isDownloadModalOpen = false;
  }

  onDownload(format: 'excel' | 'pdf') {
    const exportData = [{
      nombre: this.product.name,
      numeroDeLote: this.product.batchNumber,
      fechaVencimiento: this.product.expirationDate,
      cantidad: this.product.quantity,
      proveedor: this.product.supplierName,
      contactoProveedor: this.product.supplierContact,
      stockInicial: this.product.initialStock,
      stockRestante: this.product.remainingStock,
      enCamino: this.product.inTransit
    }];

    const filename = `producto_${this.product.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'excel') {
      this.exportService.exportToExcel(exportData, filename);
    } else {
      this.exportService.exportToPDF(exportData, filename);
    }
  }

  openRegisterExitModal() {
    this.isRegisterExitModalOpen = true;
  }

  closeRegisterExitModal() {
    this.isRegisterExitModalOpen = false;
  }

  onRegisterExit(exitData: any) {
    if (!this.product.id || !this.product.loteId) {
      alert('Error: Faltan datos del producto o lote');
      return;
    }

    const request = {
      productoId: this.product.id,
      loteId: this.product.loteId,
      cantidad: exitData.quantity,
      motivo: 'Dispensación',
      documentoReferencia: ''
    };

    this.dispensacionService.registrarDispensacion(request).subscribe({
      next: (response) => {
        console.log('Dispensación registrada:', response);
        // Actualizar stock localmente
        this.product.remainingStock = Math.max(0, this.product.remainingStock - exitData.quantity);
        this.product.quantity = this.product.remainingStock;

        // Redirigir al inventario
        setTimeout(() => {
          this.router.navigate(['/inventario']);
        }, 500);
      },
      error: (error) => {
        console.error('Error al registrar dispensación:', error);
        alert('Error al registrar la dispensación. Por favor, intente nuevamente.');
      }
    });
  }
}
