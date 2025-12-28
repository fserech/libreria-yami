// purchases-confirm.component.ts - COMPLETO
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { NgIconComponent, provideIcons } from '@ng-icons/core';

// Icons
import {
  matCheckCircleOutline,
  matStoreOutline,
  matInventory2Outline,
  matArrowBackOutline,
  matHourglassEmptyOutline
} from '@ng-icons/material-icons/outline';

// Interfaces
import {
  Purchase,
  ProductPurchaseSelect,
  ProductPurchase
} from '../../../../../shared/interfaces/purchase';
import { Product } from '../../../../../shared/interfaces/product';
import { AuthService } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-purchases-confirm',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './purchases-confirm.component.html',
  styleUrl: './purchases-confirm.component.scss',
  viewProviders: [
    provideIcons({
      matCheckCircleOutline,
      matStoreOutline,
      matInventory2Outline,
      matArrowBackOutline,
      matHourglassEmptyOutline
    })
  ]
})
export class PurchasesConfirmComponent {
  @Input() mode: 'new' | 'edit' | 'view' = 'new';
  @Input() supplierId: number;
  @Input() supplierName: string;
  @Input() products: ProductPurchaseSelect[] = [];
  @Input() purchaseDate: string;
  @Input() observation: string;

  @Output() confirmPurchase = new EventEmitter<Purchase>();
  @Output() backStep = new EventEmitter<boolean>();

  loading: boolean = false;

  constructor(private auth: AuthService) {}

  getTotalUnits(): number {
    return this.products.reduce((sum, p) => sum + p.quantity, 0);
  }

  getTotalAmount(): number {
    return this.products.reduce((sum, p) => {
      const price = this.getProductPrice(p);
      return sum + (price * p.quantity);
    }, 0);
  }

  getProductPrice(productSelect: ProductPurchaseSelect): number {
    if (productSelect.variantId && productSelect.product.variants) {
      const variant = productSelect.product.variants.find(
        v => v.id === productSelect.variantId
      );
      return variant?.costPrice || 0;
    }
    return productSelect.product.costPrice || 0;
  }

  getProductName(productSelect: ProductPurchaseSelect): string {
    let name = productSelect.product.productName;

    if (productSelect.variantId && productSelect.product.variants) {
      const variant = productSelect.product.variants.find(
        v => v.id === productSelect.variantId
      );
      if (variant) {
        name += ` - ${variant.variantName}`;
      }
    }

    return name;
  }

  getProductSku(productSelect: ProductPurchaseSelect): string {
    if (productSelect.variantId && productSelect.product.variants) {
      const variant = productSelect.product.variants.find(
        v => v.id === productSelect.variantId
      );
      return variant?.sku || '';
    }
    return productSelect.product.sku || '';
  }

  getCategoryName(product: Product): string {
    return (product as any).categoryName || '';
  }

  getSubtotal(productSelect: ProductPurchaseSelect): number {
    const price = this.getProductPrice(productSelect);
    return price * productSelect.quantity;
  }

  goBack(): void {
    this.backStep.emit(true);
  }

  confirm(): void {
    if (!this.validatePurchaseData()) {
      return;
    }

    this.loading = true;

    const purchase = this.buildPurchaseObject();

    setTimeout(() => {
      this.confirmPurchase.emit(purchase);
    }, 300);
  }

  private validatePurchaseData(): boolean {
    if (!this.supplierId) {
      console.error('❌ Falta el proveedor');
      return false;
    }

    if (!this.products || this.products.length === 0) {
      console.error('❌ No hay productos seleccionados');
      return false;
    }

    if (!this.purchaseDate) {
      console.error('❌ Falta la fecha de compra');
      return false;
    }

    return true;
  }

  private buildPurchaseObject(): Purchase {
    const products: ProductPurchase[] = this.products.map(ps => {
      const price = this.getProductPrice(ps);

      return {
        productId: ps.product.id,
        variantId: ps.variantId || null,
        priceCost: price,
        quantity: ps.quantity,
        subtotal: price * ps.quantity
      };
    });

    const purchase: Purchase = {
      supplierId: this.supplierId,
      userId: this.auth.getUserData()?.id,
      purchaseDate: this.purchaseDate,
      totalAmount: this.getTotalAmount(),
      status: 'PENDING',
      observation: this.observation?.trim() || '',
      products: products
    };

    return purchase;
  }

  canConfirm(): boolean {
    return this.products.length > 0 &&
           !this.loading &&
           this.mode !== 'view';
  }
}
