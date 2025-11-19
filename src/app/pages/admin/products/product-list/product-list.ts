import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IProduct, IProductsResponse } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { environment } from '../../../../../environments/environment';
import { ICategory } from '../../../../core/models/category.model';
import { ISubcategory } from '../../../../core/models/subcategory.model';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit{
  staticURL = environment.staticURL;
  products: IProduct[] = [];
  categories: ICategory[] = [];
  subcategories: ISubcategory[] = [];

  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  limit = 10;

  searchTerm: string = '';

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;

  createProductForm: FormGroup;
  editProductForm: FormGroup;

  selectedProduct: IProduct | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.createProductForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      subcategory: [''],
      image: [null]
    });

    this.editProductForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      subcategory: [''],
      image: [null]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(page: number = 1): void {
    this.loading = true;
    this.errorMessage = null;

    this.productService.getAllProducts(page, this.limit, this.searchTerm).subscribe({
      next: (response: IProductsResponse) => {
        this.products = response.data;
        this.currentPage = response.pagination.current;
        this.totalPages = response.pagination.total;
        this.totalProducts = response.pagination.totalProducts;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load products';
        this.loading = false;
        console.error('Error loading products', error);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadSubcategories(categoryId: string, form: FormGroup): void {
    this.categoryService.getSubcategoriesByCategory(categoryId).subscribe({
      next: (response) => {
        this.subcategories = response.data;
      },
      error: (error) => {
        console.error('Error loading subcategories:', error);
        this.subcategories = [];
        form.patchValue({ subcategory: '' });
      }
    });
  }

  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement.value;
    this.loadProducts(1);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadProducts(1);
  }

  openCreateModal(): void {
    this.createProductForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.subcategories = [];
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  openEditModal(product: IProduct): void {
    this.selectedProduct = product;
    this.editProductForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category._id,
      subcategory: product.subcategory?._id || ''
    });

    // Load subcategories for the selected category
    this.loadSubcategories(product.category._id, this.editProductForm);

    // Set image preview
    if (product.imgURL) {
      this.imagePreview = this.getImageUrl(product.imgURL);
    }

    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedProduct = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  openDeleteModal(product: IProduct): void {
    this.selectedProduct = product;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedProduct = null;
  }

  onCategoryChange(categoryId: string, form: FormGroup): void {
    if (categoryId) {
      this.loadSubcategories(categoryId, form);
    } else {
      this.subcategories = [];
      form.patchValue({ subcategory: '' });
    }
  }

  onFileSelected(event: Event, form: FormGroup): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = this.selectedProduct?.imgURL ? this.getImageUrl(this.selectedProduct.imgURL) : null;
  }

  createProduct(): void {
    if (this.createProductForm.invalid) {
      this.markFormGroupTouched(this.createProductForm);
      return;
    }

    this.loading = true;
    const formData = new FormData();

    // Append form data
    formData.append('name', this.createProductForm.get('name')?.value);
    formData.append('description', this.createProductForm.get('description')?.value);
    formData.append('price', this.createProductForm.get('price')?.value.toString());
    formData.append('stock', this.createProductForm.get('stock')?.value.toString());
    formData.append('category', this.createProductForm.get('category')?.value);

    const subcategory = this.createProductForm.get('subcategory')?.value;
    if (subcategory) {
      formData.append('subcategory', subcategory);
    }

    // Append image if selected
    if (this.selectedFile) {
      formData.append('imgURL', this.selectedFile);
    }

    this.productService.createProduct(formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Product created successfully!';
        this.closeCreateModal();
        this.loadProducts(1);
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to create product';
        console.error('Error creating product:', error);
      }
    });
  }

  updateProduct(): void {
    if (this.editProductForm.invalid || !this.selectedProduct) {
      this.markFormGroupTouched(this.editProductForm);
      return;
    }

    this.loading = true;
    const formData = new FormData();

    // Append form data
    formData.append('name', this.editProductForm.get('name')?.value);
    formData.append('description', this.editProductForm.get('description')?.value);
    formData.append('price', this.editProductForm.get('price')?.value.toString());
    formData.append('stock', this.editProductForm.get('stock')?.value.toString());
    formData.append('category', this.editProductForm.get('category')?.value);

    const subcategory = this.editProductForm.get('subcategory')?.value;
    if (subcategory) {
      formData.append('subcategory', subcategory);
    }

    // Append image if selected
    if (this.selectedFile) {
      formData.append('imgURL', this.selectedFile);
    }

    this.productService.updateProduct(this.selectedProduct._id, formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Product updated successfully!';
        this.closeEditModal();
        this.loadProducts(this.currentPage);
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to update product';
        console.error('Error updating product:', error);
      }
    });
  }

  viewProduct(product: IProduct): void {
    this.router.navigate(['/product', product._id]);
  }

  getImageUrl(imgURL: string): string {
    if (!imgURL) return '/assets/images/placeholder-product.jpg';
    if (imgURL.startsWith('http')) return imgURL;
    return `${environment.apiURL}${imgURL}`;
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const placeholder = img.nextElementSibling as HTMLElement;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadProducts(page);
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

  get formControls() {
    return {
      create: this.createProductForm.controls,
      edit: this.editProductForm.controls
    };
  }
}


