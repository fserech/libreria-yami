import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
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
import { Supplier } from '../../../../../shared/interfaces/supplier';
import { environment } from '../../../../../../environments/environment';
import { SelectProductQuantityDialogComponent } from '../select-product-quantity-dialog/select-product-quantity-dialog.component';
import { PurchasesProductsSelectListDialogComponent } from '../purchases-products-select-list-dialog/purchases-products-select-list-dialog.component';
import {
  getProductCostPrice,
  getProductCostPriceForSupplier,
  productHasSupplier
} from '../../../../../shared/utils/product-utils';
import { ProductPurchaseSelect } from '../../../../../shared/interfaces/purchase';

interface ProductPurchase {
  product: Product;
  quantity: number;
  variantId?: number | null;
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
export class PurchasesProductsSelectComponent implements OnInit, OnChanges {
  @Input() selectedSupplier: Supplier | null = null; // ⭐ NUEVO: Recibir proveedor seleccionado
  @Output() changes = new EventEmitter<ProductPurchaseSelect[]>();
  @Output() finalized = new EventEmitter<boolean>();

  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  selectedProducts: ProductPurchase[] = [];
  expandedProducts: Set<number> = new Set();
  load = false;

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private matDialog: MatDialog,
    private dialog: Dialog
  ) {}

  async ngOnInit() {
    await this.loadProducts();
  }

  ngOnChanges(changes: SimpleChanges) {
    // ⭐ Cuando cambia el proveedor seleccionado, filtrar productos
    if (changes['selectedSupplier'] && !changes['selectedSupplier'].firstChange) {
      console.log('🔄 Proveedor cambiado:', this.selectedSupplier);
      this.filterProductsBySupplier();
    }
  }

  async loadProducts() {
    this.load = true;
    try {
      const response = await firstValueFrom(
        this.crud.http.get<Product[]>(`${environment.apiUrl}/api/v1/products`)
      );

      this.products = response.filter(p => p.active);
      this.filterProductsBySupplier(); // Filtrar por proveedor seleccionado
    } catch (error) {
      console.error('Error cargando productos:', error);
      this.toast.error('Error al cargar productos');
    } finally {
      this.load = false;
    }
  }

  /**
   * ⭐ NUEVO: Filtra productos por proveedor seleccionado
   */
  filterProductsBySupplier() {
    let productsToFilter = [...this.products];

    // Si hay proveedor seleccionado, filtrar solo productos de ese proveedor
    if (this.selectedSupplier?.id) {
      productsToFilter = productsToFilter.filter(product =>
        this.productHasSupplier(product)
      );
    }

    // Aplicar búsqueda por texto si existe
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredProducts = productsToFilter.filter(product =>
        product.productName.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term) ||
        product.productDesc?.toLowerCase().includes(term)
      );
    } else {
      this.filteredProducts = productsToFilter;
    }

    console.log(`📦 Productos filtrados: ${this.filteredProducts.length}/${this.products.length}`);
  }

  /**
   * ⭐ NUEVO: Verifica si un producto tiene el proveedor seleccionado
   */
  productHasSupplier(product: Product): boolean {
    if (!this.selectedSupplier?.id) return true;

    // Para productos simples
    if (!product.hasVariants) {
      return productHasSupplier(product, this.selectedSupplier.id);
    }

    // Para productos con variantes, al menos una variante debe tener el proveedor
    if (product.variants && product.variants.length > 0) {
      return product.variants.some(variant =>
        productHasSupplier(variant, this.selectedSupplier!.id)
      );
    }

    return false;
  }

  /**
   * ⭐ MODIFICADO: Obtiene el precio de costo según el proveedor seleccionado
   */
  getProductCostPrice(product: Product | ProductVariant): number {
    if (!this.selectedSupplier?.id) {
      return getProductCostPrice(product);
    }

    return getProductCostPriceForSupplier(product, this.selectedSupplier.id);
  }

  searchProducts() {
    this.filterProductsBySupplier();
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
    // ⭐ Validar que el producto tenga el proveedor seleccionado
    if (this.selectedSupplier?.id && !this.productHasSupplier(product)) {
      this.toast.error(`Este producto no está disponible con el proveedor ${this.selectedSupplier.supplierName}`);
      return;
    }

    if (product.hasVariants && product.variants && product.variants.length > 0) {
      this.toggleProductExpansion(product.id!);
    } else {
      this.openQuantityDialog(product);
    }
  }

  selectVariant(product: Product, variant: ProductVariant) {
    // ⭐ Validar que la variante tenga el proveedor seleccionado
    if (this.selectedSupplier?.id && !productHasSupplier(variant, this.selectedSupplier.id)) {
      this.toast.error(`Esta variante no está disponible con el proveedor ${this.selectedSupplier.supplierName}`);
      return;
    }

    // Obtener el precio correcto según el proveedor seleccionado
    const costPrice = this.selectedSupplier?.id
      ? getProductCostPriceForSupplier(variant, this.selectedSupplier.id)
      : getProductCostPrice(variant);

    // Crear un producto temporal con los datos de la variante
    const variantProduct: Product = {
      ...product,
      id: product.id,
      productName: `${product.productName} - ${variant.variantName}`,
      sku: variant.sku,
      salePrice: variant.salePrice,
      costPrice: costPrice,
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
        title: 'Cantidad a comprar',
        isPurchase: true,
        supplierId: this.selectedSupplier?.id // ⭐ Pasar proveedor al diálogo
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addProductToPurchase(result.product, result.quantity, variantId);
      }
    });
  }

  addProductToPurchase(product: Product, quantity: number, variantId?: number) {
    const existingProduct = this.selectedProducts.find(p =>
      p.product.id === product.id &&
      (variantId ? p.variantId === variantId : !p.variantId)
    );

    if (existingProduct) {
      existingProduct.quantity += quantity;
      existingProduct.product = product;
    } else {
      this.selectedProducts.push({ product, quantity, variantId: variantId || null });
    }

    this.emitChanges();
    this.toast.success(`${product.productName} agregado a la compra`);
  }

  removeProduct(index: number) {
    this.selectedProducts.splice(index, 1);
    this.emitChanges();
  }

  /**
   * Emite los cambios en el formato esperado por el componente padre
   */
  private emitChanges() {
    const productsSelect: ProductPurchaseSelect[] = this.selectedProducts.map(item => ({
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

    const productsSelect: ProductPurchaseSelect[] = this.selectedProducts.map(item => ({
      product: item.product,
      quantity: item.quantity,
      variantId: item.variantId || null
    }));

    const dialogRef = this.dialog.open(PurchasesProductsSelectListDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: {
        title: 'Productos Seleccionados',
        products: productsSelect,
        supplierId: this.selectedSupplier?.id // ⭐ Pasar proveedor al diálogo
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

  /**
   * Finaliza la selección de productos
   */
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

    const prices = product.variants.map(v => this.getProductCostPrice(v));
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
