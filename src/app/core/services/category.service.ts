import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICategoriesResponse, ICategoryResponse, SubcategoriesByCategoryResponse } from '../models/category.model';
import { ICategory } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiURL =`${environment.apiURL}/category`;
 
  constructor(private http:HttpClient){}

  getAllCategories(page: number = 1, limit: number = 10, search: string = '' ):Observable<ICategoriesResponse>{
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<ICategoriesResponse>(this.apiURL,{params});
  }

  getCategoryById(id:string):Observable<ICategoryResponse>{
    return this.http.get<ICategoryResponse>(`${this.apiURL}/${id}`);
  }

  createCategory(categoryData: { name: string; description?: string }):Observable<ICategoryResponse>{
    return this.http.post<ICategoryResponse>(this.apiURL,categoryData);
  }

  updateCategory(id: string, categoryData: { name?: string; description?: string }): Observable<ICategoryResponse> {
    return this.http.put<ICategoryResponse>(`${this.apiURL}/${id}`, categoryData);
  }

  deleteCategory(id:string):Observable<{message:string}>{
    return this.http.delete<{message:string}>(`${this.apiURL}/${id}`);
  }
// get subcategories by category
  getSubcategoriesByCategory(id: string, page: number = 1, limit: number = 10): Observable<SubcategoriesByCategoryResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<SubcategoriesByCategoryResponse>(`${this.apiURL}/${id}/subcategories`, { params });
  }
}
