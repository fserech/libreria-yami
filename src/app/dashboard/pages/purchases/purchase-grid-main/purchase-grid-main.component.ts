// purchases-grid-main.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';

// Services
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../shared/services/auth.service';

// Components
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { PurchasesFilterDialogComponent } from '../purchases-filter-dialog/purchases-filter-dialog.component';

// Icons
import {
  matAddCircleOutline,
  matFilterAltOutline,
  matVisibilityOutline,
  matEditOutline,
  matDeleteOutline,
  matHourglassEmptyOutline,
  matShoppingBagOutline,
  matArrowUpwardOutline,
  matArrowDownwardOutline,
  matCloseOutline
} from '@ng-icons/material-icons/outline';

// Constants & Interfaces
import { URL_PURCHASES } from '../../../../shared/constants/endpoints';
import { Purchase, PurchaseFilter } from '../../../../shared/interfaces/purchase';
import BaseForm from '../../../../shared/classes/base-form';

@Component({
  selector: 'app-purchases-grid-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    NgIconComponent
  ],
  templateUrl: './purchase-grid-main.component.html',
  styleUrl: './purchase-grid-main.component.scss',
  viewProviders: [
    provideIcons({
      matAddCircleOutline,
      matFilterAltOutline,
      matVisibilityOutline,
      matEditOutline,
      matDeleteOutline,
      matHourglassEmptyOutline,
      matShoppingBagOutline,
      matArrowUpwardOutline,
      matArrowDownwardOutline,
      matCloseOutline
    })
  ]
})
export default class PurchasesGridMainComponent extends BaseForm implements OnInit {

  // ==================== DATA ====================
  items: Purchase[] = [];
  searchText: string = '';
  currentFilters: PurchaseFilter = {};

  // ==================== PAGINATION ====================
  override page: number = 1;
  override pageSize: number = 10;
  override totalItems: number = 0;
  override totalPages: number = 0;

  // ==================== SORTING ====================
  sortField: string = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  Math = Math;

  get hasActiveFilters(): boolean {
    return Object.keys(this.currentFilters).length > 0;
  }

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    private dialog: Dialog,
    private auth: AuthService,
    private bpo: BreakpointObserver
  ) {
    super(crud, toast, auth, bpo);
    this.crud.baseUrl = URL_PURCHASES;
  }

  ngOnInit(): void {
    this.loadPurchases();
  }

  // ==================== DATA LOADING ====================

  async loadPurchases(): Promise<void> {
    this.load = true;
    try {
      const params = this.buildQueryParams();

      const response = await firstValueFrom(
        this.crud.http.get<any>(`${this.crud.baseUrl}${params}`)
      );

      if (response.content) {
        this.items = response.content;
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;
      } else if (Array.isArray(response)) {
        this.items = response;
        this.totalItems = response.length;
        this.totalPages = 1;
      } else {
        this.items = [];
        this.totalItems = 0;
        this.totalPages = 0;
      }

    } catch (error) {
      console.error('Error cargando compras:', error);
      this.toast.error('Error al cargar las compras');
      this.items = [];
    } finally {
      this.load = false;
    }
  }

  buildQueryParams(): string {
    const params: string[] = [
      `page=${this.page - 1}`,
      `size=${this.pageSize}`,
      `sort=${this.sortField},${this.sortDirection}`
    ];

    if (this.searchText) {
      params.push(`search=${encodeURIComponent(this.searchText)}`);
    }

    if (this.currentFilters.supplierId) {
      params.push(`supplierId=${this.currentFilters.supplierId}`);
    }

    if (this.currentFilters.status) {
      params.push(`status=${this.currentFilters.status}`);
    }

    if (this.currentFilters.startDate) {
      params.push(`startDate=${this.currentFilters.startDate}`);
    }

    if (this.currentFilters.endDate) {
      params.push(`endDate=${this.currentFilters.endDate}`);
    }

    if (this.currentFilters.minAmount) {
      params.push(`minAmount=${this.currentFilters.minAmount}`);
    }

    if (this.currentFilters.maxAmount) {
      params.push(`maxAmount=${this.currentFilters.maxAmount}`);
    }

    return params.length > 0 ? `?${params.join('&')}` : '';
  }

  // ==================== SEARCH & FILTERS ====================

  search(): void {
    this.page = 1;
    this.loadPurchases();
  }

  async openFilterDialog(): Promise<void> {
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(PurchasesFilterDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: darkmode === 'dark'
        ? ['bg-slate-900', 'rounded-lg', 'text-gray-200']
        : ['bg-white', 'rounded-lg', 'text-gray-500'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      disableClose: false,
      data: { currentFilters: this.currentFilters }
    });

    const result = await firstValueFrom(dialogRef.closed);

    if (result !== undefined) {
      this.currentFilters = result;
      this.page = 1;
      this.loadPurchases();
    }
  }

  removeFilter(key: keyof PurchaseFilter): void {
    delete this.currentFilters[key];
    this.page = 1;
    this.loadPurchases();
  }

  removeDateRange(): void {
    delete this.currentFilters.startDate;
    delete this.currentFilters.endDate;
    this.page = 1;
    this.loadPurchases();
  }

  removeAmountRange(): void {
    delete this.currentFilters.minAmount;
    delete this.currentFilters.maxAmount;
    this.page = 1;
    this.loadPurchases();
  }

  clearAllFilters(): void {
    this.currentFilters = {};
    this.searchText = '';
    this.page = 1;
    this.loadPurchases();
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada'
    };
    return labels[status] || status;
  }

  // ==================== SORTING ====================

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.loadPurchases();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'matArrowDownwardOutline';
    return this.sortDirection === 'asc' ? 'matArrowUpwardOutline' : 'matArrowDownwardOutline';
  }

  // ==================== PAGINATION ====================

  override previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadPurchases();
    }
  }

  override nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadPurchases();
    }
  }

  goToPage(pageNum: number): void {
    this.page = pageNum;
    this.loadPurchases();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, this.page - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // ==================== ACTIONS ====================
    edit(id: number){
    this.router.navigate([`/dashboard/purchases/detail/edit/${id}`]);
  }

   add(){
    this.router.navigate([`/dashboard/purchases/detail/new`]);
  }


  view(id:number){
    this.router.navigate([`/dashboard/purchases/view/${id}`]);
  }



  async delete(id: number): Promise<void> {
    if (!confirm('¿Estás seguro de eliminar esta compra? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await firstValueFrom(await this.crud.deleteId(id));
      this.toast.success('Compra eliminada correctamente');
      this.loadPurchases();
    } catch (error: any) {
      console.error('Error eliminando compra:', error);
      this.toast.error(error.error?.message || 'Error al eliminar la compra');
    }
  }

  override getDialogWidth(): string {
    if (this.bpo.isMatched('(max-width: 640px)')) {
      return '95vw';
    } else if (this.bpo.isMatched('(max-width: 1024px)')) {
      return '80vw';
    }
    return '600px';
  }
}
