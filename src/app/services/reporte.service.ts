import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoMasVendidoDTO {
  id: number;
  nombre: string;
  categoria: string;
  cantidadVendida: number;
  facturacion: number;
  porcentajeIncremento: number;
  cantidadRestante: number;
}

export interface CategoriaMasVendidaDTO {
  nombre: string;
  facturacion: number;
  porcentajeIncremento: number;
  cantidadProductos: number;
}

export interface DatoGraficoMensualDTO {
  mes: string;
  anio: number;
  ingresos: number;
  despachos: number;
}

export interface ResumenDespachosDTO {
  despachados: number;
  entregadas: number;
  ganancia: number;
  costoTotal: number;
}

export interface ResumenIngresosDTO {
  ordenes: number;
  costoTotal: number;
  canceladas: number;
  devueltos: number;
}

export interface MetricasDashboardDTO {
  totalProductos: number;
  productosStockCritico: number;
  productosStockBajo: number;
  cantidadTotalStock: number;
  proveedoresActivos: number;
  totalCategorias: number;
  enTransito: number;
  resumenDespachos: ResumenDespachosDTO;
  resumenIngresos: ResumenIngresosDTO;
}

export interface ReporteResponse {
  totalProductos: number;
  totalMovimientos: number;
  totalAlertas: number;
  totalSolicitudes: number;
  stockTotal: number;
  productosStockCritico: number;
  lotesProximosVencer: number;
  gananciaTotal: number;
  ingresosTotal: number;
  ventasTotal: number;
  valorNetoCompras: number;
  valorNetoVentas: number;
  gananciaMensual: number;
  gananciaAnual: number;
  productosMasVendidos: ProductoMasVendidoDTO[];
  categoriasMasVendidas: CategoriaMasVendidaDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'https://unburglarized-claude-dovetailed.ngrok-free.dev/api/reportes';

  constructor(private http: HttpClient) { }

  obtenerReporteGeneral(): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/general`);
  }

  obtenerProductosMasVendidos(): Observable<ProductoMasVendidoDTO[]> {
    return this.http.get<ProductoMasVendidoDTO[]>(`${this.apiUrl}/productos-mas-vendidos`);
  }

  obtenerCategoriasMasVendidas(): Observable<CategoriaMasVendidaDTO[]> {
    return this.http.get<CategoriaMasVendidaDTO[]>(`${this.apiUrl}/categorias-mas-vendidas`);
  }

  obtenerDatosGraficoMensual(): Observable<DatoGraficoMensualDTO[]> {
    return this.http.get<DatoGraficoMensualDTO[]>(`${this.apiUrl}/grafico-mensual`);
  }

  obtenerMetricasDashboard(): Observable<MetricasDashboardDTO> {
    return this.http.get<MetricasDashboardDTO>(`${this.apiUrl}/metricas-dashboard`);
  }
}
