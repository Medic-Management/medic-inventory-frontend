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
  private apiUrl = 'https://unburglarized-claude-dovetailed.ngrok-free.dev/api/dispensaciones';

  constructor(private http: HttpClient) {}

  registrarDispensacion(request: DispensacionRequest): Observable<DispensacionResponse> {
    return this.http.post<DispensacionResponse>(this.apiUrl, request);
  }

  obtenerMisDispensaciones(): Observable<DispensacionResponse[]> {
    return this.http.get<DispensacionResponse[]>(`${this.apiUrl}/mis-dispensaciones`);
  }
}
