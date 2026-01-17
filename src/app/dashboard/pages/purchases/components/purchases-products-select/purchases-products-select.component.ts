import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
import { getProductCostPrice } from '../../../../../shared/utils/product-utils';

interface ProductPurchase {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-purchases-products-select',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    FormsModule
  ],
  templateUrl: './purchases-products-select.component.html',
  styleUrl: './purchases-products-select.component.scss',
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
export class PurchasesProductsSelectComponent implements OnInit {
  // ✅ Outputs corregidos
  @Output() changes = new EventEmitter<ProductPurchase[]>();
  @Output() finalized = new EventEmitter<boolean>();

  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  selectedProducts: ProductPurchase[] = [];
  expandedProducts: Set<number> = new Set();
  load = false;

  // ⭐ HACER DISPONIBLE LA FUNCIÓN EN EL TEMPLATE
  getProductCostPrice = getProductCostPrice;

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private dialog: MatDialog
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
    } catch (error) {
      console.error('Error cargando productos:', error);
      this.toast.error('Error al cargar productos');
    } finally {
      this.load = false;
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
    // Crear un producto temporal con los datos de la variante
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

    this.openQuantityDialog(variantProduct);
  }

  openQuantityDialog(product: Product) {
    const dialogRef = this.dialog.open(SelectProductQuantityDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: {
        product,
        title: 'Cantidad a comprar',
        isPurchase: true // Es una compra
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // ⭐ El resultado incluye el precio personalizado
        this.addProductToPurchase(result.product, result.quantity);
      }
    });
  }

  addProductToPurchase(product: Product, quantity: number) {
    const existingProduct = this.selectedProducts.find(p => p.product.id === product.id);

    if (existingProduct) {
      existingProduct.quantity += quantity;
      // Actualizar el producto con el nuevo precio si cambió
      existingProduct.product = product;
    } else {
      this.selectedProducts.push({ product, quantity });
    }

    // ✅ Emitir evento de cambio
    this.changes.emit(this.selectedProducts);
    this.toast.success(`${product.productName} agregado a la compra`);
  }

  removeProduct(index: number) {
    this.selectedProducts.splice(index, 1);
    // ✅ Emitir evento de cambio
    this.changes.emit(this.selectedProducts);
  }

  // ✅ Método para finalizar selección
  finalizeSelection() {
    if (this.selectedProducts.length > 0) {
      this.finalized.emit(true);
    } else {
      this.toast.info('Selecciona al menos 1 producto.');
      this.finalized.emit(false);
    }
  }

  getVariantPriceRange(product: Product): string {
    if (!product.variants || product.variants.length === 0) return 'N/A';

    const prices = product.variants.map(v => getProductCostPrice(v));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `Q${minPrice.toFixed(2)}`;
    }

    return `Q${minPrice.toFixed(2)} - Q${maxPrice.toFixed(2)}`;
  }

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
}
