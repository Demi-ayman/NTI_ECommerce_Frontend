import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FaqService } from '../../core/services/faq.service';
import { IFaq } from '../../core/models/faq.model';

@Component({
  selector: 'app-faq',
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class Faq implements OnInit{
  faqs: IFaq[] = [];
  filteredFaqs: IFaq[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  searchTerm:string = '';
  selectedCategory: string = 'all';
  expandedFaqId:string| null = null;
  categories = [
    {value: 'all', label:'All Categories' },
    { value:'General',label: 'General' },
    { value: 'Shipping',label: 'Shipping' },
    { value:'Payments',label: 'Payments' },
    { value:'Returns',label: 'Returns & Refunds' },
    {value: 'Account',label: 'Account' },
    { value: 'Orders',label: 'Orders' }
  ];
  constructor(private faqService:FaqService){}
  ngOnInit(): void {
    this.loadFAQs();
  }
  loadFAQs(): void {
    this.loading = true;
    this.faqService.getFAQs().subscribe({
      next: (res) => {
        this.faqs = res.data || [];
        this.filteredFaqs = [...this.faqs];
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load FAQs';
        this.loading = false;
        console.error('Error loading FAQs:', err);
      }
    });
  }
  applyFilters(): void {
    let filtered = [...this.faqs];

    // this is for search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term)
      );
    }

    // this is for category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === this.selectedCategory);
    }

    this.filteredFaqs = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.applyFilters();
  }

  toggleFaq(faqId: string): void {
    this.expandedFaqId = this.expandedFaqId === faqId ? null : faqId;
  }

  isExpanded(faqId: string): boolean {
    return this.expandedFaqId === faqId;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'General': '❓',
      'Shipping': '🚚',
      'Payments': '💳',
      'Returns': '🔄',
      'Account': '👤',
      'Orders': '📦'
    };
    return icons[category] || '❓';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
