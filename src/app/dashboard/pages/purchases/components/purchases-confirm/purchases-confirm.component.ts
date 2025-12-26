// purchases-confirm.component.ts
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
import { Purchase, PurchaseProductSelect } from '../../../../../shared/interfaces/purchase';
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
@Input() mode: any;

  @Input() supplier: { id: number; name: string };
  @Input() products: PurchaseProductSelect[] = [];
  @Input() purchaseDate: string;
  @Input() observation: string;
  @Input() totalAmount: number = 0;

  @Output() confirmPurchase = new EventEmitter<Purchase>();
  @Output() backStep = new EventEmitter<boolean>();

  loading: boolean = false;

  constructor(private auth: AuthService) {}

  getTotalUnits(): number {
    return this.products.reduce((sum, p) => sum + p.quantity, 0);
  }

  goBack(): void {
    this.backStep.emit(true);
  }

  confirm(): void {
    if (!this.supplier || !this.products || this.products.length === 0) {
      return;
    }

    this.loading = true;

    const purchase: Purchase = {
      purchaseDate: this.purchaseDate,
      supplierId: this.supplier.id,
      supplierName: this.supplier.name,
      totalAmount: this.totalAmount,
      status: 'COMPLETED',
      observation: this.observation || null,
      items: this.products.map(p => ({
        productId: p.productId,
        variantId: p.variantId,
        productName: p.productName,
        variantName: p.variantName,
        sku: p.sku,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        subtotal: p.subtotal,
        categoryName: p.categoryName,
        brandName: p.brandName,
        currentStock: p.currentStock
      })),
      idUser: this.auth.getUserData().id
    };

    this.confirmPurchase.emit(purchase);
  }
}
