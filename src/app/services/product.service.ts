import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  // El backend (ProductResponse) devuelve 'name'. Se mantienen 'nombre'/'codigo'
  // como opcionales por compatibilidad con pantallas antiguas.
  name?: string;
  codigo?: string;
  nombre?: string;
  categoria?: any;
  unidad?: any;
  requiereRefrigeracion?: number;
  controlado?: number;
  notas?: string;
  creadoEn?: string;
  quantity?: number;
  alertValue?: number;
  price?: number;
  status?: string;
  expirationDate?: string;
  // CP021: Campos de bloqueo
  bloqueado?: boolean;
  motivoBloqueo?: string;
  bloqueadoEn?: string;
  bloqueadoPor?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductsWithInventory(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/with-inventory`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: number, product: any): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/low-stock`);
  }

  // CP021: Bloquear producto
  bloquearProducto(id: number, motivoBloqueo: string, usuarioId: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/bloquear`, { motivoBloqueo, usuarioId });
  }

  // CP021: Desbloquear producto
  desbloquearProducto(id: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/desbloquear`, {});
  }
}
