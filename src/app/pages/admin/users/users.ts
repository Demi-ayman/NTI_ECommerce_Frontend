import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUser, IUserCreate } from '../../../core/models/user.model';
import { AdminService } from '../../../core/services/admin.service';
import { UsersResponse } from '../../../core/models/admin.models';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit{
  users: IUser[] = [];
  filteredUsers: IUser[] = [];
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // for paginatiion
  currentPage = 1;
  totalPages= 1;
  totalUsers= 0;
  limit = 10;

  searchTerm: string='';
  private searchSubject = new Subject<string>();
  // for modals
  showCreateModal =false;
  showEditModal = false;
  showDeleteModal =false;

  // for forms
  createUserForm: FormGroup;
  editUserForm: FormGroup;

  selectedUser: IUser | null = null;

  constructor(
    private adminService:AdminService,
    private fb: FormBuilder,
    private router:Router){
    this.createUserForm = this.fb.group({
      name:['',[Validators.required,Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]

    })
    this.editUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();

    // Setup search with debounce - FIXED IMPLEMENTATION
    this.searchSubject.pipe(
      debounceTime(400), // Increased debounce time
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }


  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement.value;
    this.searchSubject.next(this.searchTerm);
  }

  performSearch(searchTerm: string): void {
    if (!searchTerm.trim()) {
      // If search is empty, show all users from current page
      this.filteredUsers = [...this.users];
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term) ||
      user._id.toLowerCase().includes(term)
    );
  }
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredUsers = [...this.users];
  }

  filterUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }

  onSearch():void{
    this.loadUsers(1); // this is for when searchine , will reset to first  page
  }

  loadUsers(page: number = 1): void {
    this.loading = true;
    this.errorMessage = null;

    this.adminService.getAllUsers(page, this.limit).subscribe({
      next: (response: UsersResponse) => {
        this.users = response.data;
        this.filteredUsers = [...this.users];

        this.currentPage = response.pagination.current;
        this.totalPages = response.pagination.total;
        this.totalUsers = response.pagination.totalUsers;
        this.loading = false;

        if (this.searchTerm) {
          this.performSearch(this.searchTerm);
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load users';
        this.loading = false;
        console.error('Error loading users:', error);
      }
    });
  }
  openCreateModal(): void {
    this.createUserForm.reset();
    this.showCreateModal = true;
  }

  closeCreateModal():void{
    this.showCreateModal = false;
  }

  openEditModal(user:IUser):void{
    this.selectedUser = user;
    this.editUserForm.patchValue({
      name:user.name,
      email:user.email,
      role:user.role
    });
    this.showEditModal = true;
  }

  closeEditModal():void{
    this.showEditModal = false;
    this.selectedUser = null;
  }

  openDeleteModal(user:IUser):void{
    this.selectedUser=user;
    this.showDeleteModal = true;
  }
  closeDeleteModal(): void {
      this.showDeleteModal = false;
      this.selectedUser = null;
    }
  createAdmin():void{
    if(this.createUserForm.invalid){
      this.markFormGroupTouched(this.createUserForm);
      return;
    }
    const userData :IUserCreate = this.createUserForm.value;
    this.loading=true;

    this.adminService.createAdmin(userData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Admin user created successfully!';
        this.closeCreateModal();
        this.loadUsers(this.currentPage);
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to create admin user';
        console.error('Error creating admin:', error);
      }
    })

  }

  updateUser(): void {
    if (this.editUserForm.invalid || !this.selectedUser) {
      this.markFormGroupTouched(this.editUserForm);
      return;
    }

    const userData = this.editUserForm.value;
    this.loading = true;

    this.adminService.updateUser(this.selectedUser._id, userData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'User updated successfully!';
        this.closeEditModal();
        this.loadUsers(this.currentPage);
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to update user';
        console.error('Error updating user:', error);
      }
    });
  }


  deleteUser(): void {
    if (!this.selectedUser) return;

    this.loading = true;
    this.adminService.deleteUser(this.selectedUser._id).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.successMessage = response.message || 'User deactivated successfully!';
        this.closeDeleteModal();
        this.loadUsers(this.currentPage);
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to deactivate user';
        console.error('Error deactivating user:', error);
      }
    });
  }
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadUsers(page);
    }
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin' ? 'badge-admin' : 'badge-user';
  }
  canDeleteUser(user: IUser): boolean {
    return user.role !== 'admin' && user.isActive !== false;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
  get pages(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}

