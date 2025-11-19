import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,CommonModule,RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  loading = false;
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  submit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;


        const role = response.user.role;

        if (role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if(role === 'user') {
          this.router.navigate(['/home']);
        }else{
            this.errorMessage = 'Unexpected response from server.';
        }
      },
      error: (error) => {
        this.loading = false;

        if (error.status === 404 || error.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else if (error.status === 0) {
          this.errorMessage = 'Server connection error. Please try again later.';
        } else {
          this.errorMessage = 'An unexpected error occurred.';
        }
      }
    });
  }

}
