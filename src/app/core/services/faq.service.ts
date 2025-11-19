import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICreateFaqRequest, IFaqResponse, IFaqsResponse, IUpdateFaqRequest } from '../models/faq.model';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiURL =`${environment.apiURL}/admin/faq`;
  constructor(private http:HttpClient){}

  // for public
  getFAQs():Observable<IFaqsResponse>{
    return this.http.get<IFaqsResponse>(this.apiURL);
  }

  // get all faqs for admin
  getAllFAQs():Observable<IFaqsResponse>{
    return this.http.get<IFaqsResponse>(this.apiURL);
  }
  getFAQ(id: string): Observable<IFaqResponse> {
    return this.http.get<IFaqResponse>(`${this.apiURL}/${id}`);
  }
  createFAQ(data: ICreateFaqRequest): Observable<IFaqResponse> {
    return this.http.post<IFaqResponse>(this.apiURL, data);
  }
  updateFAQ(id: string, data: IUpdateFaqRequest): Observable<IFaqResponse> {
    return this.http.put<IFaqResponse>(`${this.apiURL}/${id}`, data);
  }
  deleteFAQ(id: string): Observable<IFaqResponse> {
    return this.http.delete<IFaqResponse>(`${this.apiURL}/${id}`);
  }

}
