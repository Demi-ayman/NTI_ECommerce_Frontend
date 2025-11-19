import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ITestimonial, ITestimonialResponse, ITestimonialsResponse } from '../../../core/models/testimonial.model';
import { TestimonialService } from '../../../core/services/testimonial.service';

@Component({
  selector: 'app-testimonials',
  imports: [CommonModule,FormsModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css'
})
export class Testimonials implements OnInit{
  testimonials:ITestimonial[]=[];
  isLoading=false;
  searchTerm='';
  filterApproved ='all';//'all', 'approved', 'pending'

  editingTestimonial: ITestimonial | null = null;
  editMessage = '';
  editRating = 5;
  constructor(private testimonialService: TestimonialService) {}
  ngOnInit(): void {
    this.loadTestimonials();
  }
  loadTestimonials(): void {
    this.isLoading = true;
    this.testimonialService.getAllTestimonials()
      .subscribe({
        next: (response: ITestimonialsResponse) => {
          this.testimonials = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading testimonials:', error);
          this.isLoading = false;
        }
      });
  }
  toggleApproval(testimonial: ITestimonial): void {
    if (testimonial.approved) {
      // If already approved, set to pending
      this.setPending(testimonial);
    } else {
      // If pending, approve it
      this.approveTestimonial(testimonial);
    }
  }
  approveTestimonial(testimonial: ITestimonial): void {
    this.testimonialService.approveTestimonial(testimonial._id)
      .subscribe({
        next: (response: ITestimonialResponse) => {
          testimonial.approved = true;
          testimonial.updatedAt = response.data.updatedAt;
        },
        error: (error) => {
          console.error('Error approving testimonial:', error);
        }
      });
  }

  setPending(testimonial: ITestimonial): void {

    testimonial.approved = false;
    console.log('Set testimonial to pending - backend implementation needed');
  }
  startEdit(testimonial:ITestimonial):void{
    this.editingTestimonial=testimonial;
    this.editMessage=testimonial.message;
    this.editRating=testimonial.rating;
  }

  cancelEdit():void{
    this.editingTestimonial=null;
    this.editMessage='';
    this.editRating=5;
  }

  saveEdit():void{
    if(!this.editingTestimonial)return;
    this.testimonialService.updateTestimonial(this.editingTestimonial._id,{
      message:this.editMessage,
      rating:this.editRating
    }).subscribe({
      next:(response:ITestimonialResponse)=>{
        const index = this.testimonials.findIndex(t=>t._id===this.editingTestimonial!._id);
        if(index!== -1){
          this.testimonials[index]=response.data;
        }
        this.cancelEdit();
      },
      error: (error) => {
        console.error('Error updating testimonial:', error);
      }
    })
  }

  deleteTestimonial(testimonial: ITestimonial): void {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      this.testimonialService.deleteTestimonial(testimonial._id)
        .subscribe({
          next: () => {
            this.testimonials = this.testimonials.filter(t => t._id !== testimonial._id);
          },
          error: (error) => {
            console.error('Error deleting testimonial:', error);
          }
        });
    }
  }
  get filteredTestimonials(): ITestimonial[] {
    let filtered = this.testimonials;

    if (this.filterApproved === 'approved') {
      filtered = filtered.filter(t => t.approved);
    } else if (this.filterApproved === 'pending') {
      filtered = filtered.filter(t => !t.approved);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.message.toLowerCase().includes(term) ||
        t.user.name.toLowerCase().includes(term)
      );
    }

    return filtered;
  }


  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  getStatusClass(approved: boolean): string {
    return approved ? 'status-approved' : 'status-pending';
  }

  getStatusText(approved: boolean): string {
    return approved ? 'Approved' : 'Pending';
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const created = new Date(date);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  }

  get approvedCount(): number {
    return this.testimonials ? this.testimonials.filter(t => t.approved).length : 0;
  }

  get pendingCount(): number {
    return this.testimonials ? this.testimonials.filter(t => !t.approved).length : 0;
  }

  get displayedCount(): number {
    return this.filteredTestimonials ? this.filteredTestimonials.length : 0;
  }

}
