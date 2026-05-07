import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SupplierRequest {
  nombre: string;
  email: string;
  telefono: string;
  leadTimeDays?: number;
  moq?: number;
}

export interface SupplierResponse {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  leadTimeDays?: number;
  moq?: number;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SupplierManagementService {
  private apiUrl = 'http://172.200.21.101:8080/api/suppliers';

  constructor(private http: HttpClient) { }

  getAllSuppliers(): Observable<SupplierResponse[]> {
    return this.http.get<SupplierResponse[]>(this.apiUrl);
  }

  getSupplierById(id: number): Observable<SupplierResponse> {
    return this.http.get<SupplierResponse>(`${this.apiUrl}/${id}`);
  }

  createSupplier(request: SupplierRequest): Observable<SupplierResponse> {
    return this.http.post<SupplierResponse>(this.apiUrl, request);
  }

  updateSupplier(id: number, request: SupplierRequest): Observable<SupplierResponse> {
    return this.http.put<SupplierResponse>(`${this.apiUrl}/${id}`, request);
  }

  toggleSupplierStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
