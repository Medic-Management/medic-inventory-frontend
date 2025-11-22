import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  id: number;
  orderNumber: string;
  type: 'PURCHASE' | 'DISPATCH';
  status: 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  orderDate: string;
  deliveryDate?: string;
  totalAmount: number;
  supplier?: any;
  items?: OrderItem[];
  notes?: string;
}

export interface OrderItem {
  id: number;
  product: any;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateOrderRequest {
  type: 'PURCHASE' | 'DISPATCH';
  supplierId?: number;
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'https://unburglarized-claude-dovetailed.ngrok-free.dev/api/orders';

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Registrar salida de medicamento
  registerDispatch(productId: number, quantity: number, notes?: string): Observable<Order> {
    const dispatchOrder: CreateOrderRequest = {
      type: 'DISPATCH',
      orderDate: new Date().toISOString(),
      notes: notes || 'Salida de medicamento',
      items: [{
        productId: productId,
        quantity: quantity,
        unitPrice: 0
      }]
    };
    return this.createOrder(dispatchOrder);
  }
}
