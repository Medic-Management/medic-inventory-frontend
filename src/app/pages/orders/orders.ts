import { Component, inject } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntradaService, EntradaRequest } from '../../services/entrada.service';
import { ProductService } from '../../services/product.service';

interface Order {
  id: number;
  product: string;
  value: string;
  quantity: string;
  orderId: string;
  expectedDelivery: string;
  status: 'delayed' | 'confirmed' | 'returned' | 'out-for-delivery';
  statusText: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [NgClass],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class OrdersComponent {
  orders: Order[] = [
    {
      id: 1,
      product: 'Paracetamol 500mg',
      value: 'S/ 850',
      quantity: '200 Unidades',
      orderId: '7535',
      expectedDelivery: '15/01/25',
      status: 'delayed',
      statusText: 'Retrasado'
    },
    {
      id: 2,
      product: 'Ibuprofeno 400mg',
      value: 'S/ 640',
      quantity: '150 Unidades',
      orderId: '5724',
      expectedDelivery: '18/01/25',
      status: 'confirmed',
      statusText: 'Confirmado'
    },
    {
      id: 3,
      product: 'Amoxicilina 500mg',
      value: 'S/ 1,200',
      quantity: '180 Unidades',
      orderId: '2776',
      expectedDelivery: '12/01/25',
      status: 'returned',
      statusText: 'Devuelto'
    },
    {
      id: 4,
      product: 'Omeprazol 20mg',
      value: 'S/ 420',
      quantity: '100 Unidades',
      orderId: '2275',
      expectedDelivery: '14/01/25',
      status: 'out-for-delivery',
      statusText: 'En camino'
    },
    {
      id: 5,
      product: 'Losartán 50mg',
      value: 'S/ 780',
      quantity: '120 Unidades',
      orderId: '2427',
      expectedDelivery: '20/01/25',
      status: 'returned',
      statusText: 'Devuelto'
    },
    {
      id: 6,
      product: 'Metformina 850mg',
      value: 'S/ 960',
      quantity: '200 Unidades',
      orderId: '2578',
      expectedDelivery: '22/01/25',
      status: 'out-for-delivery',
      statusText: 'En camino'
    },
    {
      id: 7,
      product: 'Atorvastatina 20mg',
      value: 'S/ 1,150',
      quantity: '80 Unidades',
      orderId: '2757',
      expectedDelivery: '25/01/25',
      status: 'delayed',
      statusText: 'Retrasado'
    },
    {
      id: 8,
      product: 'Clonazepam 2mg',
      value: 'S/ 540',
      quantity: '60 Unidades',
      orderId: '3757',
      expectedDelivery: '28/01/25',
      status: 'confirmed',
      statusText: 'Confirmado'
    },
    {
      id: 9,
      product: 'Salbutamol 100mcg',
      value: 'S/ 320',
      quantity: '50 Unidades',
      orderId: '2474',
      expectedDelivery: '10/01/25',
      status: 'delayed',
      statusText: 'Retrasado'
    }
  ];

  openAddOrderModal() {
    console.log('Opening add order modal');
  }
}
