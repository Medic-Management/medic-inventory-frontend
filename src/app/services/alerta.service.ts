import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AlertaResponse {
  id: number;
  sedeId: number;
  productoId: number;
  sedeNombre: string;
  productoNombre: string;
  tipo: string;
  nivel: string;
  disparadaEn: string;
  resueltaEn?: string;
  activa: boolean;
  stockActual: number;
  nivelAlerta: number;
  sugerencia: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private apiUrl = 'http://172.200.21.101:8080/api/alertas';

  constructor(private http: HttpClient) { }

  obtenerAlertasActivas(): Observable<AlertaResponse[]> {
    return this.http.get<AlertaResponse[]>(`${this.apiUrl}/activas`);
  }

  verificarStockYGenerarAlertas(): Observable<AlertaResponse[]> {
    return this.http.post<AlertaResponse[]>(`${this.apiUrl}/verificar-stock`, {});
  }

  resolverAlerta(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/resolver`, {});
  }

  /**
   * HU-03 Escenario 2: Descargar reporte consolidado de alertas
   */
  descargarReporteConsolidado(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reporte-consolidado`, {
      responseType: 'blob'
    });
  }
}
