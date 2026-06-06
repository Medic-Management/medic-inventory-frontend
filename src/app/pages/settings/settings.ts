import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent implements OnInit {
  settings = {
    language: 'es',
    timezone: 'America/Lima',
    // CP025: Parámetros generales del sistema
    currency: 'PEN',
    supplierEmail: '',
    dateFormat: 'dd/mm/yyyy',
    notifications: {
      lowStock: true,
      expiring: true,
      newOrders: true,
      email: false
    },
    inventory: {
      alertValue: 10,
      expirationDays: 30,
      autoUpdate: true
    }
  };

  userId: number = 0;

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    // Obtener el userId del usuario logueado
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userId = user.userId;

      console.log('Usuario cargado:', user, 'userId:', this.userId);

      // CP025: Cargar configuración desde el backend
      this.settingsService.getUserSettings(this.userId).subscribe({
        next: (response) => {
          this.settings = response;
          console.log('Configuración cargada desde el backend:', response);
        },
        error: (error) => {
          console.error('Error al cargar configuración:', error);
          // Si hay error, usar valores por defecto
        }
      });
    }
  }

  saveSettings() {
    // CP025: Guardar configuración en el backend
    this.settingsService.updateSettings(this.userId, this.settings).subscribe({
      next: (response) => {
        console.log('Configuración guardada exitosamente:', response);
        alert('Configuración guardada correctamente');
      },
      error: (error) => {
        console.error('Error al guardar configuración:', error);
        alert('Error al guardar la configuración');
      }
    });
  }
}
