import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsersResponse, UsersStats } from '../models/admin.models';
import { IUser, IUserCreate, IUserResponse, IUsersResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiURL = `${environment.apiURL}/admin`;
  constructor(private http: HttpClient) {}

  // user management
  getAllUsers(page: number = 1, limit: number = 10, search: string = ''): Observable<UsersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<UsersResponse>(`${this.apiURL}/users`, { params });
  }

  getUserById(userId: string): Observable<{message: string, data: IUser}> {
    return this.http.get<{message: string, data: IUser}>(`${this.apiURL}/users/${userId}`);
  }

  createAdmin(userData: IUserCreate): Observable<IUserResponse> {
    return this.http.post<IUserResponse>(`${this.apiURL}/users/create-admin`, userData);
  }

  updateUser(userId: string, userData: Partial<IUser>): Observable<IUserResponse> {
    return this.http.put<IUserResponse>(`${this.apiURL}/users/${userId}`, userData);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiURL}/users/${userId}`);
  }

  getUsersStats(): Observable<{message: string, data: UsersStats}> {
    return this.http.get<{message: string, data: UsersStats}>(`${this.apiURL}/users/stats/dashboard`);
  }

  addProduct(productData: any): Observable<any> {
    return this.http.post(`${this.apiURL}/products`, productData);
  }

  getAllOrders(): Observable<any> {
    return this.http.get(`${this.apiURL}/orders`);
  }
}
