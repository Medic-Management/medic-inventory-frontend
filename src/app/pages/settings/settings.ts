import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  ngOnInit() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings);
    }
  }

  saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(this.settings));

    console.log('Guardando configuración:', this.settings);

    alert('Configuración guardada correctamente');
  }
}
