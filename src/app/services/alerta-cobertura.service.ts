import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * HU-17: Sistema de Cobertura Temporal
 * Interfaz para alertas de cobertura de stock
 */
export interface AlertaCoberturaResponse {
  id: number;
  sedeId: number;
  sedeNombre: string;
  productoId: number;
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

/**
 * HU-17: Resumen de alertas de cobertura
 */
export interface ResumenCobertura {
  totalAlertas: number;
  alertasAltas: number;
  alertasMedias: number;
  alertasBajas: number;
}

/**
 * Servicio para gestionar alertas de cobertura de stock
 */
@Injectable({
  providedIn: 'root'
})
export class AlertaCoberturaService {
  private apiUrl = 'http://172.200.21.101:8080/api/alertas-cobertura';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las alertas de cobertura activas
   */
  getAlertasCoberturaActivas(): Observable<AlertaCoberturaResponse[]> {
    return this.http.get<AlertaCoberturaResponse[]>(`${this.apiUrl}/activas`);
  }

  /**
   * Ejecuta la verificación de cobertura y genera alertas
   */
  verificarCoberturaYGenerarAlertas(): Observable<AlertaCoberturaResponse[]> {
    return this.http.post<AlertaCoberturaResponse[]>(`${this.apiUrl}/verificar`, {});
  }

  /**
   * Obtiene el resumen de alertas de cobertura
   */
  getResumenCobertura(): Observable<ResumenCobertura> {
    return this.http.get<ResumenCobertura>(`${this.apiUrl}/resumen`);
  }
}
