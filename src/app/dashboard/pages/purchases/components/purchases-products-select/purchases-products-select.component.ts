// ============================================
// purchases-products-select.component.ts - CORREGIDO
// ============================================
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
import { Product, ProductVariant } from '../../../../../shared/interfaces/product';
import { Category } from '../../../../../shared/interfaces/category';
import { ProductPurchaseSelect } from '../../../../../shared/interfaces/purchase';
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
  @Input() disabled: boolean = false;
  @Output() changes = new EventEmitter<ProductPurchaseSelect[]>();
  @Output() finalized = new EventEmitter<boolean>();

  // ==================== DATA ====================
  allProducts: Product[] = [];
  selectedProducts: ProductPurchaseSelect[] = [];
  categories: Category[] = [];

  // ==================== FILTERS ====================
  searchText: string = '';
  selectedCategory: string = '';

  // ==================== STATE ====================
  loading: boolean = false;

  get selectedCount(): number {
    return this.selectedProducts.length;
  }

  get filteredProducts(): Product[] {
    return this.allProducts.filter(product => {
      const matchesSearch = !this.searchText ||
        product.productName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(this.searchText.toLowerCase()));

      const matchesCategory = !this.selectedCategory ||
        this.getCategoryName(product) === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
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
      let url = `${environment.apiUrl}/api/v1/products`;

      if (this.supplierId) {
        url += `?supplierId=${this.supplierId}`;
      }

      const response = await firstValueFrom(
        this.crud.http.get<any>(url)
      );

      this.allProducts = Array.isArray(response)
        ? response
        : (response.content || []);

      console.log('✅ Productos cargados:', this.allProducts.length);

    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      this.toast.error('Error al cargar productos');
      this.allProducts = [];
    } finally {
      this.loading = false;
    }
  }

  async loadCategories(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.crud.http.get<any>(`${environment.apiUrl}/api/v1/categories`)
      );

      this.categories = Array.isArray(response)
        ? response
        : (response.content || []);

    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
      this.categories = [];
    }
  }

  // ==================== SELECTION ====================

  isProductSelected(product: Product, variantId?: number): boolean {
    return this.selectedProducts.some(
      sp => sp.product.id === product.id &&
           (variantId ? sp.variantId === variantId : !sp.variantId)
    );
  }

  getSelectedProduct(product: Product, variantId?: number): ProductPurchaseSelect | undefined {
    return this.selectedProducts.find(
      sp => sp.product.id === product.id &&
           (variantId ? sp.variantId === variantId : !sp.variantId)
    );
  }

  toggleProduct(product: Product, variantId?: number): void {
    const index = this.selectedProducts.findIndex(
      sp => sp.product.id === product.id &&
           (variantId ? sp.variantId === variantId : !sp.variantId)
    );

    if (index >= 0) {
      // Remover
      this.selectedProducts.splice(index, 1);
    } else {
      // Agregar
      this.selectedProducts.push({
        product: product,
        variantId: variantId || null,
        quantity: 1
      });
    }

    this.emitChanges();
  }

  updateQuantity(product: Product, quantity: number, variantId?: number): void {
    const selected = this.getSelectedProduct(product, variantId);

    if (selected) {
      selected.quantity = quantity < 1 ? 1 : quantity;
      this.emitChanges();
    }
  }

  // ==================== FILTERING ====================

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = '';
  }

  // ==================== CALCULATIONS ====================

  getTotal(): number {
    return this.selectedProducts.reduce((sum, sp) => {
      const price = this.getProductPrice(sp.product, sp.variantId || undefined);
      return sum + (price * sp.quantity);
    }, 0);
  }

  getProductPrice(product: Product, variantId?: number): number {
    if (variantId && product.variants) {
      const variant = product.variants.find(v => v.id === variantId);
      return variant?.costPrice || 0;
    }
    return product.costPrice || 0;
  }

  getProductSku(product: Product, variantId?: number): string {
    if (variantId && product.variants) {
      const variant = product.variants.find(v => v.id === variantId);
      return variant?.sku || '';
    }
    return product.sku || '';
  }

  getProductStock(product: Product, variantId?: number): number {
    if (variantId && product.variants) {
      const variant = product.variants.find(v => v.id === variantId);
      return variant?.currentStock || 0;
    }
    return product.currentStock || 0;
  }

  // ==================== HELPERS PARA TEMPLATE ====================

  /**
   * Obtiene el nombre de la categoría de forma segura
   */
  getCategoryName(product: Product): string {
    return (product as any).categoryName || '';
  }

  /**
   * Obtiene las clases CSS según el stock
   */
  getStockClass(stock: number): string {
    return stock < 10
      ? 'text-red-600 dark:text-red-400 font-semibold'
      : '';
  }

  /**
   * Extrae el valor numérico del input de forma segura
   */
  getInputValue(event: Event): number {
    return +(event.target as HTMLInputElement).value;
  }

  /**
   * Calcula el subtotal de un producto seleccionado
   */
  calculateSubtotal(product: Product, variantId?: number): number {
    const selected = this.getSelectedProduct(product, variantId);
    if (!selected) return 0;

    const price = this.getProductPrice(product, variantId);
    return price * selected.quantity;
  }

  // ==================== EMIT EVENTS ====================

  emitChanges(): void {
    this.changes.emit([...this.selectedProducts]);
  }

  confirmSelection(): void {
    if (this.selectedProducts.length === 0) {
      this.toast.warning('Debes seleccionar al menos un producto');
      return;
    }

    this.finalized.emit(true);
  }

  goBack(): void {
    this.finalized.emit(false);
  }
}
