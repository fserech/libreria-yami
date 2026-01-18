import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Dialog } from '@angular/cdk/dialog';
import { firstValueFrom } from 'rxjs';
import { CrudService } from '../../../../../shared/services/crud.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matSearchOutline,
  matAddShoppingCartOutline,
  matInventory2Outline,
  matAttachMoneyOutline,
  matCheckCircleOutline,
  matCancelOutline,
  matExpandMoreOutline,
} from '@ng-icons/material-icons/outline';
import { Product, ProductVariant } from '../../../../../shared/interfaces/product';
import { environment } from '../../../../../../environments/environment';
import { SelectProductQuantityDialogComponent } from '../select-product-quantity-dialog/select-product-quantity-dialog.component';
import { OrdersProductsSelectListDialogComponent } from '../orders-products-select-list-dialog/orders-products-select-list-dialog.component';
import { getProductCostPrice } from '../../../../../shared/utils/product-utils';
import { ProductOrderSelect } from '../../../../../shared/interfaces/order';

interface ProductOrder {
  product: Product;
  quantity: number;
  variantId?: number | null;
}

@Component({
  selector: 'app-orders-products-select',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    FormsModule
  ],
  templateUrl: './orders-products-select.component.html',
  styleUrl: './orders-products-select.component.scss',
  viewProviders: [provideIcons({
    matSearchOutline,
    matAddShoppingCartOutline,
    matInventory2Outline,
    matAttachMoneyOutline,
    matCheckCircleOutline,
    matCancelOutline,
    matExpandMoreOutline,
  })]
})
export class OrdersProductsSelectComponent implements OnInit {
  // 🆕 Input para recibir productos existentes en modo edición
  @Input() set existingProducts(products: ProductOrderSelect[]) {
    if (products && products.length > 0) {
      console.log('🔄 Recibiendo productos existentes:', products);
      this._existingProducts = products;
      this.loadExistingProducts();
    }
  }

  private _existingProducts: ProductOrderSelect[] = [];

  @Output() changes = new EventEmitter<ProductOrderSelect[]>();

  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  selectedProducts: ProductOrder[] = [];
  expandedProducts: Set<number> = new Set();
  load = false;

  // Hacer disponible la función en el template
  getProductCostPrice = getProductCostPrice;

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private matDialog: MatDialog,
    private dialog: Dialog
  ) {}

  async ngOnInit() {
    await this.loadProducts();
  }

  async loadProducts() {
    this.load = true;
    try {
      const response = await firstValueFrom(
        this.crud.http.get<Product[]>(`${environment.apiUrl}/api/v1/products`)
      );

      this.products = response.filter(p => p.active);
      this.filteredProducts = [...this.products];

      console.log('✅ Productos cargados:', this.products.length);
    } catch (error) {
      console.error('Error cargando productos:', error);
      this.toast.error('Error al cargar productos');
    } finally {
      this.load = false;
    }
  }

  // 🆕 Cargar productos existentes en modo edición
  private loadExistingProducts() {
    if (this._existingProducts && this._existingProducts.length > 0) {
      console.log('📦 Cargando productos existentes:', this._existingProducts);

      this.selectedProducts = this._existingProducts.map(item => ({
        product: item.product,
        quantity: item.quantity,
        variantId: item.variantId || null
      }));

      console.log('✅ Productos seleccionados cargados:', this.selectedProducts);

      // Emitir los cambios iniciales
      this.emitChanges();
    }
  }

  searchProducts() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredProducts = [...this.products];
      return;
    }

    this.filteredProducts = this.products.filter(product =>
      product.productName.toLowerCase().includes(term) ||
      product.sku?.toLowerCase().includes(term) ||
      product.productDesc?.toLowerCase().includes(term)
    );
  }

  toggleProductExpansion(productId: number) {
    if (this.expandedProducts.has(productId)) {
      this.expandedProducts.delete(productId);
    } else {
      this.expandedProducts.add(productId);
    }
  }

  isProductExpanded(productId: number): boolean {
    return this.expandedProducts.has(productId);
  }

  selectProduct(product: Product) {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      this.toggleProductExpansion(product.id!);
    } else {
      this.openQuantityDialog(product);
    }
  }

  selectVariant(product: Product, variant: ProductVariant) {
    const variantProduct: Product = {
      ...product,
      id: product.id,
      productName: `${product.productName} - ${variant.variantName}`,
      sku: variant.sku,
      salePrice: variant.salePrice,
      costPrice: getProductCostPrice(variant),
      currentStock: variant.currentStock,
      hasVariants: false
    };

    this.openQuantityDialog(variantProduct, variant.id);
  }

  openQuantityDialog(product: Product, variantId?: number) {
    const dialogRef = this.matDialog.open(SelectProductQuantityDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: {
        product,
        title: 'Cantidad a vender',
        isPurchase: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addProductToOrder(result.product, result.quantity, variantId);
      }
    });
  }

  addProductToOrder(product: Product, quantity: number, variantId?: number) {
    const existingProduct = this.selectedProducts.find(p =>
      p.product.id === product.id &&
      (variantId ? p.variantId === variantId : !p.variantId)
    );

    if (existingProduct) {
      existingProduct.quantity += quantity;
      existingProduct.product = product;
    } else {
      this.selectedProducts.push({
        product,
        quantity,
        variantId: variantId || null
      });
    }

    this.emitChanges();
    this.toast.success(`${product.productName} agregado a la orden`);
  }

  removeProduct(index: number) {
    this.selectedProducts.splice(index, 1);
    this.emitChanges();
  }

  /**
   * Emite los cambios en el formato esperado por el componente padre
   */
  private emitChanges() {
    const productsSelect: ProductOrderSelect[] = this.selectedProducts.map(item => ({
      product: item.product,
      quantity: item.quantity,
      variantId: item.variantId || null
    }));
    this.changes.emit(productsSelect);
  }

  /**
   * Abre el diálogo para ver/editar la lista de productos seleccionados
   */
  openProductListDialog() {
    if (this.selectedProducts.length === 0) {
      this.toast.info('No hay productos seleccionados');
      return;
    }

    const productsSelect: ProductOrderSelect[] = this.selectedProducts.map(item => ({
      product: item.product,
      quantity: item.quantity,
      variantId: item.variantId || null
    }));

    const dialogRef = this.dialog.open(OrdersProductsSelectListDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: {
        title: 'Productos Seleccionados',
        products: productsSelect
      }
    });

    dialogRef.closed.subscribe(result => {
      if (result === true) {
        this.selectedProducts = [];
        this.emitChanges();
        this.toast.success('Lista de productos limpiada');
      } else if (Array.isArray(result)) {
        this.selectedProducts = result.map(item => ({
          product: item.product,
          quantity: item.quantity,
          variantId: item.variantId || null
        }));
        this.emitChanges();
        this.toast.success('Lista de productos actualizada');
      }
    });
  }

  getVariantPriceRange(product: Product): string {
    if (!product.variants || product.variants.length === 0) return 'N/A';

    const prices = product.variants.map(v => v.salePrice || 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `Q${minPrice.toFixed(2)}`;
    }

    return `Q${minPrice.toFixed(2)} - Q${maxPrice.toFixed(2)}`;
  }

  // ==================== FUNCIONES PARA PRODUCTOS SIMPLES ====================

  getStockStatus(product: Product): string {
    const stock = product.currentStock || 0;
    const minStock = product.minStock || 0;

    if (stock === 0) return 'Sin stock';
    if (stock <= minStock) return 'Stock bajo';
    return 'Disponible';
  }

  getStockClass(product: Product): string {
    const stock = product.currentStock || 0;
    const minStock = product.minStock || 0;

    if (stock === 0) return 'text-red-600 dark:text-red-400';
    if (stock <= minStock) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  }

  // ==================== FUNCIONES PARA VARIANTES ====================

  getVariantStockStatus(variant: ProductVariant): string {
    const stock = variant.currentStock || 0;
    const minStock = variant.minStock || 0;

    if (stock === 0) return 'Sin stock';
    if (stock <= minStock) return 'Stock bajo';
    return 'Stock';
  }

  getVariantStockClass(variant: ProductVariant): string {
    const stock = variant.currentStock || 0;
    const minStock = variant.minStock || 0;

    if (stock === 0) {
      return 'text-red-600 dark:text-red-400 font-semibold';
    }
    if (stock <= minStock) {
      return 'text-orange-600 dark:text-orange-400 font-semibold';
    }
    return 'text-green-600 dark:text-green-400';
  }
}
