import { Component, OnInit } from '@angular/core';
import { ISubcategoriesResponse, ISubcategory, ISubcategoryResponse } from '../../../core/models/subcategory.model';
import { ICategoriesResponse, ICategory } from '../../../core/models/category.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubcategoryService } from '../../../core/services/subcategory.service';
import { CategoryService } from '../../../core/services/category.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-subcategories',
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterLink],
  templateUrl: './subcategories.html',
  styleUrl: './subcategories.css'
})
export class Subcategories implements OnInit{
  subcategories: ISubcategory[] = [];
  categories: ICategory[] = [];
  subcategoryForm: FormGroup;
  isEditing = false;
  currentSubcategoryId: string | null = null;
  isLoading = false;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalItems = 0;

  constructor(
    private fb:FormBuilder,
    private subcategoryService: SubcategoryService,
    private categoryService: CategoryService
  ){
    this.subcategoryForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadSubcategories();
    this.loadCategories();
  }
  createForm():FormGroup{
    return this.fb.group({
      name:['',[Validators.required,Validators.minLength(2)]],
      category: ['', Validators.required],
      description: ['']
    })
  }
  loadSubcategories(){
    this.isLoading=true;
    this.subcategoryService.getAllSubcategories(this.currentPage,this.itemsPerPage,this.searchTerm).subscribe({
      next:(response:ISubcategoriesResponse)=>{
        this.subcategories=response.data;
        this.totalPages=response.pagination.total;
        this.totalItems=response.pagination.totalSubcategories;
        this.isLoading=false;
      },
      error:(error)=>{
        console.error('Error loading subcategories:', error);
        this.isLoading = false;
      }
    })
  }
  loadCategories(){
    this.categoryService.getAllCategories(1,100,'').subscribe({
      next:(response:ICategoriesResponse)=>{
        this.categories=response.data;
      },
      error:(error)=>{
        console.error('Error loading categories:', error);
      }
    })
  }
  onSubmit(){
    if(this.subcategoryForm.invalid){
      this.markFormGroupTouched();
      return;
    }
    this.isLoading=true;
    const formData=this.subcategoryForm.value;

    // update if its exist
    if(this.isEditing&&this.currentSubcategoryId){
      this.subcategoryService.updateSubcategory(this.currentSubcategoryId, formData).subscribe({
        next:(response: ISubcategoryResponse) =>{
          this.loadSubcategories();
            this.resetForm();
            this.isLoading = false;
        },error: (error) => {
            console.error('Error updating subcategory:', error);
            this.isLoading = false;
          }
      })
      // create new one if not exist
    }else{
        this.subcategoryService.createSubcategory(formData)
        .subscribe({
          next: (response: ISubcategoryResponse) => {
            this.loadSubcategories();
            this.resetForm();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error creating subcategory:', error);
            this.isLoading = false;
          }
        });
    }
  }

  editSubcategory(subcategory: ISubcategory) {
    this.isEditing = true;
    this.currentSubcategoryId = subcategory._id;
    this.subcategoryForm.patchValue({
      name: subcategory.name,
      category: subcategory.category._id,
      description: subcategory.description || ''
    });
     setTimeout(() => {
      document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  resetForm() {
    this.subcategoryForm.reset();
    this.isEditing = false;
    this.currentSubcategoryId = null;
  }
  onSearch() {
    this.currentPage = 1;
    this.loadSubcategories();
  }

  clearSearch() {
    this.searchTerm = '';
    this.onSearch();
  }
  onPageChange(page: number) {
    this.currentPage = page;
    this.loadSubcategories();
  }

  markFormGroupTouched() {
    Object.keys(this.subcategoryForm.controls).forEach(key => {
      const control = this.subcategoryForm.get(key);
      control?.markAsTouched();
    });
  }
  get totalDisplayed() {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${start}-${end} of ${this.totalItems} subcategories`;
  }
  isFieldInvalid(fieldName: string): boolean {
    const field = this.subcategoryForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
  getFieldError(fieldName: string): string {
    const field = this.subcategoryForm.get(fieldName);
    if (field?.errors?.['required']) {
      return 'This field is required';
    }
    if (field?.errors?.['minlength']) {
      return `Minimum ${field.errors?.['minlength'].requiredLength} characters required`;
    }
    return '';
  }

  // Pagination helper method
  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      }
    }

    return pages;
  }
  handlePageClick(page: number | string): void {
  if (page === '...') return; 
  this.onPageChange(Number(page));
}
}
