import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ISubcategoriesResponse, ISubcategory, ISubcategoryResponse, ProductsBySubcategoryResponse } from '../models/subcategory.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {
  getSubcategoriesByCategory(categoryId: string) {
    throw new Error('Method not implemented.');
  }
  private apiURL =`${environment.apiURL}/subcategory`;
  constructor(private http:HttpClient){}

  getAllSubcategories(page: number = 1, limit: number = 10, search: string = ''): Observable<ISubcategoriesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<ISubcategoriesResponse>(this.apiURL,{params});
  }

  getSubcategoryById(id: string): Observable<ISubcategoryResponse> {
      return this.http.get<ISubcategoryResponse>(`${this.apiURL}/${id}`);
  }

  createSubcategory(subcategoryData: { name: string; category: string; description?: string }): Observable<ISubcategoryResponse> {
      return this.http.post<ISubcategoryResponse>(this.apiURL, subcategoryData);
    }

  updateSubcategory(id: string, subcategoryData: Partial<ISubcategory>): Observable<ISubcategoryResponse> {
    return this.http.put<ISubcategoryResponse>(`${this.apiURL}/${id}`, subcategoryData);
  }

  deleteSubcategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiURL}/${id}`);
  }
  // Get products by subcategory
  getProductsBySubcategory(subcategoryId: string, page: number = 1, limit: number = 10): Observable<ProductsBySubcategoryResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ProductsBySubcategoryResponse>(`${this.apiURL}/${subcategoryId}/products`, { params });
  }
}
