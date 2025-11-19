import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IUser, IUserCreate, IUserResponse, IUsersResponse } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiURL =`${environment.apiURL}/user`;
  constructor(private http:HttpClient){}

  // create normal user
  createUser(userData:IUserCreate):Observable<IUserResponse>{
    return this.http.post<IUserResponse>(this.apiURL,userData)
  }

  //create admin
  createAdmin(userData:IUserCreate):Observable<IUserResponse>{
    return this.http.post<IUserResponse>(`${this.apiURL}/create-admin`,userData)
  };

  getAllUsers():Observable<IUsersResponse>{
    return this.http.get<IUsersResponse>(this.apiURL);
  }

  getUserById(id:string):Observable<IUserResponse>{
    return this.http.get<IUserResponse>(`${this.apiURL}/${id}`)
  };

  updateUser(id:string,userData:Partial<IUser>):Observable<IUserResponse>{
    return this.http.put<IUserResponse>(`${this.apiURL}/${id}`,userData)
  };
}
