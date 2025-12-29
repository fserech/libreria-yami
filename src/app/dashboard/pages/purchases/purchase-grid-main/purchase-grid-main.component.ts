// purchases-grid-main.component.ts - COMPLETO
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
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
import { ChatBubbleComponent } from '../../../../shared/components/chat-bubble/chat-bubble.component';
import { DatePickerSearchComponent } from '../../../../shared/components/date-picker-search/date-picker-search.component';

// Icons de Material
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
  matCloseOutline,
  matAddOutline,
  matCheckCircleOutline,
  matCancelOutline,
  matSearchOutline
} from '@ng-icons/material-icons/outline';

// Icons de Bootstrap
import {
  bootstrapChevronBarLeft,
  bootstrapChevronLeft,
  bootstrapChevronRight,
  bootstrapChevronBarRight
} from '@ng-icons/bootstrap-icons';

// Constants & Interfaces
import { URL_PURCHASES } from '../../../../shared/constants/endpoints';
import { MIN_DATE, MAX_DATE } from '../../../../shared/constants/date-min-max';
import { Purchase, PurchaseFilter } from '../../../../shared/interfaces/purchase';
import { OptionsChatBubble } from '../../../../shared/interfaces/options-chat-bubble';
import BaseForm from '../../../../shared/classes/base-form';

@Component({
  selector: 'app-purchases-grid-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    NgIconComponent,
    ChatBubbleComponent,
    DatePickerSearchComponent
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
      matCloseOutline,
      matAddOutline,
      matCheckCircleOutline,
      matCancelOutline,
      matSearchOutline,
      bootstrapChevronBarLeft,
      bootstrapChevronLeft,
      bootstrapChevronRight,
      bootstrapChevronBarRight
    })
  ]
})
export default class PurchasesGridMainComponent extends BaseForm implements OnInit {

  // ==================== FORM ====================
  form: FormGroup = new FormGroup({
    purchaseDate: new FormControl('')
  });

  // ==================== DATE LIMITS ====================
  minDate: Date = MIN_DATE;
  maxDate: Date = MAX_DATE;

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
  sortField: string = 'purchaseDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // ==================== TIME TAB ====================
  activeTimeTab: 'day' | 'week' | 'month' = 'month';

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
    this.loadPurchasesByTimeRange(this.activeTimeTab);
  }

  // ==================== TIME TAB MANAGEMENT ====================

  setActiveTimeTab(tab: 'day' | 'week' | 'month') {
    this.activeTimeTab = tab;
    this.currentFilters = {}; // Limpiar filtros al cambiar de tab
    this.searchText = '';
    this.page = 1;
    this.loadPurchasesByTimeRange(tab);
  }

  loadPurchasesByTimeRange(timeRange: 'day' | 'week' | 'month') {
    const dateInit: Date = new Date();
    const dateEnd: Date = new Date();

    switch (timeRange) {
      case 'day':
        dateInit.setHours(0, 0, 0, 0);
        dateEnd.setHours(23, 59, 59, 999);
        break;

      case 'week':
        const dayOfWeek = dateInit.getDay();
        const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
        dateInit.setDate(dateInit.getDate() + diffToMonday);
        dateInit.setHours(0, 0, 0, 0);
        dateEnd.setDate(dateInit.getDate() + 6);
        dateEnd.setHours(23, 59, 59, 999);
        break;

      case 'month':
        dateInit.setDate(1);
        dateInit.setHours(0, 0, 0, 0);
        dateEnd.setMonth(dateEnd.getMonth() + 1);
        dateEnd.setDate(0);
        dateEnd.setHours(23, 59, 59, 999);
        break;
    }

    // Formato: YYYY-MM-DD (sin hora, solo fecha)
    this.currentFilters.startDate = this.formatDateToLocalDate(dateInit);
    this.currentFilters.endDate = this.formatDateToLocalDate(dateEnd);
    this.loadPurchases();
  }

  // Método helper para convertir Date a formato LocalDate (YYYY-MM-DD)
  formatDateToLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
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

      // Debug: verificar si los suppliers vienen en la respuesta
      console.log('Purchases loaded:', this.items);
      if (this.items.length > 0) {
        console.log('First purchase supplier:', this.items[0].supplier);
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

  // ==================== HELPERS PARA TEMPLATE ====================

  getSupplierName(purchase: Purchase): string {
    // Prioridad 1: Objeto supplier completo
    if (purchase?.supplier?.supplierName) {
      return purchase.supplier.supplierName;
    }

    // Prioridad 2: Campo supplierName directo


    // Prioridad 3: Si hay supplier pero sin nombre
    if (purchase?.supplier?.id) {
      return `Proveedor ID: ${purchase.supplier.id}`;
    }

    // Prioridad 4: Si solo hay supplierId
    if (purchase?.supplierId) {
      return `Proveedor ID: ${purchase.supplierId}`;
    }

    return 'Sin proveedor';
  }

  getProductsCount(purchase: Purchase): number {
    if (purchase.products) {
      return purchase.products.length;
    }
    return 0;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada'
    };
    return labels[status] || status;
  }

  // ==================== ACTIONS FOR CHAT BUBBLE ====================

  getActionsForPurchase(purchase: Purchase): OptionsChatBubble[] {
    const actions: OptionsChatBubble[] = [];

    // Ver siempre disponible
    actions.push({
      id: purchase.id!,
      icon: 'matVisibilityOutline',
      label: 'Ver',
      action: 'VIEW_PURCHASE',
      colorIcon: 'text-blue-500'
    });

    // Solo si está PENDING mostrar las demás opciones
    if (purchase.status === 'PENDING') {
      actions.push(
        {
          id: purchase.id!,
          icon: 'matEditOutline',
          label: 'Editar',
          action: 'EDIT',
          colorIcon: 'text-blue-600'
        },
        {
          id: purchase.id!,
          icon: 'matCheckCircleOutline',
          label: 'Completar',
          action: 'COMPLETE',
          colorIcon: 'text-emerald-500'
        },
        {
          id: purchase.id!,
          icon: 'matCancelOutline',
          label: 'Cancelar',
          action: 'CANCEL',
          colorIcon: 'text-red-500'
        }
      );
    }

    return actions;
  }

  selectOption(option: OptionsChatBubble) {
    switch (option.action) {
      case 'VIEW_PURCHASE':
        this.view(option.id);
        break;
      case 'EDIT':
        this.edit(option.id);
        break;
      case 'COMPLETE':
        this.changeStatus(option.id, 'COMPLETED');
        break;
      case 'CANCEL':
        this.changeStatus(option.id, 'CANCELLED');
        break;
    }
  }

  // ==================== SEARCH & FILTERS ====================

  search(): void {
    this.page = 1;
    this.loadPurchases();
  }

  searchByDate(): void {
    const dateValue = this.form.controls['purchaseDate'].value;
    if (dateValue) {
      const date = new Date(dateValue);
      this.currentFilters.startDate = this.formatDateToLocalDate(date);
      this.currentFilters.endDate = this.formatDateToLocalDate(date);
      this.page = 1;
      this.loadPurchases();
    }
  }

  changePurchaseDate(event: any): void {
    if (event && event.value) {
      const date = new Date(event.value);
      this.currentFilters.startDate = this.formatDateToLocalDate(date);
      this.currentFilters.endDate = this.formatDateToLocalDate(date);
    }
  }

  async openFilterDialog(): Promise<void> {
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(PurchasesFilterDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: darkmode === 'dark'
        ? ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4']
        : ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      disableClose: false,
      data: {
        title: 'Filtros de compras',
        currentFilters: this.currentFilters
      }
    });

    const result = await firstValueFrom(dialogRef.closed);

    if (result !== undefined) {
      this.currentFilters = result;
      this.page = 1;
      this.loadPurchases();
    }
  }

  clearAllFilters(): void {
    this.currentFilters = {};
    this.searchText = '';
    this.form.controls['purchaseDate'].setValue('');
    this.page = 1;
    this.loadPurchasesByTimeRange(this.activeTimeTab);
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

  override firstPage(): void {
    this.page = 1;
    this.loadPurchases();
  }

  override lastPage(): void {
    this.page = this.totalPages;
    this.loadPurchases();
  }

  // ==================== ACTIONS ====================

  edit(id: number): void {
    this.router.navigate([`/dashboard/purchases/detail/edit/${id}`]);
  }

  add(): void {
    this.router.navigate([`/dashboard/purchases/detail/new`]);
  }

  view(id:number){
    this.router.navigate([`/dashboard/purchases/view/${id}`]);
  }

  async delete(id: number): Promise<void> {
    this.load = true;

    this.toast.confirm(
      '¿Seguro que desea eliminar la compra?',
      null,
      null,
      'El registro se eliminará de forma permanente.',
      'question'
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await firstValueFrom(await this.crud.deleteId(id));
          this.toast.success('Compra eliminada correctamente');
          this.loadPurchasesByTimeRange(this.activeTimeTab);
        } catch (error: any) {
          console.error('Error eliminando compra:', error);
          this.toast.error(error.error?.message || 'Error al eliminar la compra');
        } finally {
          this.load = false;
        }
      } else {
        this.load = false;
      }
    });
  }

  // ==================== CAMBIO DE ESTADO ====================

  async changeStatus(id: number, newStatus: 'COMPLETED' | 'CANCELLED'): Promise<void> {
    this.load = true;

    const statusLabels = {
      'COMPLETED': 'completar',
      'CANCELLED': 'cancelar'
    };

    const action = statusLabels[newStatus];

    this.toast.confirm(
      `¿Seguro que desea ${action} la compra?`,
      null,
      null,
      `El registro se ${action}á de forma permanente.`,
      'question'
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await firstValueFrom(
            this.crud.http.patch(`${this.crud.baseUrl}/${id}/status`, { status: newStatus })
          );

          this.toast.success(`Compra ${newStatus === 'COMPLETED' ? 'completada' : 'cancelada'} correctamente`);
          this.loadPurchasesByTimeRange(this.activeTimeTab);
        } catch (error: any) {
          console.error('Error cambiando estado:', error);
          this.toast.error(error.error?.message || 'Error al cambiar el estado');
        } finally {
          this.load = false;
        }
      } else {
        this.load = false;
      }
    });
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
