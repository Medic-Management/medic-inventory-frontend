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
  private apiUrl = 'https://unburglarized-claude-dovetailed.ngrok-free.dev/api';

  constructor(private http: HttpClient) {}

  getAllRestockRequests(): Observable<RestockResponse[]> {
    return this.http.get<RestockResponse[]>(`${this.apiUrl}/restock`);
  }

  getRestockById(id: number): Observable<RestockResponse> {
    return this.http.get<RestockResponse>(`${this.apiUrl}/restock/${id}`);
  }

  getActiveRequests(): Observable<RestockResponse[]> {
    return this.http.get<RestockResponse[]>(`${this.apiUrl}/restock/active`);
  }

  getPendingEmailRequests(): Observable<RestockResponse[]> {
    return this.http.get<RestockResponse[]>(`${this.apiUrl}/restock/pending-email`);
  }

  getRequestsByProduct(productId: number): Observable<RestockResponse[]> {
    return this.http.get<RestockResponse[]>(`${this.apiUrl}/restock/product/${productId}`);
  }

  getRequestsBySupplier(supplierId: number): Observable<RestockResponse[]> {
    return this.http.get<RestockResponse[]>(`${this.apiUrl}/restock/supplier/${supplierId}`);
  }

  createRestockRequest(request: RestockRequestDto): Observable<RestockResponse> {
    return this.http.post<RestockResponse>(`${this.apiUrl}/restock/request`, request);
  }

  updateRestockStatus(id: number, status: string): Observable<RestockResponse> {
    return this.http.put<RestockResponse>(`${this.apiUrl}/restock/${id}/status`, { status });
  }

  markEmailAsPending(id: number): Observable<RestockResponse> {
    return this.http.put<RestockResponse>(`${this.apiUrl}/restock/${id}/queue-email`, {});
  }

  markEmailSent(id: number): Observable<RestockResponse> {
    return this.http.put<RestockResponse>(`${this.apiUrl}/restock/${id}/email-sent`, {});
  }

  updateEmailContent(id: number, emailSubject: string, emailBody: string): Observable<RestockResponse> {
    return this.http.put<RestockResponse>(`${this.apiUrl}/restock/${id}/email-content`, {
      emailSubject,
      emailBody
    });
  }

  autoCheckAndRestock(): Observable<RestockResponse[]> {
    return this.http.post<RestockResponse[]>(`${this.apiUrl}/restock/auto-check`, {});
  }

  deleteRestockRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/restock/${id}`);
  }
}
