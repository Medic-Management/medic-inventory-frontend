import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoRestockService, RestockResponse } from '../../services/auto-restock';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal';
import { UiPathService, EmailRequest } from '../../services/uipath.service';

@Component({
  selector: 'app-restock-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './restock-detail.html',
  styleUrl: './restock-detail.scss',
})
export class RestockDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private restockService = inject(AutoRestockService);
  private uipathService = inject(UiPathService);

  restockId?: number;
  isEditMode = false;
  isConfirmationModalOpen = false;
  loading = false;
  error = '';
  successMessage = '';
  sendingEmail = false;
  supplierEmail = '';

  restockData = {
    id: 0,
    processType: 'Envío de solicitud de reabastecimiento',
    supplierName: '',
    dateTime: '',
    status: '',
    emailSubject: '',
    emailBody: '',
    currentStock: 0,
    requestedQuantity: 0,
    responsibleType: 'Bot',
    productName: '',
    productImage: '',
    emailSent: false
  };

  ngOnInit() {
    this.restockId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRestockDetail();
  }

  loadRestockDetail() {
    if (this.restockId) {
      this.loading = true;
      this.restockService.getRestockById(this.restockId).subscribe({
        next: (response: RestockResponse) => {
          console.log('Restock detail loaded:', response);

          // Store supplier email for UiPath
          this.supplierEmail = response.supplierEmail;

          // Map API response to UI data
          this.restockData = {
            id: response.id,
            processType: 'Envío de solicitud de reabastecimiento',
            supplierName: response.supplierName,
            dateTime: this.formatDateTime(response.requestDate),
            status: this.getStatusText(response.status, response.emailSent),
            emailSubject: `Solicitud de reabastecimiento - ${response.productName}`,
            emailBody: response.notes || this.generateDefaultEmailBody(response),
            currentStock: response.currentStock,
            requestedQuantity: response.requestedQuantity,
            responsibleType: 'Bot',
            productName: response.productName,
            productImage: '',
            emailSent: response.emailSent
          };

          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading restock detail:', error);
          this.error = 'Error al cargar los detalles de la solicitud';
          this.loading = false;
        }
      });
    }
  }

  private formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  }

  private getStatusText(status: string, emailSent: boolean): string {
    if (emailSent && status === 'SENT') {
      return 'Correo enviado correctamente (OK)';
    }

    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendiente de envío',
      'SENT': 'Correo enviado',
      'IN_TRANSIT': 'En tránsito',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };

    return statusMap[status] || status;
  }

  private generateDefaultEmailBody(response: RestockResponse): string {
    return `Estimado proveedor,

Solicitamos el envío de ${response.requestedQuantity} unidades de ${response.productName} para mantener el nivel de stock óptimo.

Stock actual: ${response.currentStock} unidades
Nivel de alerta: ${response.alertLevel} unidades

Atentamente,
Clínica Vestida de Sol - Área de Farmacia.`;
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  saveChanges() {
    console.log('Saving changes:', this.restockData);
    // Note: Currently there's no direct endpoint to update notes
    // This would require a new endpoint in the backend
    this.isEditMode = false;
  }

  cancelEdit() {
    this.isEditMode = false;
    // Reload original data
    this.loadRestockDetail();
  }

  viewFullEmail() {
    // Create a simple popup with email content
    const emailWindow = window.open('', 'Email', 'width=600,height=400');
    if (emailWindow) {
      emailWindow.document.write(`
        <html>
          <head>
            <title>${this.restockData.emailSubject}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h2 { color: #3b82f6; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h2>${this.restockData.emailSubject}</h2>
            <p><strong>Para:</strong> ${this.restockData.supplierName}</p>
            <hr>
            <pre>${this.restockData.emailBody}</pre>
          </body>
        </html>
      `);
      emailWindow.document.close();
    }
  }

  markAsAttended() {
    if (this.restockId) {
      this.restockService.updateRestockStatus(this.restockId, 'DELIVERED').subscribe({
        next: (response) => {
          console.log('Status updated:', response);
          this.router.navigate(['/inventory']);
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.router.navigate(['/inventory']);
        }
      });
    } else {
      this.router.navigate(['/inventory']);
    }
  }

  goBack() {
    this.router.navigate(['/inventory']);
  }

  openSendEmailModal() {
    this.isConfirmationModalOpen = true;
  }

  closeConfirmationModal() {
    this.isConfirmationModalOpen = false;
  }

  confirmSendEmail() {
    if (this.restockId) {
      // Clear previous messages
      this.error = '';
      this.successMessage = '';
      this.sendingEmail = true;

      // Prepare email data for UiPath
      const emailData: EmailRequest = {
        destinatario: this.supplierEmail,
        asunto: this.restockData.emailSubject,
        cuerpo: this.restockData.emailBody,
        productoNombre: this.restockData.productName,
        cantidadSolicitada: this.restockData.requestedQuantity,
        stockActual: this.restockData.currentStock
      };

      console.log('Sending email via UiPath:', emailData);

      // Step 1: Call UiPath to send the email
      this.uipathService.enviarCorreo(emailData).subscribe({
        next: (uipathResponse) => {
          console.log('UiPath email response:', uipathResponse);

          if (uipathResponse.exito) {
            // Step 2: If UiPath successfully sent the email, mark it as sent in the backend
            this.restockService.markEmailSent(this.restockId!).subscribe({
              next: (response) => {
                console.log('Email marked as sent in backend:', response);
                // Update UI
                this.restockData.emailSent = true;
                this.restockData.status = 'Correo enviado correctamente (OK)';
                this.successMessage = 'Correo enviado exitosamente por UiPath';
                this.sendingEmail = false;
                this.isConfirmationModalOpen = false;
              },
              error: (error) => {
                console.error('Error marking email as sent:', error);
                this.error = 'Email enviado por UiPath, pero error al actualizar estado en BD';
                this.sendingEmail = false;
                this.isConfirmationModalOpen = false;
              }
            });
          } else {
            // UiPath reported failure
            this.error = `Error de UiPath: ${uipathResponse.mensaje}`;
            this.sendingEmail = false;
          }
        },
        error: (error) => {
          console.error('Error calling UiPath API:', error);

          // Check if error is due to UiPath not being available
          if (error.status === 0 || error.status === 404) {
            this.error = 'No se pudo conectar con UiPath. Asegúrate de que UiPath Studio esté ejecutándose en http://localhost:8090';
          } else {
            this.error = `Error al enviar correo: ${error.message || 'Error desconocido'}`;
          }

          this.sendingEmail = false;
          this.isConfirmationModalOpen = false;
        }
      });
    }
  }
}
