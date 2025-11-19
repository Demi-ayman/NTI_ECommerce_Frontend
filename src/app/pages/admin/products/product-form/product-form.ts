import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICategory } from '../../../../core/models/category.model';
import { ISubcategory } from '../../../../core/models/subcategory.model';
import { IProduct } from '../../../../core/models/product.model';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryService } from '../../../../core/services/category.service';
import { ProductService } from '../../../../core/services/product.service';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule,RouterLink, FormsModule,ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnInit{
  productForm: FormGroup;
  isEdit = false;
  productId: string | null = null;
  loading = false;
  submitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  categories: ICategory[] = [];
  subcategories: ISubcategory[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  currentProduct: IProduct | null = null;
constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr:ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      subcategory: [''],
      imgURL: [null]
    });
  }
ngOnInit(): void {
    this.loadCategories();

    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId && this.productId !== 'new') {
      this.isEdit = true;
      this.loadProduct(this.productId);
    }

    // Listen to category changes to load subcategories
    this.productForm.get('category')?.valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.cdr.detectChanges();
        this.loadSubcategories(categoryId);
      } else {
        this.subcategories = [];
        this.productForm.patchValue({ subcategory: '' });
      }
    });
  }
loadCategories(): void {
    this.loading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories';
        this.loading = false;
        console.error('Error loading categories:', error);
      }
    });
  }
  loadSubcategories(categoryId: string): void {
    this.categoryService.getSubcategoriesByCategory(categoryId).subscribe({
      next: (response) => {
        this.subcategories = response.data;
      },
      error: (error) => {
        console.error('Error loading subcategories:', error);
        this.subcategories = [];
      }
    });
  }
   loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        this.currentProduct = response.data;
        this.productForm.patchValue({
          name: response.data.name,
          description: response.data.description,
          price: response.data.price,
          stock: response.data.stock,
          category: response.data.category._id,
          subcategory: response.data.subcategory?._id || ''
        });

        // Set image preview if exists
        if (response.data.imgURL) {
          this.imagePreview = this.getImageUrl(response.data.imgURL);
        }

        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load product';
        this.loading = false;
        console.error('Error loading product:', error);
      }
    });
  }
  onFileSelected(event: Event): void {
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
    this.imagePreview = this.currentProduct?.imgURL ? this.getImageUrl(this.currentProduct.imgURL) : null;
    this.productForm.patchValue({ image: null });
  }

  getImageUrl(imgURL: string): string {
    if (!imgURL) return '';
    if (imgURL.startsWith('http')) return imgURL;
    const baseUrl = environment.staticURL || environment.apiURL;
    return `${baseUrl}${imgURL.startsWith('/') ? '' : '/'}${imgURL}`;
  }


  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const formData = new FormData();

    // Append form data
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('price', this.productForm.get('price')?.value.toString());
    formData.append('stock', this.productForm.get('stock')?.value.toString());
    formData.append('category', this.productForm.get('category')?.value);

    const subcategory = this.productForm.get('subcategory')?.value;
    if (subcategory) {
      formData.append('subcategory', subcategory);
    }

    // Append image if selected
    if (this.selectedFile) {
      formData.append('imgURL', this.selectedFile);
    }

    if (this.isEdit && this.productId) {
      this.productService.updateProduct(this.productId, formData).subscribe({
        next: (response) => {
          this.submitting = false;
          this.successMessage = 'Product updated successfully!';
          setTimeout(() => {
            this.router.navigate(['/admin/product']);
          }, 1500);
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error.error?.message || 'Failed to update product';
          console.error('Error updating product:', error);
        }
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: (response) => {
          this.submitting = false;
          this.successMessage = 'Product created successfully!';
          setTimeout(() => {
            this.router.navigate(['/admin/product']);
          }, 1500);
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error.error?.message || 'Failed to create product';
          console.error('Error creating product:', error);
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get formControls() {
    return this.productForm.controls;
  }
}
