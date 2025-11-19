import { Component } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user',
  imports: [Header,Footer,RouterOutlet],
  templateUrl: './user.html',
  styleUrl: './user.css'
})
export class User {

}
