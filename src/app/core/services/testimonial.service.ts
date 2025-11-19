import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITestimonial, ITestimonialResponse, ITestimonialsResponse } from '../models/testimonial.model';

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private apiURL=`${environment.apiURL}/testimonial`;
  constructor(private http:HttpClient){}

  // get all testimonials by admin
  getAllTestimonials():Observable<ITestimonialsResponse>{
    return this.http.get<ITestimonialsResponse>(`${this.apiURL}/all`);
  }

  // public get approved testimonials only
  getApprovedTestimonials(): Observable<ITestimonialsResponse> {
    return this.http.get<ITestimonialsResponse>(this.apiURL);
  }

  // user: create testimonial
  createTestimonial(testimonialData: { message: string; rating: number }): Observable<ITestimonialResponse> {
    return this.http.post<ITestimonialResponse>(this.apiURL, testimonialData);
  }
  // admin only update
 updateTestimonial(id: string, testimonialData: { message: string; rating: number }): Observable<ITestimonialResponse> {
    return this.http.put<ITestimonialResponse>(`${this.apiURL}/${id}`, testimonialData);
  }
  // approve only by admin
  approveTestimonial(id: string): Observable<ITestimonialResponse> {
    return this.http.put<ITestimonialResponse>(`${this.apiURL}/${id}/approve`, {});
  }

  // delete only by admin
  deleteTestimonial(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiURL}/${id}`);
  }
}
