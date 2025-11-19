import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProduct, IProductResponse, IProductsResponse } from '../models/product.model';
import { Form } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiURL =`${environment.apiURL}/admin/products`;
  constructor(private http:HttpClient){}

  getAllProducts(page: number = 1, limit: number = 10, search: string = ''): Observable<IProductsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<IProductsResponse>(this.apiURL, { params });
  }

  getProductById(id: string): Observable<IProductResponse> {
    return this.http.get<IProductResponse>(`${this.apiURL}/${id}`);
  }

  createProduct(productData: FormData): Observable<IProductResponse> {
    return this.http.post<IProductResponse>(this.apiURL, productData);
  }

  updateProduct(id: string, productData: FormData): Observable<IProductResponse> {
    return this.http.put<IProductResponse>(`${this.apiURL}/${id}`, productData);
  }

  deleteProduct(id: string): Observable<IProductResponse> {
    return this.http.delete<IProductResponse>(`${this.apiURL}/${id}`);
  }
  // not sure if we will need them or not
  searchProducts(query:string):Observable<IProductsResponse>{
    return this.http.get<IProductsResponse>(`${this.apiURL}?name=${query}`);
  }

  getProductsByCategory(categoryId:string):Observable<IProductsResponse>{
    return this.http.get<IProductsResponse>(`${this.apiURL}?category=${categoryId}`)
  }
  getProductsBySubcategory(subcategory:string):Observable<IProductsResponse>{
    return this.http.get<IProductsResponse>(`${this.apiURL}?category=${subcategory}`)
  }
}
