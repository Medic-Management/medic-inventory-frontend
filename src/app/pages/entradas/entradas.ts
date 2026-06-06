import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EntradaService, EntradaRequest } from '../../services/entrada.service';
import { ProductService } from '../../services/product.service';
import { SolicitudCompraService, SolicitudCompraResponse } from '../../services/solicitud-compra.service';

@Component({
  selector: 'app-entradas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entradas.html',
  styleUrl: './entradas.scss',
})
export class EntradasComponent implements OnInit {
  private entradaService = inject(EntradaService);
  private productService = inject(ProductService);
  private solicitudService = inject(SolicitudCompraService);
  private router = inject(Router);

  productos: any[] = [];
  pedidosAprobados: SolicitudCompraResponse[] = [];
  showForm = false;
  showPedidosList = true;
  successMessage = '';
  errorMessage = '';
  lastEntradaId: number | null = null;
  pedidoSeleccionado: SolicitudCompraResponse | null = null;

  formData: EntradaRequest = {
    productoId: 0,
    codigoLote: '',
    fechaVencimiento: '',
    cantidad: 0,
    documentoReferencia: '',
    observaciones: '',
    confirmarVencimientoCercano: false
  };

  ngOnInit() {
    this.loadProductos();
    this.loadPedidosAprobados();
  }

  loadProductos() {
    this.productService.getProductsWithInventory().subscribe({
      next: (products) => {
        console.log('Productos cargados:', products);
        console.log('Cantidad de productos:', products.length);
        this.productos = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
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
      codigoLote: '',
      fechaVencimiento: '',
      cantidad: 0,
      documentoReferencia: '',
      observaciones: '',
      confirmarVencimientoCercano: false
    };
  }

  onSubmit() {
    if (!this.formData.productoId || !this.formData.codigoLote ||
        !this.formData.fechaVencimiento || this.formData.cantidad <= 0) {
      this.errorMessage = 'Por favor complete todos los campos obligatorios';
      return;
    }

    this.entradaService.registrarEntrada(this.formData).subscribe({
      next: (response) => {
        this.lastEntradaId = response.id;
        const productoNombre = this.productos.find(p => p.id === this.formData.productoId)?.nombre || 'Producto';

        // CP014: Mostrar mensaje y navegar al inventario
        alert(`✅ Entrada registrada exitosamente (CP014)\n\n` +
              `Producto: ${productoNombre}\n` +
              `Lote: ${response.codigoLote}\n` +
              `Cantidad: ${response.cantidad} unidades\n` +
              `Stock anterior: ${response.stockAnterior}\n` +
              `Stock nuevo: ${response.stockNuevo}\n\n` +
              `Redirigiendo al módulo de Inventario...`);

        this.errorMessage = '';
        this.resetForm();
        this.showForm = false;

        // CP014: Navegar al inventario para ver el medicamento recién ingresado
        this.router.navigate(['/inventario']);
      },
      error: (error) => {
        console.error('Error completo:', error);

        // HU-01 Escenario 2: Manejar advertencia de vencimiento cercano
        if (error.error?.message && error.error.message.includes('VENCIMIENTO_CERCANO')) {
          const mensaje = error.error.message.replace('VENCIMIENTO_CERCANO: ', '');
          if (confirm(mensaje)) {
            // Usuario confirmó, reenviar con confirmación
            this.formData.confirmarVencimientoCercano = true;
            this.onSubmit(); // Reintentar con confirmación
            return;
          } else {
            this.errorMessage = 'Registro cancelado por el usuario';
            return;
          }
        }

        // HU-01 Escenario 3: Manejar error de lote duplicado
        if (error.error?.message && error.error.message.includes('LOTE_DUPLICADO')) {
          this.errorMessage = error.error.message.replace('LOTE_DUPLICADO: ', '');
          this.successMessage = '';
          return;
        }

        // HU-04 Escenario 3: Manejar error de stock máximo excedido
        if (error.error?.message && error.error.message.includes('STOCK_MAXIMO_EXCEDIDO')) {
          this.errorMessage = error.error.message.replace('STOCK_MAXIMO_EXCEDIDO: ', '');
          this.successMessage = '';
          return;
        }

        // Error genérico
        this.errorMessage = error.error?.message || 'Error al registrar la entrada. Por favor intente nuevamente.';
        this.successMessage = '';
      }
    });
  }

  // HU-01: Descargar comprobante PDF de entrada
  descargarComprobante(entradaId: number) {
    this.entradaService.descargarComprobante(entradaId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `comprobante-entrada-${entradaId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error descargando comprobante:', error);
        this.errorMessage = 'Error al descargar el comprobante';
      }
    });
  }

  // CP011: Cargar pedidos aprobados para recepción
  loadPedidosAprobados() {
    this.solicitudService.obtenerPedidosAprobados().subscribe({
      next: (pedidos) => {
        console.log('Pedidos aprobados cargados:', pedidos);
        this.pedidosAprobados = pedidos;
      },
      error: (error) => {
        console.error('Error loading pedidos aprobados:', error);
      }
    });
  }

  // CP011: Seleccionar pedido y autorrellenar formulario
  seleccionarPedido(pedido: SolicitudCompraResponse) {
    this.pedidoSeleccionado = pedido;
    this.showPedidosList = false;
    this.showForm = true;

    // Autorrellenar formulario
    this.formData.productoId = pedido.productoId;
    this.formData.cantidad = pedido.cantidadSolicitada;
    this.formData.documentoReferencia = `PEDIDO-${pedido.id}`;
    this.formData.observaciones = `Recepción de pedido #${pedido.id} - ${pedido.proveedorNombre}`;

    this.successMessage = '';
    this.errorMessage = '';
  }

  // CP011: Cancelar selección de pedido
  cancelarSeleccionPedido() {
    this.pedidoSeleccionado = null;
    this.showPedidosList = true;
    this.showForm = false;
    this.resetForm();
  }
}
