import { Purchase, ProductPurchase, ProductPurchaseSelect } from './../../../../../shared/interfaces/purchase';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Supplier } from '../../../../../shared/interfaces/supplier';
import { Branch } from '../../../../../shared/interfaces/branch';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapCalculator, bootstrapCheckCircleFill, bootstrapShop } from '@ng-icons/bootstrap-icons';
import { matAddCircleOutline, matAddOutline, matCalendarTodayOutline, matDeleteOutline, matLocationOnOutline, matPersonOutline, matRemoveCircleOutline } from '@ng-icons/material-icons/outline';
import { DecimalPipe, NgClass } from '@angular/common';
import { ToastService } from '../../../../../shared/services/toast.service';
import { AuthService } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-purchases-confirm',
  standalone: true,
  imports: [NgIconComponent, NgClass],
  templateUrl: './purchases-confirm.component.html',
  styleUrl: './purchases-confirm.component.scss',
  viewProviders: [
    provideIcons({
      bootstrapShop, matPersonOutline, matLocationOnOutline, matDeleteOutline, matAddOutline,
      matRemoveCircleOutline, matAddCircleOutline, bootstrapCalculator, bootstrapCheckCircleFill,
      matCalendarTodayOutline
    })],
  providers: [DecimalPipe]
})
export class PurchasesConfirmComponent {
  @Input() supplier!: Supplier;
  @Input() products: ProductPurchaseSelect[] = [];
  @Input() branch: Branch | null = null;
  @Input() observation: string = '';

  // ✅ Este evento ahora solo indica que se debe mostrar el dialog
  @Output() confirmPurchase = new EventEmitter<void>();
  @Output() backStep = new EventEmitter<boolean>();

  darkmode: string = '';
  load: boolean = false;

  constructor(
    private decimalPipe: DecimalPipe,
    private toast: ToastService,
    private authService: AuthService
  ) {
    this.darkmode = localStorage.getItem('theme') || '';
  }

  /**
   * ✅ Reduce la cantidad de un producto
   */
  removeUnit(product: ProductPurchaseSelect): void {
    const index = this.products.findIndex(p => p.product.id === product.product.id);
    if (index !== -1 && this.products[index].quantity > 1) {
      this.products[index].quantity -= 1;
    }
  }

  /**
   * ✅ Aumenta la cantidad de un producto
   */
  addUnit(product: ProductPurchaseSelect): void {
    const index = this.products.findIndex(p => p.product.id === product.product.id);
    if (index !== -1 && this.products[index].quantity < 99999) {
      this.products[index].quantity += 1;
    }
  }

  /**
   * ✅ Elimina un producto de la lista
   */
  removeProduct(product: ProductPurchaseSelect): void {
    if (this.products.length > 1) {
      const index = this.products.findIndex(p => p.product.id === product.product.id);
      if (index !== -1) {
        this.products.splice(index, 1);
      }
    } else {
      this.toast.error('La compra debe tener al menos 1 producto');
    }
  }

  /**
   * ✅ Calcula el subtotal de un producto
   */
  getSubTotalForProduct(productPurchase: ProductPurchaseSelect): string {
    if (!productPurchase || !productPurchase.product) {
      return this.formatCurrency(0);
    }
    const subtotal = productPurchase.quantity * productPurchase.product.costPrice;
    return this.formatCurrency(subtotal);
  }

  /**
   * ✅ Calcula el total de la compra
   */
  getTotal(): string {
    if (!this.products || this.products.length === 0) {
      return this.formatCurrency(0);
    }
    const total = this.products.reduce((sum, productPurchase) => {
      return sum + productPurchase.quantity * productPurchase.product.costPrice;
    }, 0);
    return this.formatCurrency(total);
  }

  /**
   * ✅ Formatea un número como moneda
   */
  private formatCurrency(value: number): string {
    return this.decimalPipe.transform(value, '1.2-2') || '0.00';
  }

  /**
   * ✅ Regresa al paso de selección de productos
   */
  backStepProducts(): void {
    this.backStep.emit(true);
  }

  /**
   * ✅ Obtiene el estado de entrega (siempre pendiente para nuevas compras)
   */
  getDeliveryStatus(): string {
    return 'Pendiente de recepción';
  }

  /**
   * ✅ Verifica si la entrega está pendiente
   */
  isDeliveryPending(): boolean {
    return true;
  }

  /**
   * ✅ Este método ahora solo emite el evento para que el padre abra el dialog
   */
  buildPurchase(): void {
    if (this.products.length === 0) {
      this.toast.error('Debe seleccionar al menos un producto');
      return;
    }

    // Validación adicional del proveedor
    if (!this.supplier || !this.supplier.id) {
      this.toast.error('Error: No se ha seleccionado un proveedor válido');
      return;
    }

    // ✅ Emitir evento para que el componente padre abra el dialog
    this.confirmPurchase.emit();
  }
}
