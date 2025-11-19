import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IProduct, IProductsResponse } from '../../core/models/product.model';
import { ICategory } from '../../core/models/category.model';
import { debounceTime, distinctUntilChanged, Subject, Subscription, takeUntil } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { environment } from '../../../environments/environment';
import { SubcategoryService } from '../../core/services/subcategory.service';

@Component({
  selector: 'app-shop',
  imports: [CommonModule,FormsModule,RouterModule,],
  templateUrl: './shop.html',
  styleUrl: './shop.css'
})
export class Shop implements AfterViewInit,OnDestroy{
  staticURL = environment.staticURL;

  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  categories: ICategory[] = [];
  subcategories: any[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedSubcategory = '';
  priceRange = { min: 0, max: 10000 };
  sortBy = 'name';
  loading: boolean = true;
  subscategories:any = ''
  errorMessage: string = '';
  private subscriptions = new Subscription();


  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService:CartService , private subcategory: SubcategoryService) {}

  ngAfterViewInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.loadSubCategories()
  }
  loadCategories():void{
    this.categoryService.getAllCategories().subscribe({
      next: (res) => (this.categories = res.data),
      error: (err) => console.error(err)
    });
  }
  loadSubCategories():void{
    this.subcategory.getAllSubcategories().subscribe({
      next: (res) =>{
        this.subcategories = res.data
        console.log(res)
        console.log(this.subcategories)
      },
      error: (err) => console.error(err)
    });
  }



addToCart(product: IProduct): void {
  this.cartService.addToCart(product._id,1,product).subscribe({
    next:(res)=>{
      console.log('Product added to cart:', res);
      alert(`${product.name} added to cart!`);
    },
    error:(err)=>{
      console.error( `Error adding to cart:` ,err);
      let cart = JSON.parse(localStorage.getItem('cart')||'[]');
      const existing = cart.find((p:any)=>p._id === product._id);
      if(existing){
        existing.quantity=(existing.quantity || 1)+1;
      }else{
        cart.push({...product, quantity: 1});
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      alert(`${product.name} added to cart!`);
    }
  })
  // let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  // const existing = cart.find((p: IProduct) => p._id === product._id);
  // if (existing) existing.quantity = (existing.quantity || 1) + 1;
  // else cart.push({ ...product, quantity: 1 });
  // localStorage.setItem('cart', JSON.stringify(cart));
  // alert(`${product.name} added to cart!`);
}

  loadProducts(): void {
    const sub = this.productService.getAllProducts().subscribe({
      next: (res) => {
        this.products = res.data;
        this.loading = false;
        this.filteredProducts=[...this.products];
        this.loading=false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load products';
        this.loading = false;
      }
    });
    this.subscriptions.add(sub);
  }
   applyFilters(): void{
    let filtered = [...this.products];
    if(this.searchTerm){
      filtered=filtered.filter(p=>p.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category?._id === this.selectedCategory);
    }

    if (this.selectedSubcategory) {
      filtered = filtered.filter(p => p.subcategory?._id === this.selectedSubcategory);
    }

    filtered = filtered.filter(p =>
      p.price >= this.priceRange.min && p.price <= this.priceRange.max
    );

    switch (this.sortBy) {
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'createdAt':
        filtered.sort(
          (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    this.filteredProducts = filtered;
   }
   clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedSubcategory = '';
    this.priceRange = { min: 0, max: 10000 };
    this.sortBy = 'name';
    this.filteredProducts = [...this.products];
  }


  // addToCart(product: IProduct): void {
  //   let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  //   const existing = cart.find((p: IProduct) => p._id === product._id);
  //   if (existing) existing.quantity = (existing.quantity || 1) + 1;
  //   else cart.push({ ...product, quantity: 1 });
  //   localStorage.setItem('cart', JSON.stringify(cart));
  //   alert(`${product.name} added to cart!`);
  // }
  trackById(index: number, item: any): string {
    return item._id;
  }
  truncateText(text: string, limit: number): string {
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  }
   handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/300x300?text=No+Image';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
// products: IProduct[] = [];
//   filteredProducts: IProduct[] = [];
//   currentPage = 1;
//   itemsPerPage = 12;
//   totalProducts = 0;
//   totalPages = 0;

//   isLoading = false;
//   isAddingToCart: { [productId: string]: boolean } = {};

//   searchTerm = '';
//   selectedCategory = '';
//   selectedSubcategory = '';
//   priceRange = { min: 0, max: 1000 };
//   sortBy = 'name';
//   sortOrder: 'asc' | 'desc' = 'asc';

//   categories: ICategory[] = [];
//   subcategories: any[] = [];

//   private searchSubject = new Subject<string>();
//   private destroy$ = new Subject<void>();

//   // Static URL for images
//   staticURL = environment.staticURL;

//   constructor(
//     private productService: ProductService,
//     private cartService: CartService,
//     private categoryService: CategoryService
//   ) {}

//   ngOnInit(): void {
//     this.loadCategories();
//     this.loadProducts();

//     // Setup search debounce
//     this.searchSubject.pipe(
//       debounceTime(300),
//       distinctUntilChanged(),
//       takeUntil(this.destroy$)
//     ).subscribe(() => {
//       this.currentPage = 1;
//       this.applyFilters();
//     });
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }


//   loadProducts(): void {
//     this.isLoading = true;
//     // Load all products without pagination for client-side filtering
//     this.productService.getAllProducts(1, 1000, '').subscribe({
//       next: (response: IProductsResponse) => {
//         this.products = response.data;
//         this.filteredProducts = [...this.products];
//         this.totalProducts = this.products.length;
//         this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
//         this.isLoading = false;
//         this.applyFilters();
//       },
//       error: (error) => {
//         console.error('Error loading products:', error);
//         this.isLoading = false;
//         this.products = [];
//         this.filteredProducts = [];
//       }
//     });
//   }

//   loadCategories(): void {
//     this.categoryService.getAllCategories(1, 100).subscribe({
//       next: (response) => {
//         this.categories = response.data;
//       },
//       error: (error) => {
//         console.error('Error loading categories:', error);
//       }
//     });
//   }
//   onCategoryChange(): void {
//     this.selectedSubcategory = ''; // Reset subcategory when category changes
//     this.currentPage = 1;
//     this.applyFilters();
//   }
//   applyFilters(): void {
//     let filtered = [...this.products];

//     // Search filter
//     if (this.searchTerm) {
//       filtered = filtered.filter(product =>
//         product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
//         product.description.toLowerCase().includes(this.searchTerm.toLowerCase())
//       );
//     }

//     // Category filter
//     if (this.selectedCategory) {
//       filtered = filtered.filter(product =>
//         product.category?._id === this.selectedCategory
//       );
//     }

//     // Subcategory filter
//     if (this.selectedSubcategory) {
//       filtered = filtered.filter(product =>
//         product.subcategory?._id === this.selectedSubcategory
//       );
//     }

//     // Price range filter
//     filtered = filtered.filter(product =>
//       product.price >= this.priceRange.min &&
//       product.price <= this.priceRange.max
//     );

//     // Sorting
//     filtered.sort((a, b) => {
//       let aValue: any, bValue: any;

//       switch (this.sortBy) {
//         case 'price':
//           aValue = a.price;
//           bValue = b.price;
//           break;
//         case 'createdAt':
//           aValue = new Date(a.createdAt || '');
//           bValue = new Date(b.createdAt || '');
//           break;
//         case 'name':
//         default:
//           aValue = a.name.toLowerCase();
//           bValue = b.name.toLowerCase();
//           break;
//       }

//       if (this.sortOrder === 'asc') {
//         return aValue > bValue ? 1 : -1;
//       } else {
//         return aValue < bValue ? 1 : -1;
//       }
//     });

//     this.filteredProducts = filtered;
//     this.totalProducts = filtered.length;
//     this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);

//     // Apply pagination
//     this.updatePagination();
//   }
//   updatePagination(): void {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     const endIndex = startIndex + this.itemsPerPage;
//     this.filteredProducts = this.filteredProducts.slice(startIndex, endIndex);
//   }
//   onSearchChange(): void {
//     this.searchSubject.next(this.searchTerm);
//   }
//   onPriceRangeChange(): void {
//     this.currentPage = 1;
//     this.applyFilters();
//   }
//   onSortChange(): void {
//     this.applyFilters();
//   }
//   onItemsPerPageChange(): void {
//     this.currentPage = 1;
//     this.applyFilters();
//   }
//   // Clear all filters
//   clearFilters(): void {
//     this.searchTerm = '';
//     this.selectedCategory = '';
//     this.selectedSubcategory = '';
//     this.priceRange = { min: 0, max: 1000 };
//     this.sortBy = 'name';
//     this.sortOrder = 'asc';
//     this.currentPage = 1;
//     this.applyFilters();
//   }

//   addToCart(product: IProduct): void {
//     this.isAddingToCart[product._id] = true;

//     this.cartService.addToCart(product._id, 1).subscribe({
//       next: (response) => {
//         this.isAddingToCart[product._id] = false;
//         this.showToast('Product added to cart!', 'success');
//       },
//       error: (error) => {
//         this.isAddingToCart[product._id] = false;
//         console.error('Error adding to cart:', error);
//         this.showToast('Error adding product to cart', 'error');
//       }
//     });
//   }

//   goToPage(page: number): void {
//     if (page >= 1 && page <= this.totalPages) {
//       this.currentPage = page;
//       this.applyFilters();
//     }
//   }

//   getPaginationPages(): number[] {
//     const pages = [];
//     const maxVisiblePages = 5;
//     let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
//     let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

//     if (endPage - startPage + 1 < maxVisiblePages) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }

//     return pages;
//   }

//   // Get product image URL using staticURL
//   getProductImage(product: IProduct): string {
//     if (product.imgURL) {
//       return this.staticURL + product.imgURL;
//     }
//     // Return a placeholder if no image
//     return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmYWZjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
//   }
//   handleImageError(event: Event): void {
//     const img = event.target as HTMLImageElement;
//     img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmYWZjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
//   }

//   getStockStatus(product: IProduct): { text: string, class: string } {
//     if (product.stock === 0) {
//       return { text: 'Out of Stock', class: 'out-of-stock' };
//     } else if (product.stock < 10) {
//       return { text: `Only ${product.stock} left`, class: 'low-stock' };
//     } else {
//       return { text: 'In Stock', class: 'in-stock' };
//     }
//   }

//   truncateText(text: string, limit: number = 100): string {
//     if (!text) return '';
//     if (text.length <= limit) return text;
//     return text.substr(0, limit) + '...';
//   }

//   private showToast(message: string, type: 'success' | 'error'): void {
//     const toast = document.createElement('div');
//     toast.className = `toast toast-${type}`;
//     toast.textContent = message;
//     toast.style.cssText = `
//       position: fixed;
//       top: 20px;
//       right: 20px;
//       padding: 16px 24px;
//       border-radius: 12px;
//       color: white;
//       font-weight: 600;
//       z-index: 10000;
//       animation: slideIn 0.3s ease;
//       box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
//       font-family: 'Inter', sans-serif;
//     `;

//     if (type === 'success') {
//       toast.style.background = 'linear-gradient(135deg, #10b981, #059669)';
//     } else {
//       toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
//     }

//     document.body.appendChild(toast);

//     setTimeout(() => {
//       toast.style.animation = 'slideOut 0.3s ease';
//       setTimeout(() => {
//         if (document.body.contains(toast)) {
//           document.body.removeChild(toast);
//         }
//       }, 300);
//     }, 3000);
//   }
