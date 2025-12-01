import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EntradaRequest {
  productoId: number;
  codigoLote: string;
  fechaVencimiento: string;
  cantidad: number;
  documentoReferencia: string;
  observaciones?: string;
}

export interface EntradaResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  loteId: number;
  codigoLote: string;
  cantidad: number;
  documentoReferencia: string;
  ocurrioEn: string;
  registradoPor: number;
  registradoPorNombre: string;
  stockAnterior: number;
  stockNuevo: number;
}

@Injectable({
  providedIn: 'root'
})
export class EntradaService {
  private apiUrl = 'http://172.200.21.101:8080/api/entradas';

  constructor(private http: HttpClient) { }

  registrarEntrada(request: EntradaRequest): Observable<EntradaResponse> {
    return this.http.post<EntradaResponse>(this.apiUrl, request);
  }

  // HU-01: Descargar comprobante PDF de entrada
  descargarComprobante(entradaId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${entradaId}/comprobante`, {
      responseType: 'blob'
    });
  }
}
