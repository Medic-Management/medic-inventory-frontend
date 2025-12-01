import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService, AuditLogResponse, AuditLogFilter } from '../../services/audit-log.service';
import { UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class AuditoriaComponent implements OnInit {
  private auditLogService = inject(AuditLogService);
  private userService = inject(UserManagementService);

  auditLogs: AuditLogResponse[] = [];
  usuarios: any[] = [];
  showFilters = false;
  loading = false;

  filters: AuditLogFilter = {
    usuarioId: undefined,
    accion: undefined,
    entidadTipo: undefined,
    fechaDesde: undefined,
    fechaHasta: undefined
  };

  acciones = [
    'DISPENSACION_CREADA',
    'USUARIO_CREADO',
    'USUARIO_ACTUALIZADO',
    'USUARIO_ESTADO_CAMBIADO'
  ];

  entidadTipos = [
    'Dispensacion',
    'Usuario',
    'Producto',
    'Proveedor'
  ];

  ngOnInit() {
    this.loadAuditLogs();
    this.loadUsuarios();
  }

  loadAuditLogs() {
    this.loading = true;
    this.auditLogService.getAllAuditLogs().subscribe({
      next: (logs) => {
        this.auditLogs = logs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.loading = false;
      }
    });
  }

  loadUsuarios() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.usuarios = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    this.loading = true;
    this.auditLogService.getAuditLogsWithFilters(this.filters).subscribe({
      next: (logs) => {
        this.auditLogs = logs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error applying filters:', error);
        this.loading = false;
      }
    });
  }

  clearFilters() {
    this.filters = {
      usuarioId: undefined,
      accion: undefined,
      entidadTipo: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined
    };
    this.loadAuditLogs();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getAccionClass(accion: string): string {
    if (accion.includes('CREADO') || accion.includes('CREADA')) {
      return 'accion-create';
    } else if (accion.includes('ACTUALIZADO') || accion.includes('ACTUALIZADA')) {
      return 'accion-update';
    } else if (accion.includes('ELIMINADO') || accion.includes('ELIMINADA')) {
      return 'accion-delete';
    } else if (accion.includes('ESTADO')) {
      return 'accion-status';
    }
    return 'accion-other';
  }
}
