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

  @Input() supplier: Supplier;
  @Input() products: ProductPurchaseSelect[];
  @Input() branch: Branch | null;
  @Input() observation: string;

  @Output() confirmPurchase = new EventEmitter<Purchase>();
  @Output() backStep = new EventEmitter<boolean>();
  darkmode: string = '';
  load: boolean = false;
  count: number = 0;

  constructor(private decimalPipe: DecimalPipe,
              private toast: ToastService,
              private authService: AuthService){
    this.darkmode = localStorage.getItem('theme');
  }

  removeUnit(product: ProductPurchaseSelect): void {
    const index = this.products.findIndex(p => p.product.id === product.product.id);
    if (index !== -1 && this.products[index].quantity > 1) {
      this.products[index].quantity -= 1;
    }
  }

  addUnit(product: ProductPurchaseSelect): void {
    const index = this.products.findIndex(p => p.product.id === product.product.id);
    if (index !== -1 && this.products[index].quantity < 99999) {
      this.products[index].quantity += 1;
    }
  }

  removeProduct(product: ProductPurchaseSelect): void {
    if(this.products.length > 1){
      const index = this.products.findIndex(p => p.product.id === product.product.id);
      if (index !== -1) {
        this.products.splice(index, 1);
      }
    }else{
      this.toast.error('La compra debe tener al menos 1 producto')
    }
  }

  getSubTotalForProduct(productPurchase: ProductPurchaseSelect): string {
    if (!productPurchase || !productPurchase.product) {
      return this.formatCurrency(0);
    }
    const subtotal = productPurchase.quantity * productPurchase.product.costPrice;
    return this.formatCurrency(subtotal);
  }

  getTotal(): string {
    if (!this.products) {
      return this.formatCurrency(0);
    }
    const total = this.products.reduce((sum, productPurchase) => {
      return sum + productPurchase.quantity * productPurchase.product.costPrice;
    }, 0);
    return this.formatCurrency(total);
  }

  private formatCurrency(value: number): string {
    return this.decimalPipe.transform(value, '1.2-2') || '0.00';
  }

  backStepProducts(){
    this.backStep.emit(true);
  }

  buildPurchase(){
    if (!this.branch || !this.branch.id) {
      this.toast.error('Debe seleccionar una sucursal');
      return;
    }

    // ✅ YA NO SE VALIDA LA FECHA DE ENTREGA AQUÍ
    // La fecha se registrará cuando se marque como RECIBIDA

    this.load = true;
    this.count++;

    if(this.count === 1){
      const userId = this.authService.getUserData().id;
      const name: string = this.authService.getUserData().sub;
      const email: string = this.authService.getUserData().email;

      const purchase: Purchase = {
        supplierId: this.supplier.id,
        userId: userId,
        user: name,
        emailUser: email,
        idBranch: this.branch.id,
        branchName: this.branch.name,
        purchaseDate: new Date().toISOString().split('T')[0], // Fecha de creación
        deliveryDate: null, // ✅ Se registrará cuando se marque como RECIBIDA
        observation: this.getObservation(),
        status: 'PENDING',
        products: this.buildProducts(this.products)
      }

      this.confirmPurchase.emit(purchase);
    }else{
      this.toast.info('Cargando compra...');
    }
  }

  buildProducts(products: ProductPurchaseSelect[]): ProductPurchase[] {
    return products.map(product => {
      const subtotal = parseFloat((product.product.costPrice * product.quantity).toFixed(2));
      return {
        productId: product.product.id,
        variantId: product.variantId || null,
        priceCost: product.product.costPrice,
        quantity: product.quantity,
        subtotal: subtotal
      };
    });
  }

  getObservation(): string {
    if(this.observation !== null && this.observation !== undefined ){
      if(this.observation !== ''){
        return this.observation;
      }else{
        return '';
      }
    }else{
      return '';
    }
  }
}
