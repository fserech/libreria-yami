import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
} from '@ng-icons/material-icons/outline';
import { Product, ProductVariant } from '../../../../../shared/interfaces/product';
import { environment } from '../../../../../../environments/environment';
import { SelectProductQuantityDialogComponent } from '../select-product-quantity-dialog/select-product-quantity-dialog.component';
import { getProductCostPrice } from '../../../../../shared/utils/product-utils';
import { ProductOrderSelect } from '../../../../../shared/interfaces/order';

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
  })]
})
export class OrdersProductsSelectComponent implements OnInit {
  // ✅ Outputs que coinciden con el HTML del padre
  @Output() changes = new EventEmitter<ProductOrderSelect[]>();
  @Output() finalized = new EventEmitter<boolean>();

  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  selectedProducts: ProductOrderSelect[] = [];
  load = false;

  // Hacer disponible la función en el template
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

  selectProduct(product: Product) {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      this.selectVariant(product);
    } else {
      this.openQuantityDialog(product);
    }
  }

  selectVariant(product: Product) {
    // Convertir variantes a productos individuales
    const variantProducts: Product[] = (product.variants || []).map(variant => ({
      ...product,
      id: product.id,
      productName: `${product.productName} - ${variant.variantName}`,
      sku: variant.sku,
      salePrice: variant.salePrice,
      costPrice: getProductCostPrice(variant),
      currentStock: variant.currentStock,
      hasVariants: false
    }));

    // Mostrar selector de variantes
    if (variantProducts.length > 0) {
      this.openQuantityDialog(variantProducts[0]);
    }
  }

  openQuantityDialog(product: Product) {
    const dialogRef = this.dialog.open(SelectProductQuantityDialogComponent, {
      width: '400px',
      data: {
        product,
        title: 'Cantidad a vender',
        isPurchase: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addProductToOrder(result.product, result.quantity);
      }
    });
  }

  addProductToOrder(product: Product, quantity: number) {
    const existingProduct = this.selectedProducts.find(p => p.product.id === product.id);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      this.selectedProducts.push({ product, quantity });
    }

    // ✅ Emitir evento de cambio
    this.changes.emit(this.selectedProducts);
    this.toast.success(`${product.productName} agregado a la orden`);
  }

  removeProduct(index: number) {
    this.selectedProducts.splice(index, 1);
    // ✅ Emitir evento de cambio
    this.changes.emit(this.selectedProducts);
  }

  // ✅ Método para finalizar selección (llamado desde el padre o un botón)
  finalizeSelection() {
    if (this.selectedProducts.length > 0) {
      this.finalized.emit(true);
    } else {
      this.toast.info('Selecciona al menos 1 producto.');
      this.finalized.emit(false);
    }
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
