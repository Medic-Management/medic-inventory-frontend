import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MLHealthStatus,
  PicoDemandaResponse,
  RiesgoVencimientoResponse,
  ResumenPredicciones
} from '../models/ml-prediction.interface';

@Injectable({
  providedIn: 'root'
})
export class MlPredictionService {
  private apiUrl = 'http://localhost:8080/api/ml';

  constructor(private http: HttpClient) {}

  /**
   * Verifica el estado del servicio ML
   */
  checkHealth(): Observable<MLHealthStatus> {
    return this.http.get<MLHealthStatus>(`${this.apiUrl}/health`);
  }

  /**
   * Obtiene predicciones de picos de demanda para todos los productos
   */
  getPicosDemanda(): Observable<PicoDemandaResponse> {
    return this.http.get<PicoDemandaResponse>(`${this.apiUrl}/predict/picos-demanda`);
  }

  /**
   * Obtiene predicciones de riesgo de vencimiento para todos los productos
   */
  getRiesgoVencimiento(): Observable<RiesgoVencimientoResponse> {
    return this.http.get<RiesgoVencimientoResponse>(`${this.apiUrl}/predict/riesgo-vencimiento`);
  }

  /**
   * Obtiene ambas predicciones en un solo llamado
   */
  getResumenPredicciones(): Observable<ResumenPredicciones> {
    return this.http.get<ResumenPredicciones>(`${this.apiUrl}/predict/resumen`);
  }

  /**
   * Obtiene predicciones de picos de demanda para productos específicos
   */
  getPicosDemandaProductos(productIds: number[]): Observable<PicoDemandaResponse> {
    return this.http.post<PicoDemandaResponse>(`${this.apiUrl}/predict/picos-demanda`, productIds);
  }

  /**
   * Obtiene predicciones de riesgo de vencimiento para productos específicos
   */
  getRiesgoVencimientoProductos(productIds: number[]): Observable<RiesgoVencimientoResponse> {
    return this.http.post<RiesgoVencimientoResponse>(`${this.apiUrl}/predict/riesgo-vencimiento`, productIds);
  }
}
