import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService, UserRequest, UserResponse, RoleResponse } from '../../services/user-management.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class UsuariosComponent implements OnInit {
  private userService = inject(UserManagementService);

  usuarios: UserResponse[] = [];
  roles: RoleResponse[] = [];
  showForm = false;
  isEdit = false;
  selectedUserId: number = 0;

  formData: UserRequest = {
    nombreCompleto: '',
    email: '',
    rolId: 0,
    password: ''
  };

  ngOnInit() {
    this.loadUsuarios();
    this.loadRoles();
  }

  loadUsuarios() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.usuarios = users;
      },
      error: (error) => console.error('Error:', error)
    });
  }

  loadRoles() {
    this.userService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => console.error('Error:', error)
    });
  }

  openCreateForm() {
    this.isEdit = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(user: UserResponse) {
    this.isEdit = true;
    this.showForm = true;
    this.selectedUserId = user.id;
    this.formData = {
      nombreCompleto: user.nombreCompleto,
      email: user.email,
      rolId: user.rolId,
      password: ''
    };
  }

  resetForm() {
    this.formData = {
      nombreCompleto: '',
      email: '',
      rolId: 0,
      password: ''
    };
  }

  onSubmit() {
    if (this.isEdit) {
      this.userService.updateUser(this.selectedUserId, this.formData).subscribe({
        next: () => {
          this.loadUsuarios();
          this.showForm = false;
        },
        error: (error) => alert('Error al actualizar usuario')
      });
    } else {
      this.userService.createUser(this.formData).subscribe({
        next: () => {
          this.loadUsuarios();
          this.showForm = false;
        },
        error: (error) => alert('Error al crear usuario')
      });
    }
  }

  toggleStatus(userId: number) {
    this.userService.toggleUserStatus(userId).subscribe({
      next: () => this.loadUsuarios(),
      error: (error) => alert('Error al cambiar estado')
    });
  }

  getRolNombre(rolId: number): string {
    const rol = this.roles.find(r => r.rolId === rolId);
    return rol ? rol.rolNombre : 'N/A';
  }
}
