import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierManagementService, SupplierRequest, SupplierResponse } from '../../services/supplier-management.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.scss',
})
export class ProveedoresComponent implements OnInit {
  private supplierService = inject(SupplierManagementService);

  proveedores: SupplierResponse[] = [];
  showForm = false;
  isEdit = false;
  selectedId: number = 0;

  formData: SupplierRequest = {
    nombre: '',
    email: '',
    telefono: ''
  };

  ngOnInit() {
    this.loadProveedores();
  }

  loadProveedores() {
    this.supplierService.getAllSuppliers().subscribe({
      next: (suppliers) => {
        this.proveedores = suppliers;
      },
      error: (error) => console.error('Error:', error)
    });
  }

  openCreateForm() {
    this.isEdit = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(supplier: SupplierResponse) {
    this.isEdit = true;
    this.showForm = true;
    this.selectedId = supplier.id;
    this.formData = {
      nombre: supplier.nombre,
      email: supplier.email,
      telefono: supplier.telefono
    };
  }

  resetForm() {
    this.formData = {
      nombre: '',
      email: '',
      telefono: ''
    };
  }

  onSubmit() {
    if (this.isEdit) {
      this.supplierService.updateSupplier(this.selectedId, this.formData).subscribe({
        next: () => {
          this.loadProveedores();
          this.showForm = false;
        },
        error: () => alert('Error al actualizar proveedor')
      });
    } else {
      this.supplierService.createSupplier(this.formData).subscribe({
        next: () => {
          this.loadProveedores();
          this.showForm = false;
        },
        error: () => alert('Error al crear proveedor')
      });
    }
  }

  toggleStatus(id: number) {
    this.supplierService.toggleSupplierStatus(id).subscribe({
      next: () => this.loadProveedores(),
      error: () => alert('Error al cambiar estado')
    });
  }
}
