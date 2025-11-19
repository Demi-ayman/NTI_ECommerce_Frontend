import { Component, OnInit } from '@angular/core';
import { IOrder } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-orders',
  imports: [CommonModule,FormsModule,ReactiveFormsModule,RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit{
  orders: IOrder[] = [];
  loading = true;
  errorMessage = '';

  constructor(private orderService:OrderService){}

  ngOnInit(): void {
      this.loadMyOrders();
  }
  loadMyOrders() {
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to load orders';
      }
    });
  }
}
