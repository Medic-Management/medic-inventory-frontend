import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SettingsResponse {
  language: string;
  timezone: string;
  currency: string;
  supplierEmail: string;
  dateFormat: string;
  notifications: {
    lowStock: boolean;
    expiring: boolean;
    newOrders: boolean;
    email: boolean;
  };
  inventory: {
    alertValue: number;
    expirationDays: number;
    autoUpdate: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  // CP025: Obtener configuración del usuario
  getUserSettings(userId: number): Observable<SettingsResponse> {
    return this.http.get<SettingsResponse>(`${this.apiUrl}/${userId}`);
  }

  // CP025: Actualizar configuración del usuario
  updateSettings(userId: number, settings: SettingsResponse): Observable<SettingsResponse> {
    return this.http.put<SettingsResponse>(`${this.apiUrl}/${userId}`, settings);
  }
}
