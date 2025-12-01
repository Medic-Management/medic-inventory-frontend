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
  private apiUrl = 'https://unburglarized-claude-dovetailed.ngrok-free.dev/api/ml';

  constructor(private http: HttpClient) {}

  checkHealth(): Observable<MLHealthStatus> {
    return this.http.get<MLHealthStatus>(`${this.apiUrl}/health`);
  }

  getPicosDemanda(): Observable<PicoDemandaResponse> {
    return this.http.get<PicoDemandaResponse>(`${this.apiUrl}/predict/picos-demanda`);
  }

  getRiesgoVencimiento(): Observable<RiesgoVencimientoResponse> {
    return this.http.get<RiesgoVencimientoResponse>(`${this.apiUrl}/predict/riesgo-vencimiento`);
  }

  getResumenPredicciones(): Observable<ResumenPredicciones> {
    return this.http.get<ResumenPredicciones>(`${this.apiUrl}/predict/resumen`);
  }

  getPicosDemandaProductos(productIds: number[]): Observable<PicoDemandaResponse> {
    return this.http.post<PicoDemandaResponse>(`${this.apiUrl}/predict/picos-demanda`, productIds);
  }

  getRiesgoVencimientoProductos(productIds: number[]): Observable<RiesgoVencimientoResponse> {
    return this.http.post<RiesgoVencimientoResponse>(`${this.apiUrl}/predict/riesgo-vencimiento`, productIds);
  }
}
