import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiURL =`${environment.apiURL}/auth`;
  private tokenKey ='token';
  private userKey = 'user';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http:HttpClient,private router: Router){}


  register(data:any):Observable<any>{
    return this.http.post(`${this.apiURL}/register`,data).pipe(
      tap((response: any) => {
        if(response?.token && response?.user){
          this.saveAuthData(response.token,response.user);
          this.loggedIn.next(true);

          if(response.user.role === 'admin'){
            this.router.navigate(['/admin/dashboard'])
          }else{
            this.router.navigate(['/profile'])
          }
        }
      }),
      catchError((error)=>{
        let errorMessage = 'Registration failed. Please try agin.';
        if(error.error?.message){
          errorMessage = error.error.message;
        }else if(error.status ===400){
          errorMessage ='Invalid registeration data.'
        }
        return throwError(()=> new Error(errorMessage));
      })
    );
  }
  checkEmail(email: string) {
    return this.http.get<boolean>(`${this.apiURL}/check-email?email=${email}`).pipe(
      catchError((error)=>{
        console.error('Error checking email: ',error);
        return throwError(()=>new Error('Unable to verify email. Try again.'))
      })
    );
  }


  login(data:{ email: string; password: string }):Observable<any>{
    return this.http.post(`${this.apiURL}/login`,data).pipe(
      tap((response: any) => {
        if(response?.token && response?.user){
          this.saveAuthData(response.token,response.user);
          this.loggedIn.next(true);
          if (response.user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/profile']);
          }
        }
      }),
      catchError((error)=>{
        let errorMessage = 'An Unexpected error occurred. Please try again later.'
        if(error.status === 401){
          errorMessage = 'Invalid email or password';
        }else if(error.status ===404 ){
          errorMessage = 'User not found. Please sign up first.';
        }else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(()=> new Error(errorMessage));
      })
    );
  }


  private saveAuthData(token:string , user:any):void{
    localStorage.setItem(this.tokenKey,token);
    localStorage.setItem(this.userKey,JSON.stringify(user));
  }

  getToken():string|null{
    return localStorage.getItem(this.tokenKey);
  }

  getUser():any{
    const user = localStorage.getItem(this.userKey);
    return user? JSON.parse(user):null;
  }

  getUserRole():string|null{
    const user = this.getUser();
    return user?.role || null;
  }

  logout():void{
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.loggedIn.next(false);

  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }


   // not yet implemented
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiURL}/profile`);
  }

  // i think i didn't implement route yet ***
  getDashboardStates(){
    this.http.get(`${this.apiURL}/states`)
  }
  getAllUsers(){
    this.http.get(`${this.apiURL}/users`)
  }
  


}


// login(credentials:{email:string ;password:string}){
  //   return this.http.post<any>(`${this.apiURL}/login`,credentials).pipe(
  //     tap((response)=>{
  //       localStorage.setItem('token',response.token);
  //       localStorage.setItem('role',response.user.role)
  //     })
  //   )
  // }
  // getUserRole():string|null{
  //   return localStorage.getItem('role');
  // }
  // isLoggedIn(): boolean {
  //   return !!localStorage.getItem('token');
  // }

  // logout() {
  //   localStorage.clear();
  // }

