import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MovimientoResponse {
  id: number;
  tipo: 'ENTRADA' | 'SALIDA';
  productoId: number;
  productoNombre: string;
  cantidad: number;
  documentoReferencia?: string;
  ocurrioEn: string;
  registradoPorNombre?: string;
  dispensadoPorNombre?: string;
  codigoLote: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // CP023: Obtener todas las entradas
  obtenerTodasLasEntradas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/entradas`);
  }

  // CP023: Obtener todas las dispensaciones (salidas)
  obtenerTodasLasDispensaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dispensaciones`);
  }

  // Descargar comprobante de entrada
  descargarComprobanteEntrada(entradaId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/entradas/${entradaId}/comprobante`, {
      responseType: 'blob'
    });
  }

  // Descargar comprobante de dispensación
  descargarComprobanteDispensacion(dispensacionId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/dispensaciones/${dispensacionId}/comprobante`, {
      responseType: 'blob'
    });
  }
}
