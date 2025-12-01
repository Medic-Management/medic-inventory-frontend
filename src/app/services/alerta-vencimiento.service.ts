import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AlertaVencimientoResponse {
  loteId: number;
  codigoLote: string;
  productoId: number;
  productoNombre: string;
  fechaVencimiento: string;
  diasRestantes: number;
  nivel: string;
  cantidadTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertaVencimientoService {
  private apiUrl = '/api/alertas-vencimiento';

  constructor(private http: HttpClient) { }

  obtenerAlertasVencimiento(): Observable<AlertaVencimientoResponse[]> {
    return this.http.get<AlertaVencimientoResponse[]>(this.apiUrl);
  }

  obtenerAlertasCriticas(): Observable<AlertaVencimientoResponse[]> {
    return this.http.get<AlertaVencimientoResponse[]>(`${this.apiUrl}/criticas`);
  }

  obtenerAlertasPorNivel(nivel: string): Observable<AlertaVencimientoResponse[]> {
    return this.http.get<AlertaVencimientoResponse[]>(`${this.apiUrl}/nivel/${nivel}`);
  }
}
