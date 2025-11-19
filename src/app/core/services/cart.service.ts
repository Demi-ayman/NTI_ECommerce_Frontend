import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ICart, ICartItem } from '../models/cart.model';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiURL =`${environment.apiURL}/cart`;
  private cartSubject = new BehaviorSubject<ICartItem[]>(this.loadFromStorage());
  cart$ = this.cartSubject.asObservable();

  constructor(private http:HttpClient){}
   private loadFromStorage(): ICartItem[] {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }

   saveToStorage(items: ICartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
    this.cartSubject.next(items);
  }
  addToCart(prodId: string, quantity: number, product?: any): Observable<any>{
    const token = localStorage.getItem('token');
    if(token){
      return this.http.post(this.apiURL,{prodId,quantity});
    }
    let cart = this.getCartItems();
    const existing = cart.find((item:any)=>item.product._id === prodId);
    if(existing){
      existing.quantity+=quantity;
    }else{
      cart.push({
        _id:prodId,
        product,
        quantity,
        price:product?.price||0
      });
    }
    this.saveToStorage(cart);
    return of({message: 'Product addted to local cart'});
  }


  private addToLocalCart(prodId: string, quantity: number, product?: any): Observable<any> {
    let cart = this.getCartItems();
    const existing = cart.find((item: any) => item.product._id === prodId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        _id: prodId,
        product: product,
        quantity: quantity,
        price: product?.price || 0
      });
    }

    this.saveToStorage(cart);
    return of({message: 'Product added to local cart', data: {items: cart}});
  }


  getCartItems(): ICartItem[] {
    return this.loadFromStorage();
  }
  clearCart(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get(`${this.apiURL}`).subscribe((res: any) => {
        const items = res?.data?.items || [];
        items.forEach((item: any) => {
          this.http.delete(`${this.apiURL}/${item.product._id}`).subscribe();
        });
      });
    }
    this.saveToStorage([]);
  }
  // clearCart(): void {
  //   localStorage.removeItem('cart');
  //   this.cartSubject.next([]);
  // }

  // getCart(): Observable<{ message: string; data: ICart }> {
  //   return this.http.get<{ message: string; data: ICart }>(this.apiURL);
  // }
  getCart(): Observable<any> {
    const token = localStorage.getItem('token');
    if (token) {
      return this.http.get(this.apiURL);
    } else {
      const localCart = this.getCartItems();
      return of({
        data: { items: localCart, totalPrice: this.calculateLocalTotal(localCart) }
      });
    }
  }

  removeItem(prodId: string): Observable<any> {
  const token = localStorage.getItem('token');

  if (token) {
    return this.http.delete(`${this.apiURL}/${prodId}`).pipe(
        tap(() => this.refreshCartAfterChange())
      );
  } else {
    this.removeFromCart(prodId);
    this.refreshCartAfterChange();
    return of({ message: 'Item removed from local cart' });
  }
}
private refreshCartAfterChange() {
    const localCart = this.loadFromStorage();
    this.cartSubject.next(localCart);
  }
  private calculateLocalTotal(cart: ICartItem[]): number {
    return cart.reduce((total, item) => {
      const price = item.price || item.product?.price || 0;
      return total + price * (item.quantity || 1);
    }, 0);
  }
  removeFromCart(prodId: string): void {
    let cart = this.loadFromStorage();
    cart = cart.filter(item => item._id !== prodId);
    this.saveToStorage(cart);
  }

  syncLocalCartWithServer(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) return of(null);

    const localCart = this.getCartItems();
    if (localCart.length === 0) return of(null);

    return this.http.post(`${this.apiURL}/sync`, {
      items: localCart.map(item => ({
        prodId: item.product._id,
        quantity: item.quantity
      }))
    }).pipe(
      catchError(err => {
        console.error('Error syncing local cart:', err);
        return of(null);
      }),
      tap(() => this.clearCart())
    );
  }

}


// addToCart(prodId: string, quantity: number, product?: any): Observable<any> {
//     const token = localStorage.getItem('token');

//     if (token) {
//       return this.http.post(this.apiURL, { prodId, quantity }).pipe(
//         catchError(error => {
//           console.error('Error adding to server cart, falling back to localStorage:', error);
//           // Fallback to localStorage
//           return this.addToLocalCart(prodId, quantity, product);
//         })
//       );
//     } else {
//       return this.addToLocalCart(prodId, quantity, product);
//     }
//   }
