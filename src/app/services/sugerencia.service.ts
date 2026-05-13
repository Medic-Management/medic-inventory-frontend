import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SugerenciaPedido {
  productoId: number;
  productoNombre: string;
  proveedorId: number;
  proveedorNombre: string;
  stockActual: number;
  stockMinimo: number;
  cantidadSugerida: number;
  justificacion: string;
  criticidad: string; // ALTA, MEDIA, BAJA
}

@Injectable({
  providedIn: 'root'
})
export class SugerenciaService {
  private apiUrl = `${environment.apiUrl}/sugerencias';

  constructor(private http: HttpClient) { }

  obtenerSugerenciasPedido(): Observable<SugerenciaPedido[]> {
    return this.http.get<SugerenciaPedido[]>(`${this.apiUrl}/pedidos`);
  }

  crearBorradorDesdeSugerencia(sugerencia: SugerenciaPedido): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear-borrador`, sugerencia);
  }
}
