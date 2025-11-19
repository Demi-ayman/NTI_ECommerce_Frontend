import { Component, OnInit } from '@angular/core';
import { ITestimonial } from '../../core/models/testimonial.model';
import { TestimonialService } from '../../core/services/testimonial.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-testimonials',
  imports: [CommonModule,FormsModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css'
})
export class Testimonials implements OnInit{
   testimonials: ITestimonial[] = [];
  filteredTestimonials: ITestimonial[] =[];
  loading: boolean = true;
  errorMessage: string = '';

  searchTerm: string = '';
  ratingFilter: number = 0;
  sortBy: string = 'newest';

  constructor(private testimonialService: TestimonialService) {}

  ngOnInit(): void {
    this.loadTestimonials();
  }

  loadTestimonials(): void {
    this.loading = true;
    this.testimonialService.getApprovedTestimonials().subscribe({
      next: (res) => {
        this.testimonials = res.data || [];
        this.filteredTestimonials = [...this.testimonials];
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load testimonials';
        this.loading = false;
        console.error('Error loading testimonials:', err);
      }
    });
  }
  applyFilters(): void {
    let filtered = [...this.testimonials];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(testimonial =>
        testimonial.message.toLowerCase().includes(term) ||
        testimonial.name.toLowerCase().includes(term) ||
        (testimonial.user && testimonial.user.name.toLowerCase().includes(term))
      );
    }

    // Rating filter
    if (this.ratingFilter > 0) {
      filtered = filtered.filter(testimonial => testimonial.rating === this.ratingFilter);
    }

    // Sorting
    switch (this.sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    this.filteredTestimonials = filtered;
  }
  clearFilters(): void {
    this.searchTerm = '';
    this.ratingFilter = 0;
    this.sortBy = 'newest';
    this.applyFilters();
  }
  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  getUserName(testimonial: ITestimonial): string {
    return testimonial.user?.name || testimonial.name || 'Anonymous';
  }
}
