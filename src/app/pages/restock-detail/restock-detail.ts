import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoRestockService, RestockResponse } from '../../services/auto-restock';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-restock-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './restock-detail.html',
  styleUrl: './restock-detail.scss',
})
export class RestockDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private restockService = inject(AutoRestockService);

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

          this.supplierEmail = response.supplierEmail;

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
    if (this.restockId) {
      console.log('Saving email content changes:', this.restockData);

      this.restockService.updateEmailContent(
        this.restockId,
        this.restockData.emailSubject,
        this.restockData.emailBody
      ).subscribe({
        next: (response: RestockResponse) => {
          console.log('Email content updated:', response);
          this.successMessage = 'Contenido del email actualizado exitosamente';
          this.isEditMode = false;

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err: any) => {
          console.error('Error updating email content:', err);
          this.error = 'Error al actualizar el contenido del email';

          setTimeout(() => {
            this.error = '';
          }, 3000);
        }
      });
    } else {
      this.isEditMode = false;
    }
  }

  cancelEdit() {
    this.isEditMode = false;
    this.loadRestockDetail();
  }

  viewFullEmail() {
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
          this.router.navigate(['/inventario']);
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.router.navigate(['/inventario']);
        }
      });
    } else {
      this.router.navigate(['/inventario']);
    }
  }

  goBack() {
    this.router.navigate(['/inventario']);
  }

  openSendEmailModal() {
    this.isConfirmationModalOpen = true;
  }

  closeConfirmationModal() {
    this.isConfirmationModalOpen = false;
  }

  confirmSendEmail() {
    if (this.restockId) {
      this.error = '';
      this.successMessage = '';
      this.sendingEmail = true;

      console.log('Queuing email for UiPath to send...');

      this.restockService.markEmailAsPending(this.restockId!).subscribe({
        next: (response: RestockResponse) => {
          console.log('Email queued successfully:', response);

          this.successMessage = 'Solicitud agregada a la cola. UiPath enviará el correo automáticamente en unos segundos.';
          this.sendingEmail = false;
          this.isConfirmationModalOpen = false;

          this.startPollingEmailStatus();
        },
        error: (err: any) => {
          console.error('Error queuing email:', err);
          this.error = 'Error al agregar solicitud a la cola de envío';
          this.sendingEmail = false;
          this.isConfirmationModalOpen = false;
        }
      });
    }
  }

  private pollingInterval: any;
  private pollingAttempts = 0;
  private maxPollingAttempts = 60;

  startPollingEmailStatus() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingAttempts = 0;

    this.pollingInterval = setInterval(() => {
      this.pollingAttempts++;

      if (this.pollingAttempts > this.maxPollingAttempts) {
        clearInterval(this.pollingInterval);
        this.successMessage = '';
        console.log('Polling timeout - email may still be pending');
        return;
      }

      this.restockService.getRestockById(this.restockId!).subscribe({
        next: (data) => {
          if (data.emailSent) {
            clearInterval(this.pollingInterval);
            this.restockData.emailSent = true;
            this.restockData.status = this.getStatusText(data.status, data.emailSent);
            this.successMessage = '✓ Correo enviado exitosamente por UiPath';
            this.loadRestockDetail();
          }
        },
        error: (err: any) => {
          console.error('Error polling email status:', err);
        }
      });
    }, 1000);
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}

