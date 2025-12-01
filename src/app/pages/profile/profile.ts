import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  profileData = {
    fullName: '',
    email: '',
    role: '',
    phone: ''
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private router: Router) {}

  ngOnInit() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.profileData = {
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || '',
        phone: user.phone || ''
      };
    }
  }

  onSubmit() {
    if (this.passwordData.currentPassword) {
      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      if (this.passwordData.newPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    console.log('Actualizando perfil:', this.profileData);
    console.log('Actualizando contraseña:', this.passwordData.currentPassword ? 'Sí' : 'No');

    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.fullName = this.profileData.fullName;
      user.phone = this.profileData.phone;
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    alert('Perfil actualizado correctamente');

    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
  }
}
