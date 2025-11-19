import { Component, OnInit } from '@angular/core';
import { IFaq, IFaqResponse, IFaqsResponse } from '../../../core/models/faq.model';
import { FaqService } from '../../../core/services/faq.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-faq',
  imports: [CommonModule, FormsModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class Faq implements OnInit{
  faqs: IFaq[] = [];
  isLoading = false;
  searchTerm = '';
  selectedCategory = 'all';

  showForm = false;
  isEditing = false;
  currentFaq: IFaq | null = null;

  formQuestion = '';
  formAnswer = '';
  formCategory: 'General' | 'Shipping' | 'Payments' | 'Returns' |'Orders' |'Account' = 'General';
  categories = ['General', 'Shipping', 'Payments', 'Returns', 'Orders','Account'];
  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    this.loadFAQs();
  }

  loadFAQs(): void {
    this.isLoading = true;
    this.faqService.getAllFAQs()
      .subscribe({
        next: (response: IFaqsResponse) => {
          this.faqs = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading FAQs:', error);
          this.isLoading = false;
        }
      });
  }
  

  // Open form for creating new FAQ
  openCreateForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentFaq = null;
    this.formQuestion = '';
    this.formAnswer = '';
    this.formCategory = 'General';
  }

  // Open form for editing FAQ
  openEditForm(faq: IFaq): void {
    this.showForm = true;
    this.isEditing = true;
    this.currentFaq = faq;
    this.formQuestion = faq.question;
    this.formAnswer = faq.answer;
    this.formCategory = faq.category;
  }

  // Close form
  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentFaq = null;
    this.formQuestion = '';
    this.formAnswer = '';
    this.formCategory = 'General';
  }
// Submit form (create or update)
  submitForm(): void {
    if (!this.formQuestion.trim() || !this.formAnswer.trim()) {
      alert('Please fill in both question and answer');
      return;
    }

    const faqData = {
      question: this.formQuestion.trim(),
      answer: this.formAnswer.trim(),
      category: this.formCategory
    };

    if (this.isEditing && this.currentFaq) {
      // Update existing FAQ
      this.faqService.updateFAQ(this.currentFaq._id, faqData)
        .subscribe({
          next: (response: IFaqResponse) => {
            const index = this.faqs.findIndex(f => f._id === this.currentFaq!._id);
            if (index !== -1) {
              this.faqs[index] = response.data;
            }
            this.closeForm();
          },
          error: (error) => {
            console.error('Error updating FAQ:', error);
            alert('Error updating FAQ');
          }
        });
    } else {
      // Create new FAQ
      this.faqService.createFAQ(faqData)
        .subscribe({
          next: (response: IFaqResponse) => {
            this.faqs.unshift(response.data);
            this.closeForm();
          },
          error: (error) => {
            console.error('Error creating FAQ:', error);
            alert('Error creating FAQ');
          }
        });
    }
  }

  // Delete FAQ
  deleteFAQ(faq: IFaq): void {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      this.faqService.deleteFAQ(faq._id)
        .subscribe({
          next: () => {
            this.faqs = this.faqs.filter(f => f._id !== faq._id);
          },
          error: (error) => {
            console.error('Error deleting FAQ:', error);
            alert('Error deleting FAQ');
          }
        });
    }
  }

  // Filter FAQs
  get filteredFAQs(): IFaq[] {
    let filtered = this.faqs;

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === this.selectedCategory);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  // Get category count
  getCategoryCount(category: string): number {
    return this.faqs.filter(faq => faq.category === category).length;
  }

  // Get total count
  get totalCount(): number {
    return this.faqs.length;
  }

  // Get displayed count
  get displayedCount(): number {
    return this.filteredFAQs.length;
  }

  // Format date
  getTimeAgo(date: string): string {
    const now = new Date();
    const created = new Date(date);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  }

  // Get category color class
  getCategoryClass(category: string): string {
    const colorMap: { [key: string]: string } = {
      'General': 'category-general',
      'Shipping': 'category-shipping',
      'Payments': 'category-payments',
      'Returns': 'category-returns',
      'Account': 'category-account'
    };
    return colorMap[category] || 'category-general';
  }
}
