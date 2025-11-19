import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IOrder, IOrderProduct, IOrderResponse, IOrdersResponse } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders',
  imports: [CommonModule,RouterLink,FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  orders: IOrder[] = [];
  isLoading = false;
  selectedStatus = 'all';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalItems = 0;

  // the status that available for admin (excluding cancelled)
  statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' }
  ];
  constructor(private orderService:OrderService){}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    const status = this.selectedStatus !== 'all' ? this.selectedStatus : undefined;

    this.orderService.getAllOrders(this.currentPage, this.itemsPerPage, status)
      .subscribe({
        next: (response: IOrdersResponse) => {
          this.orders = response.data;
          this.totalPages = response.pagination?.total || 1;
          this.totalItems = response.pagination?.totalOrders || response.data.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.isLoading = false;

        }
      });
  }

  onStatusChange(order: IOrder, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;

    if (order.status === newStatus) return;

    this.orderService.updateOrderStatus(order._id, newStatus)
      .subscribe({
        next: (response: IOrderResponse) => {
          // Update local order status
          order.status = response.data.status;
          order.updatedAt = response.data.updatedAt;
        },
        error: (error) => {
          console.error('Error updating order status:', error);
          // Revert the select value on error
          select.value = order.status;
        }
      });
  }

onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }
  getProductName(product: any): string {
    if (!product) return 'Product';

    if (typeof product === 'string') {
      return 'Product'; // If it's just an ID
    } else if (typeof product === 'object' && product.name) {
      return product.name; // If it's a populated product object
    }
    return 'Product';
  }

  // Safe way to get product image
  getProductImage(product: string | any): string {
    if (typeof product === 'object' && product.imgURL) {
      return product.imgURL;
    }
    return 'assets/images/placeholder-product.jpg';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Processing': return 'status-processing';
      case 'Shipped': return 'status-shipped';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method) {
      case 'CreditCard': return '💳';
      case 'PayPal': return '📱';
      case 'CashOnDelivery': return '💰';
      default: return '💳';
    }
  }

  get totalDisplayed(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${start}-${end} of ${this.totalItems} orders`;
  }

  // Pagination helper
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    // Show max 5 pages around current page
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(total, startPage + 4);

    // Adjust if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

}
