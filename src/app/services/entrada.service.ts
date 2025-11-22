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
  private apiUrl = 'https://unburglarized-claude-dovetailed.ngrok-free.dev/api/entradas';

  constructor(private http: HttpClient) { }

  registrarEntrada(request: EntradaRequest): Observable<EntradaResponse> {
    return this.http.post<EntradaResponse>(this.apiUrl, request);
  }
}
