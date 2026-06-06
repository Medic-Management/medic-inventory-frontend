import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoteResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  codigoLote: string;
  fechaVencimiento: string;
  estado: boolean;
  precioUnitario: number;
  cantidadDisponible: number;
  diasHastaVencimiento: number;
}

export interface BloqueoLoteRequest {
  motivo: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoteService {
  private apiUrl = `${environment.apiUrl}/lotes`;

  constructor(private http: HttpClient) { }

  // HU-11: Obtener lotes FEFO (First Expired, First Out) por producto y sede
  obtenerLotesFEFO(productoId: number, sedeId: number): Observable<LoteResponse[]> {
    return this.http.get<LoteResponse[]>(`${this.apiUrl}/fefo`, {
      params: {
        productoId: productoId.toString(),
        sedeId: sedeId.toString()
      }
    });
  }

  // HU-21: Obtener todos los lotes (activos e inactivos)
  obtenerTodosLosLotes(): Observable<LoteResponse[]> {
    return this.http.get<LoteResponse[]>(this.apiUrl);
  }

  // HU-21: Obtener lotes bloqueados
  obtenerLotesBloqueados(): Observable<LoteResponse[]> {
    return this.http.get<LoteResponse[]>(`${this.apiUrl}/bloqueados`);
  }

  // HU-21: Bloquear un lote
  bloquearLote(loteId: number, motivo: string): Observable<LoteResponse> {
    const request: BloqueoLoteRequest = { motivo };
    return this.http.put<LoteResponse>(`${this.apiUrl}/${loteId}/bloquear`, request);
  }

  // HU-21: Desbloquear un lote
  desbloquearLote(loteId: number, motivo: string): Observable<LoteResponse> {
    const request: BloqueoLoteRequest = { motivo };
    return this.http.put<LoteResponse>(`${this.apiUrl}/${loteId}/desbloquear`, request);
  }
}
