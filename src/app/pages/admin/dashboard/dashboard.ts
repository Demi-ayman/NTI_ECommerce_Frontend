import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit{
  stats = {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    totalAdmins: 0,
    totalCustomers: 0,
    newUsers: 0
  };
  loading = true;
  constructor(private adminService :AdminService , private authService:AuthService){}
  ngOnInit(): void {
    this.loadDashboardStats();
  }
   loadDashboardStats(): void {
    this.loading = true;

    // Load user statistics
    this.adminService.getUsersStats().subscribe({
      next: (response) => {
        this.stats.totalUsers = response.data.totalUsers;
        this.stats.totalAdmins = response.data.totalAdmins;
        this.stats.totalCustomers = response.data.totalCustomers;
        this.stats.newUsers = response.data.newUsers;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.loading = false;
      }
    });

    // You'll need to implement similar calls for products, orders, and categories
    // For now, we'll set placeholder values
    this.stats.totalProducts = 45;
    this.stats.totalOrders = 320;
    this.stats.totalCategories = 8;
  }

  get user() {
    return this.authService.getUser();
  }
  get newUsersPercentage(): number {
    if (this.stats.totalUsers === 0) return 0;
    return Math.round((this.stats.newUsers / this.stats.totalUsers) * 100);
  }

}
