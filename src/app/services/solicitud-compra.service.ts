import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SolicitudCompraRequest {
  productoId: number;
  proveedorId: number;
  cantidadSolicitada: number;
  notas?: string;
}

export interface SolicitudCompraResponse {
  id: number;
  sedeId: number;
  sedeNombre: string;
  productoId: number;
  productoNombre: string;
  proveedorId: number;
  proveedorNombre: string;
  cantidadSolicitada: number;
  estado: string;
  notas: string;
  emailEnviado: boolean;
  solicitadoPorId: number;
  solicitadoPorNombre: string;
  creadaEn: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudCompraService {
  private apiUrl = 'http://172.200.21.101:8080/api/solicitudes-compra';

  constructor(private http: HttpClient) { }

  obtenerSolicitudes(): Observable<SolicitudCompraResponse[]> {
    return this.http.get<SolicitudCompraResponse[]>(this.apiUrl);
  }

  obtenerSolicitudPorId(id: number): Observable<SolicitudCompraResponse> {
    return this.http.get<SolicitudCompraResponse>(`${this.apiUrl}/${id}`);
  }

  crearSolicitud(request: SolicitudCompraRequest): Observable<SolicitudCompraResponse> {
    return this.http.post<SolicitudCompraResponse>(this.apiUrl, request);
  }

  actualizarEstado(id: number, estado: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/estado?estado=${estado}`, {});
  }

  marcarEmailEnviado(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/marcar-email-enviado`, {});
  }
}
