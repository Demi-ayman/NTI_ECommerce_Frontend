import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { IWishlistResponse } from '../models/wishlist.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiURL = `${environment.apiURL}/wishlist`;
  constructor(private http: HttpClient) {}
  
  getWishlist(): Observable<IWishlistResponse> {
    return this.http.get<IWishlistResponse>(this.apiURL);
  }

  addToWishlist(productId: string): Observable<IWishlistResponse> {
    return this.http.post<IWishlistResponse>(this.apiURL, { productId });
  }

  removeFromWishlist(productId: string): Observable<IWishlistResponse> {
    return this.http.delete<IWishlistResponse>(`${this.apiURL}/${productId}`);
  }

  isInWishlist(productId: string): Observable<{ inWishlist: boolean }> {
    return this.http.get<{ inWishlist: boolean }>(`${this.apiURL}/check/${productId}`);
  }
}
