import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink,CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {

  isLoggedIn =false;
  userRole : string|null=null;

  constructor(private authService:AuthService,private router:Router){}
  ngOnInit(): void {
    this.isLoggedIn=this.authService.isLoggedIn();
    this.userRole=this.authService.getUserRole();
  }


  logout(){
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
