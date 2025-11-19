import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [CommonModule,FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
categories = [
    {
      name: 'Men\'s Fashion',
      description: 'Stylish and comfortable clothing for men',
      image: 'assets/images/mens-fashion.jpg'
    },
    {
      name: 'Women\'s Fashion',
      description: 'Elegant and trendy outfits for women',
      image: 'assets/categories/3.jpg'
    },
    {
      name: 'Accessories',
      description: 'Complete your look with our accessories',
      image: 'assets/categories/1.jpg'
    },
    {
      name: 'Footwear',
      description: 'Comfortable and stylish shoes for every occasion',
      image: 'assets/categories/2.jpg'
    }
  ];

  features = [
    {
      icon: 'fa-gem',
      title: 'Premium Quality',
      description: 'Every product is carefully selected and quality-checked'
    },
    {
      icon: 'fa-shipping-fast',
      title: 'Fast Delivery',
      description: 'Free shipping on orders over $50. 2-3 business days delivery'
    },
    {
      icon: 'fa-tag',
      title: 'Best Prices',
      description: 'Competitive pricing without compromising on quality'
    },
    {
      icon: 'fa-headset',
      title: '24/7 Support',
      description: 'Our team is always here to help you'
    }
  ];
}
