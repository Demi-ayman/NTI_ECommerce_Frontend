import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ICategoriesResponse, ICategory } from '../../../../core/models/category.model';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-category-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterLink],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css'
})
export class CategoryList implements OnInit {
  categories: ICategory[] = [];
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  currentPage = 1;
  totalPages = 1;
  totalCategories = 0;
  limit = 10;

  searchTerm: string = '';

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;

  createCategoryForm: FormGroup;
  editCategoryForm: FormGroup;

  selectedCategory: ICategory | null = null;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.createCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });

    this.editCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }
  loadCategories(page: number = 1): void {
    this.loading = true;
    this.errorMessage = null;

    this.categoryService.getAllCategories(page, this.limit, this.searchTerm).subscribe({
      next: (response: ICategoriesResponse) => {
        this.categories = response.data;
        this.currentPage = response.pagination.current;
        this.totalPages = response.pagination.total;
        this.totalCategories = response.pagination.totalCategories;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories';
        this.loading = false;
        console.error('Error loading categories:', error);
      }
    });
  }

  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement.value;
    this.loadCategories(1);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadCategories(1);
  }

  openCreateModal(): void {
    this.createCategoryForm.reset();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  openEditModal(category: ICategory): void {
    this.selectedCategory = category;
    this.editCategoryForm.patchValue({
      name: category.name,
      description: category.description || ''
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedCategory = null;
  }

  openDeleteModal(category: ICategory): void {
    this.selectedCategory = category;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedCategory = null;
  }

  createCategory(): void {
    if (this.createCategoryForm.invalid) {
      this.markFormGroupTouched(this.createCategoryForm);
      return;
    }

    const categoryData = this.createCategoryForm.value;
    this.loading = true;

    this.categoryService.createCategory(categoryData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Category created successfully!';
        this.closeCreateModal();
        this.loadCategories(1); // Reload to show new category
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to create category';
        console.error('Error creating category:', error);
      }
    });
  }


  updateCategory(): void {
    if (this.editCategoryForm.invalid || !this.selectedCategory) {
      this.markFormGroupTouched(this.editCategoryForm);
      return;
    }

    const categoryData = this.editCategoryForm.value;
    this.loading = true;

    this.categoryService.updateCategory(this.selectedCategory._id, categoryData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Category updated successfully!';
        this.closeEditModal();
        this.loadCategories(this.currentPage);
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to update category';
        console.error('Error updating category:', error);
      }
    });
  }

  deleteCategory(): void {
  if (!this.selectedCategory) return;

  // Check if category has subcategories or products
  if (this.hasSubcategoriesOrProducts(this.selectedCategory)) {
    this.errorMessage = 'Cannot delete category that has subcategories or products. Please remove them first.';
    this.closeDeleteModal();
    setTimeout(() => this.errorMessage = null, 5000);
    return;
  }

  this.loading = true;
  this.categoryService.deleteCategory(this.selectedCategory._id).subscribe({
    next: (response: any) => {
      this.loading = false;
      this.successMessage = response.message || 'Category deleted successfully!';
      this.closeDeleteModal();
      this.loadCategories(this.currentPage);
      setTimeout(() => this.successMessage = null, 3000);
    },
    error: (error) => {
      this.loading = false;
      this.errorMessage = error.error?.message || 'Failed to delete category';
      console.error('Error deleting category:', error);
      // Optionally, close the modal on error
      this.closeDeleteModal();
    }
  });
}
  viewSubcategories(category: ICategory): void {
    this.router.navigate(['/admin/categories', category._id, 'subcategories']);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadCategories(page);
    }
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
  getSubcategoryCount(category: ICategory): number {
    return category.subcategoryCount || 0;
  }
  getProductCount(category: ICategory): number {
    return category.productCount || 0;
  }
   hasSubcategoriesOrProducts(category: ICategory): boolean {
    return this.getSubcategoryCount(category) > 0 || this.getProductCount(category) > 0;
  }

}
