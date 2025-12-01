import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserRequest {
  nombreCompleto: string;
  email: string;
  rolId: number;
  password?: string;
}

export interface UserResponse {
  id: number;
  nombreCompleto: string;
  email: string;
  rolId: number;
  rolNombre: string;
  activo: number;
  creadoEn: string;
}

export interface RoleResponse {
  rolId: number;
  rolNombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  createUser(request: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, request);
  }

  updateUser(id: number, request: UserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, request);
  }

  toggleUserStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  getAllRoles(): Observable<RoleResponse[]> {
    return this.http.get<RoleResponse[]>(`${this.apiUrl}/roles`);
  }
}
