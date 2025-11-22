import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmailRequest {
  destinatario: string;
  asunto: string;
  cuerpo: string;
  productoNombre: string;
  cantidadSolicitada: number;
  stockActual: number;
}

export interface EmailResponse {
  exito: boolean;
  mensaje: string;
  fechaEnvio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UiPathService {
  // URL del endpoint HTTP de UiPath Studio (configurable)
  private uipathApiUrl = 'http://localhost:8090/enviar-correo';

  constructor(private http: HttpClient) { }

  /**
   * Envía un correo electrónico a través de UiPath
   * @param emailData Datos del correo a enviar
   * @returns Observable con la respuesta de UiPath
   */
  enviarCorreo(emailData: EmailRequest): Observable<EmailResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<EmailResponse>(this.uipathApiUrl, emailData, { headers });
  }

  /**
   * Verifica si el servicio de UiPath está disponible
   * @returns Observable con el estado del servicio
   */
  verificarDisponibilidad(): Observable<any> {
    return this.http.get(`${this.uipathApiUrl}/health`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }
}
