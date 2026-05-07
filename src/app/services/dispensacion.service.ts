import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DispensacionRequest {
  productoId: number;
  loteId: number;
  cantidad: number;
  motivo?: string;
  documentoReferencia?: string;
}

export interface DispensacionResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  loteId: number;
  codigoLote: string;
  cantidad: number;
  motivo: string;
  documentoReferencia: string;
  ocurrioEn: string;
  dispensadoPor: number;
  dispensadoPorNombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class DispensacionService {
  private apiUrl = 'http://172.200.21.101:8080/api/dispensaciones';

  constructor(private http: HttpClient) {}

  registrarDispensacion(request: DispensacionRequest): Observable<DispensacionResponse> {
    return this.http.post<DispensacionResponse>(this.apiUrl, request);
  }

  obtenerMisDispensaciones(): Observable<DispensacionResponse[]> {
    return this.http.get<DispensacionResponse[]>(`${this.apiUrl}/mis-dispensaciones`);
  }

  descargarComprobante(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/comprobante`, {
      responseType: 'blob'
    });
  }
}
