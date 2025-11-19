import { Component, OnInit } from '@angular/core';
import { ICart, ICartItem } from '../../core/models/cart.model';

import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { CartService } from '../../core/services/cart.service';
import { CommonModule } from '@angular/common';
import { IOrder, IOrderResponse } from '../../core/models/order.model';
import { AuthService } from '../../core/services/auth.service';
import { IProduct } from '../../core/models/product.model';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  imports: [CommonModule,ReactiveFormsModule,RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit{
 cartItems: ICartItem[] = [];
  totalPrice = 0;
  user: any;
  isLoading = false;
  staticURL = environment.staticURL;
  cart: any;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.user=this.authService.getUser();
    // Subscribe to cart changes
    // this.cartService.cart$.subscribe(items => {
    //   this.cartItems = items;
    //   this.calculateTotal();
    // });
  }

  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
  }


  updateQuantity(item: ICartItem, change: number): void {
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;

    const token = localStorage.getItem('token');
    if (token) {
      this.cartService.addToCart(item.product._id, change).subscribe({
        next: () => this.loadCart(),
        error: (err) => {
          console.error('Error updating server cart:', err);
          this.updateLocalCart(item.product._id, newQuantity);
        }
      });
    } else {
      this.updateLocalCart(item.product._id, newQuantity);
    }
  }
  private updateLocalCart(prodId: string, newQuantity: number): void {
    const cart = this.cartService.getCartItems();
    const item = cart.find((i) => i.product._id === prodId);
    if (item) item.quantity = newQuantity;
    this.cartService.saveToStorage(cart);
    this.loadCart();
  }
  removeItem(prodId: string): void {
    this.cartService.removeItem(prodId).subscribe({
      next: () => {
        console.log('Item removed successfully');
        this.loadCart(); // Refresh cart after removal
      },
      error: (err) => console.error(err)
    });
  }
  // removeItem(productId: string): void {
  //   const token = localStorage.getItem('token');

  //   if (token) {
  //     // Remove from server
  //     this.cartService.removeItem(productId).subscribe({
  //       next: (res) => {
  //         console.log('Item removed from server cart');
  //         // Also remove from local storage
  //         this.loadCart();
  //       },
  //       error: (err) => {
  //         console.error('Error removing item from server:', err);
  //         // Fallback to local removal
  //         this.cartService.removeFromCart(productId);
  //         this.loadCart();
  //       }
  //     });
  //   } else {
  //     // Remove from local storage only
  //     this.cartService.removeFromCart(productId);
  //     this.loadCart();
  //   }
  // }

  // clearCart(): void {
  //   const token = localStorage.getItem('token');

  //   if (token) {
  //     // If authenticated, clear server cart item by item
  //     this.cartItems.forEach(item => {
  //       this.cartService.removeItem(item.product._id).subscribe();
  //     });
  //   }

  //   // Always clear local storage
  //   this.cartService.clearCart();
  //   this.cartItems = [];
  //   this.totalPrice = 0;
  //   this.cart = null;
  // }
  clearCart(): void {
    this.cartService.clearCart();
    this.cartItems = [];
    this.totalPrice = 0;
    this.loadCart();
  }

  checkout(): void {
    this.isLoading = true;
    setTimeout(() => {
      alert('Checkout successful!');
      this.clearCart();
      this.isLoading = false;
    }, 1000);
  }
  // checkout() {
  //   if (!this.cartItems || this.cartItems.length === 0 ) {
  //     console.error('Cannot create order — cart is empty or not loaded.');
  //     return;
  //   }
  //   const user = this.authService.getUser();
  //   if (!user) {
  //       alert('Please login to checkout');
  //       this.router.navigate(['/auth/login']);
  //       return;
  //   }
  // // const userId = user?._id;

  // const orderData = {
  //   products: this.cartItems
  //   .filter(item => item?.product && item.product._id)
  //   .map(item => ({
  //         product: item.product._id,
  //         quantity: item.quantity,
  //         price: item.price
  //       })),
  //   name: user?.name || 'Customer',
  //   address: user?.address || 'To be provided',
  //   paymentMethod: 'CashOnDelivery' as 'CashOnDelivery'
  // };

  // console.log('Order data being sent:', orderData);
  // this.isLoading = true;

  // this.orderService.createOrder(orderData).subscribe({
  //   next: (res) => {
  //     console.log('Order created successfully', res);
  //     this.isLoading = false;

  //     this.clearCart();

  //     alert('✅ Order placed successfully!');
  //     this.router.navigate(['/orders']);
  //   },
  //   error: (err) => {
  //       this.isLoading = false;
  //       console.error('Error creating order:', err);
  //       alert('❌ Failed to place order: ' + (err.error?.message || 'Please try again'));
  //     }
  //   });
  // }
  private createOrder(user: any): void {
      const orderData: Partial<IOrder> = {
      name: user?.name || 'Customer',
      address: user?.address || 'To be provided',
      paymentMethod: 'CashOnDelivery' ,
      products: this.cartItems.map(item => ({
        product: item._id,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice: this.totalPrice
    };
    this.isLoading = true;
    this.orderService.createOrder(orderData).subscribe({
      next: (res: IOrderResponse) => {
        this.isLoading = false;
        alert('✅ Order placed successfully!');
        this.clearCart();
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error creating order:', err);
        alert('❌ Failed to place order: ' + (err.error?.message || 'Please try again'));
      }
    });
  }
  addToCart(product: IProduct): void {
    this.cartService.addToCart(product._id, 1, product);
    alert(`${product.name} added to cart!`);
  }
  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (res) => {
        const data = res?.data || {};
        this.cartItems = data.items || [];
        this.totalPrice = data.totalPrice || 0;
      },

      error: (err) => {
        console.error('Error loading cart:', err)
        this.loadFromLocalStorage();
    }
    });
  }

  // loadCart():void{
  //   const token = localStorage.getItem('token');
  //   if(token){
  //     this.cartService.getCart().subscribe({
  //       next: (res) => {
  //         if (res.data && res.data.items) {
  //           this.cart=res.data;
  //           this.cartItems = res.data.items;
  //           this.calculateTotal();
  //         }

  //       },
  //       error: (err) => {
  //         console.error('Error loading cart from server:', err);
  //         // Fallback to local storage
  //         this.loadFromLocalStorage();
  //       }

  //     })
  //   }else{
  //     // Load from local storage if not authenticated
  //     this.loadFromLocalStorage();
  //   }
  // }
  loadFromLocalStorage(): void {
    this.cartItems = this.cartService.getCartItems();
    this.calculateTotal();
  }
//  loadCart(): void {
//     // First try to load from localStorage
//     this.cartItems = this.cartService.getCartItems();
//     this.calculateTotal();

//     // If user is authenticated, try to sync with server
//     const token = localStorage.getItem('token');
//     if (token) {
//       this.cartService.getCart().subscribe({
//         next: (res) => {
//           if (res.data && res.data.items) {
//             // Convert server cart items to local format
//             const serverItems = res.data.items.map(item => ({
//               _id: item.product._id,
//               product: item.product,
//               price: item.price,
//               quantity: item.quantity
//             }));
//             this.cartService.saveToStorage(serverItems);
//           }
//         },
//         error: (err) => {
//           console.error('Error loading cart from server:', err);
//           // Continue with local storage items
//         }
//       });
//     }
//   }
  continueShopping(): void {
    this.router.navigate(['/shop']);
  }
   proceedToCheckout(): void {
    if (!this.cartItems.length) {
      alert('🛒 Your cart is empty.');
      return;
    }

    if (!this.user) {
      alert('⚠️ Please login before checkout.');
      this.router.navigate(['/auth/login']);
      return;
    }

    const orderData: Partial<IOrder> = {
      name: this.user.name || 'Customer',
      address: this.user.address || 'No address provided',
      paymentMethod: 'CashOnDelivery',
      products: this.cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice: this.totalPrice
    };

    this.isLoading = true;
    this.orderService.createOrder(orderData).subscribe({
      next: (res: IOrderResponse) => {
        this.isLoading = false;
        alert('✅ Order placed successfully!');
        this.clearCart();
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error placing order:', err);
        alert('❌ Failed to place order. Please try again.');
      }
    });
  }

  handleImageError(event: any): void {
    event.target.src = '/assets/images/placeholder-product.jpg';
  }


}
