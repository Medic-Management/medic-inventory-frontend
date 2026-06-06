import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UmbralStockRequest {
  sedeId: number;
  productoId: number;
  minimo: number;
  puntoPedido?: number;
  stockSeguridad?: number;
  umbralCoberturaDias?: number; // HU-17: Días mínimos de cobertura
  stockMaximo?: number; // HU-04.3: Stock máximo permitido
}

export interface UmbralStockResponse {
  id: number;
  sedeId: number;
  sedeNombre: string;
  productoId: number;
  productoNombre: string;
  minimo: number;
  puntoPedido: number;
  stockSeguridad: number;
  umbralCoberturaDias: number; // HU-17: Días mínimos de cobertura
  stockMaximo: number; // HU-04.3: Stock máximo permitido
}

@Injectable({
  providedIn: 'root'
})
export class UmbralStockService {
  private apiUrl = `${environment.apiUrl}/umbrales`;

  constructor(private http: HttpClient) { }

  getAllUmbrales(): Observable<UmbralStockResponse[]> {
    return this.http.get<UmbralStockResponse[]>(this.apiUrl);
  }

  getUmbralById(id: number): Observable<UmbralStockResponse> {
    return this.http.get<UmbralStockResponse>(`${this.apiUrl}/${id}`);
  }

  getUmbralByProductoAndSede(productoId: number, sedeId: number): Observable<UmbralStockResponse> {
    return this.http.get<UmbralStockResponse>(`${this.apiUrl}/producto/${productoId}/sede/${sedeId}`);
  }

  createUmbral(request: UmbralStockRequest): Observable<UmbralStockResponse> {
    return this.http.post<UmbralStockResponse>(this.apiUrl, request);
  }

  updateUmbral(id: number, request: UmbralStockRequest): Observable<UmbralStockResponse> {
    return this.http.put<UmbralStockResponse>(`${this.apiUrl}/${id}`, request);
  }

  deleteUmbral(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
