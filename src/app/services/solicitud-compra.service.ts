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

  // HU-08: Editar borrador
  editarBorrador(id: number, request: SolicitudCompraRequest): Observable<SolicitudCompraResponse> {
    return this.http.put<SolicitudCompraResponse>(`${this.apiUrl}/${id}/editar`, request);
  }

  // HU-08: Aprobar borrador
  aprobarBorrador(id: number): Observable<SolicitudCompraResponse> {
    return this.http.put<SolicitudCompraResponse>(`${this.apiUrl}/${id}/aprobar`, {});
  }

  // HU-09: Registrar fallo
  registrarFalloEnvio(id: number, motivo: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/registrar-fallo?motivo=${encodeURIComponent(motivo)}`, {});
  }

  // HU-09/HU-19: Reenviar pedido
  reenviarPedido(id: number): Observable<SolicitudCompraResponse> {
    return this.http.put<SolicitudCompraResponse>(`${this.apiUrl}/${id}/reenviar`, {});
  }

  // HU-04: Generar pedido automático
  generarPedidoAutomatico(productoId: number, proveedorId: number, cantidad: number,
                         stockActual: number, nivelAlerta: number): Observable<SolicitudCompraResponse> {
    const params = `?productoId=${productoId}&proveedorId=${proveedorId}&cantidad=${cantidad}&stockActual=${stockActual}&nivelAlerta=${nivelAlerta}`;
    return this.http.post<SolicitudCompraResponse>(`${this.apiUrl}/generar-automatico${params}`, {});
  }
}
