import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,CommonModule,RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm: FormGroup= new FormGroup({
    name:new FormControl('',[Validators.required,Validators.minLength(3)]),
    email:new FormControl('',[Validators.required,Validators.email]),
    password:new FormControl('',[Validators.required,Validators.minLength(6)])
  });
  loading = false;
  errorMessage:string|null = null;
  successMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  submit(){
    if(this.registerForm.invalid){
      this.errorMessage='Please fill in all fields correctly';
      return ;
    }
    this.loading = true;
    this.errorMessage = null;
    this.successMessage=null;

    const {name ,email,password} =this.registerForm.value;

    // check email if exists
    this.authService.checkEmail(email).subscribe({
      next:(exists)=>{
        if(exists){
          this.loading = false;
          this.errorMessage = 'Email already registered. Please Login';
          setTimeout(() => this.router.navigate(['/auth/login']), 1000);
        }
        else{
          this.authService.register({name,email,password}).subscribe({
            next:(response)=>{
              this.loading=false;
              this.successMessage = 'Account created successfully! Redirecting to login...';
              setTimeout(() => this.router.navigate(['/auth/login']), 1000);

            },
            error: (error) => {
              console.error('Registration error:', error);
              this.loading = false;
              this.errorMessage = 'Registration failed. Please try again.';
            }
          });
        }
      },
      error: (err) => {
        console.error('Email check error:', err);
        this.loading = false;
        this.errorMessage = 'Unable to verify email. Try again.';
      }
    })
  }

}
