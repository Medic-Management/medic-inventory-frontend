import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable} from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuditLogResponse {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  accion: string;
  entidadTipo: string;
  entidadId: number;
  descripcion: string;
  ipAddress: string;
  fechaHora: string;
}

export interface AuditLogFilter {
  usuarioId?: number;
  accion?: string;
  entidadTipo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = `${environment.apiUrl}/audit-logs`;

  constructor(private http: HttpClient) {}

  getAllAuditLogs(): Observable<AuditLogResponse[]> {
    return this.http.get<AuditLogResponse[]>(this.apiUrl);
  }

  getAuditLogsWithFilters(filters: AuditLogFilter): Observable<AuditLogResponse[]> {
    let params = new HttpParams();

    if (filters.usuarioId) {
      params = params.set('usuarioId', filters.usuarioId.toString());
    }
    if (filters.accion) {
      params = params.set('accion', filters.accion);
    }
    if (filters.entidadTipo) {
      params = params.set('entidadTipo', filters.entidadTipo);
    }
    if (filters.fechaDesde) {
      params = params.set('fechaDesde', filters.fechaDesde);
    }
    if (filters.fechaHasta) {
      params = params.set('fechaHasta', filters.fechaHasta);
    }

    return this.http.get<AuditLogResponse[]>(`${this.apiUrl}/filter`, { params });
  }
}
