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
  private uipathApiUrl = 'http://localhost:8090/enviar-correo';

  constructor(private http: HttpClient) { }

  enviarCorreo(emailData: EmailRequest): Observable<EmailResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<EmailResponse>(this.uipathApiUrl, emailData, { headers });
  }

  verificarDisponibilidad(): Observable<any> {
    return this.http.get(`${this.uipathApiUrl}/health`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }
}
