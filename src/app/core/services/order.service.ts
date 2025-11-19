import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { IOrder, IOrderResponse, IOrdersResponse } from '../models/order.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private adminURL =`${environment.apiURL}/admin/orders`;
  private userURL = `${environment.apiURL}/orders`;
  constructor(private http:HttpClient){}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  // admin get all orders
  getAllOrders(page: number = 1, limit: number = 10, status?: string): Observable<IOrdersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status && status !== 'all') {
      params = params.set('status', status);
    }

    return this.http.get<IOrdersResponse>(this.adminURL, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  // admin get order by id
  getOrderById(id:string):Observable<IOrderResponse>{
    return this.http.get<IOrderResponse>(`${this.adminURL}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // update order by admin
  updateOrderStatus(id: string, status: string): Observable<IOrderResponse> {
    return this.http.put<IOrderResponse>(`${this.adminURL}/${id}`, { status },
      { headers: this.getAuthHeaders()}
    );
  }

  // by user
  createOrder(orderData : Partial<IOrder>):Observable<IOrderResponse>{
    return this.http.post<IOrderResponse>(this.userURL, orderData, {
      headers: this.getAuthHeaders()
    });
  }

  // by user
  getMyOrders():Observable<IOrdersResponse>{
    return this.http.get<IOrdersResponse>(`${this.userURL}/my-orders`, {
      headers: this.getAuthHeaders()
    });
  }

  // by user
  getOrdersById(id:string):Observable<IOrderResponse>{
    return this.http.get<IOrderResponse>(`${this.userURL}/${id}`);
  }


  // deleteOrder(id:string):Observable<IOrderResponse>{
  //   return this.http.delete<IOrderResponse>(`${this.apiURL}/${id}`);
  // }

  // User: Get my orders*****
  // getMyOrders(): Observable<IOrdersResponse> {
  //   return this.http.get<IOrdersResponse>(`${this.apiURL}/my-orders`);
  // }

   getOrderByIdForUser(id:string):Observable<IOrderResponse>{
    return this.http.get<IOrderResponse>(`${this.userURL}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
