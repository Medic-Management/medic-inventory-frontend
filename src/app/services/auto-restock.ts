import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RestockRequestDto {
  productId: number;
  supplierId: number;
  requestedQuantity: number;
  notes?: string;
}

export interface RestockResponse {
  id: number;
  productId: number;
  productName: string;
  supplierId: number;
  supplierName: string;
  supplierEmail: string;
  requestedQuantity: number;
  currentStock: number;
  alertLevel: number;
  status: 'PENDING' | 'SENT' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  requestDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  emailSent: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AutoRestockService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all restock requests
   */
  getAllRestockRequests(): Observable<RestockResponse[]> {
    return this.http.get<RestockResponse[]>(`${this.apiUrl}/restock`);
  }

  /**
   * Get restock request by ID
   */
  getRestockById(id: number): Observable<RestockResponse> {
    return this.http.get<RestockResponse>(`${this.apiUrl}/restock/${id}`);
  }

  /**
   * Get active restock requests
   */
  getActiveRequests(): Observable<RestockResponse[]> {
    return this.http.get<RestockResponse[]>(`${this.apiUrl}/restock/active`);
  }

  /**
   * Get pending email requests (for UiPath)
   */
  getPendingEmailRequests(): Observable<RestockResponse[]> {
    return this.http.get<RestockResponse[]>(`${this.apiUrl}/restock/pending-email`);
  }

  /**
   * Get restock requests by product ID
   */
  getRequestsByProduct(productId: number): Observable<RestockResponse[]> {
    return this.http.get<RestockResponse[]>(`${this.apiUrl}/restock/product/${productId}`);
  }

  /**
   * Get restock requests by supplier ID
   */
  getRequestsBySupplier(supplierId: number): Observable<RestockResponse[]> {
    return this.http.get<RestockResponse[]>(`${this.apiUrl}/restock/supplier/${supplierId}`);
  }

  /**
   * Create a new restock request
   */
  createRestockRequest(request: RestockRequestDto): Observable<RestockResponse> {
    return this.http.post<RestockResponse>(`${this.apiUrl}/restock/request`, request);
  }

  /**
   * Update restock request status
   */
  updateRestockStatus(id: number, status: string): Observable<RestockResponse> {
    return this.http.put<RestockResponse>(`${this.apiUrl}/restock/${id}/status`, { status });
  }

  /**
   * Mark email as sent (called by UiPath after sending email)
   */
  markEmailSent(id: number): Observable<RestockResponse> {
    return this.http.put<RestockResponse>(`${this.apiUrl}/restock/${id}/email-sent`, {});
  }

  /**
   * Trigger automatic restock check
   */
  autoCheckAndRestock(): Observable<RestockResponse[]> {
    return this.http.post<RestockResponse[]>(`${this.apiUrl}/restock/auto-check`, {});
  }

  /**
   * Delete a restock request
   */
  deleteRestockRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/restock/${id}`);
  }
}
