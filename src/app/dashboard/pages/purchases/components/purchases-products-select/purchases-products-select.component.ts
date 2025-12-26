// purchases-products-select.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// Services
import { CrudService } from '../../../../../shared/services/crud.service';
import { ToastService } from '../../../../../shared/services/toast.service';

// Components
import { NgIconComponent, provideIcons } from '@ng-icons/core';

// Icons
import {
  matInventory2Outline,
  matSearchOffOutline,
  matFilterAltOffOutline,
  matArrowBackOutline,
  matArrowForwardOutline
} from '@ng-icons/material-icons/outline';

// Interfaces
import { PurchaseProductSelect } from '../../../../../shared/interfaces/purchase';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-purchases-products-select',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './purchases-products-select.component.html',
  styleUrl: './purchases-products-select.component.scss',
  viewProviders: [
    provideIcons({
      matInventory2Outline,
      matSearchOffOutline,
      matFilterAltOffOutline,
      matArrowBackOutline,
      matArrowForwardOutline
    })
  ]
})
export class PurchasesProductsSelectComponent implements OnInit {

  @Input() supplierId: number;
  @Output() changes = new EventEmitter<PurchaseProductSelect[]>();
  @Input() disabled: boolean = false;
  @Output() finalized = new EventEmitter<boolean>();

  // ==================== DATA ====================
  allProducts: PurchaseProductSelect[] = [];
  filteredProducts: PurchaseProductSelect[] = [];
  categories: any[] = [];

  // ==================== FILTERS ====================
  searchText: string = '';
  selectedCategory: string = '';

  // ==================== STATE ====================
  loading: boolean = false;
  allSelected: boolean = false;

  get selectedCount(): number {
    return this.allProducts.filter(p => p.selected).length;
  }

  constructor(
    private crud: CrudService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  // ==================== DATA LOADING ====================

  async loadProducts(): Promise<void> {
    this.loading = true;
    try {
      // Cargar productos del proveedor específico
      let url = `${environment.apiUrl}/api/v1/products`;

      if (this.supplierId) {
        url += `?supplierId=${this.supplierId}`;
      }

      const response = await firstValueFrom(this.crud.http.get<any>(url));

      const productsList = Array.isArray(response) ? response : (response.content || []);

      this.allProducts = this.flattenProducts(productsList);
      this.filteredProducts = [...this.allProducts];

    } catch (error) {
      console.error('Error cargando productos:', error);
      this.toast.error('Error al cargar productos');
    } finally {
      this.loading = false;
    }
  }

  flattenProducts(products: any[]): PurchaseProductSelect[] {
    const result: PurchaseProductSelect[] = [];

    products.forEach(product => {
      if (product.hasVariants && product.variants?.length > 0) {
        // Producto con variantes
        product.variants.forEach((variant: any) => {
          result.push({
            productId: product.id,
            variantId: variant.id,
            productName: product.productName,
            variantName: variant.variantName,
            sku: variant.sku,
            unitPrice: variant.costPrice,
            quantity: 1,
            subtotal: variant.costPrice,
            categoryName: product.categoryName,
            brandName: product.brandName,
            currentStock: variant.currentStock,
            selected: false
          });
        });
      } else {
        // Producto simple
        result.push({
          productId: product.id,
          variantId: null,
          productName: product.productName,
          variantName: null,
          sku: product.sku,
          unitPrice: product.costPrice,
          quantity: 1,
          subtotal: product.costPrice,
          categoryName: product.categoryName,
          brandName: product.brandName,
          currentStock: product.currentStock,
          selected: false
        });
      }
    });

    return result;
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await firstValueFrom(
        this.crud.http.get<any[]>(`${environment.apiUrl}/api/v1/categories`)
      );
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  }

  // ==================== FILTERING ====================

  filterProducts(): void {
    this.filteredProducts = this.allProducts.filter(product => {
      const matchesSearch = !this.searchText ||
        product.productName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (product.variantName && product.variantName.toLowerCase().includes(this.searchText.toLowerCase()));

      const matchesCategory = !this.selectedCategory ||
        product.categoryName === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });

    this.checkAllSelected();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = '';
    this.filterProducts();
  }

  // ==================== SELECTION ====================

  toggleProduct(product: PurchaseProductSelect): void {
    if (product.selected) {
      this.updateSubtotal(product);
    } else {
      product.quantity = 1;
      product.subtotal = 0;
    }

    this.emitChanges();
    this.checkAllSelected();
  }

  toggleSelectAll(): void {
    this.allSelected = !this.allSelected;

    this.filteredProducts.forEach(product => {
      product.selected = this.allSelected;
      if (product.selected) {
        product.quantity = 1;
        this.updateSubtotal(product);
      } else {
        product.subtotal = 0;
      }
    });

    this.emitChanges();
  }

  checkAllSelected(): void {
    const visibleProducts = this.filteredProducts;
    this.allSelected = visibleProducts.length > 0 &&
                       visibleProducts.every(p => p.selected);
  }

  updateSubtotal(product: PurchaseProductSelect): void {
    if (product.quantity < 1) {
      product.quantity = 1;
    }

    product.subtotal = product.quantity * product.unitPrice;
    this.emitChanges();
  }

  // ==================== CALCULATIONS ====================

  getTotal(): number {
    return this.allProducts
      .filter(p => p.selected)
      .reduce((sum, p) => sum + p.subtotal, 0);
  }

  // ==================== EMIT EVENTS ====================

  emitChanges(): void {
    const selectedProducts = this.allProducts.filter(p => p.selected);
    this.changes.emit(selectedProducts);
  }

  confirmSelection(): void {
    const selectedProducts = this.allProducts.filter(p => p.selected);

    if (selectedProducts.length === 0) {
      this.toast.warning('Debes seleccionar al menos un producto');
      return;
    }

    this.finalized.emit(true);
  }

  goBack(): void {
    this.finalized.emit(false);
  }
}
