import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoteResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  codigoLote: string;
  fechaVencimiento: string;
  estado: boolean;
  precioUnitario: number;
  cantidadDisponible: number;
  diasHastaVencimiento: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoteService {
  private apiUrl = 'http://172.200.21.101:8080/api/lotes';

  constructor(private http: HttpClient) { }

  /**
   * HU-11: Obtener lotes ordenados por FEFO (First Expired, First Out)
   * para un producto en una sede específica
   */
  obtenerLotesFEFO(productoId: number, sedeId: number): Observable<LoteResponse[]> {
    return this.http.get<LoteResponse[]>(`${this.apiUrl}/fefo?productoId=${productoId}&sedeId=${sedeId}`);
  }

  /**
   * HU-11: Obtener todos los lotes de un producto ordenados por FEFO
   */
  obtenerLotesFEFOPorProducto(productoId: number): Observable<LoteResponse[]> {
    return this.http.get<LoteResponse[]>(`${this.apiUrl}/producto/${productoId}/fefo`);
  }

  /**
   * HU-11: Obtener el primer lote FEFO (el que vence más pronto)
   */
  obtenerPrimerLoteFEFO(productoId: number, sedeId: number): Observable<LoteResponse> {
    return this.http.get<LoteResponse>(`${this.apiUrl}/fefo/primero?productoId=${productoId}&sedeId=${sedeId}`);
  }
}
