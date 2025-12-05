import { Order, ProductOrder, ProductOrderSelect } from './../../../../../shared/interfaces/order';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Client } from '../../../../../shared/interfaces/client';
import { Panel } from '../../../../../shared/interfaces/panel';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapCalculator, bootstrapCheckCircleFill, bootstrapTruck } from '@ng-icons/bootstrap-icons';
import { matAddCircleOutline, matAddOutline, matDeleteOutline, matLocationOnOutline, matPersonOutline, matRemoveCircleOutline } from '@ng-icons/material-icons/outline';
import { DecimalPipe, NgClass } from '@angular/common';
import { ToastService } from '../../../../../shared/services/toast.service';
import { AuthService } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-orders-confirm',
  standalone: true,
  imports: [NgIconComponent, NgClass],
  templateUrl: './orders-confirm.component.html',
  styleUrl: './orders-confirm.component.scss',
  viewProviders: [
    provideIcons({
      bootstrapTruck, matPersonOutline, matLocationOnOutline, matDeleteOutline, matAddOutline,
      matRemoveCircleOutline, matAddCircleOutline, bootstrapCalculator, bootstrapCheckCircleFill
    })],
  providers: [DecimalPipe]
})
export class OrdersConfirmComponent {

  @Input() client: Client;
  @Input() products: ProductOrderSelect[];
  @Input() panel: Panel;
  @Input() observation: string;

  @Output() confirmOrder = new EventEmitter<Order>();
  @Output() backStep = new EventEmitter<boolean>();
  darkmode: string = '';
  load: boolean = false;
  count: number = 0;

  constructor(private decimalPipe: DecimalPipe,
              private toast: ToastService,
              private authService: AuthService){
    this.darkmode = localStorage.getItem('theme');
  }

  removeUnit(product: ProductOrderSelect): void {
    const index = this.products.findIndex(p => p.product.id === product.product.id);
    if (index !== -1 && this.products[index].quantity > 1) {
      this.products[index].quantity -= 1;
    }
  }

  addUnit(product: ProductOrderSelect): void {
    const index = this.products.findIndex(p => p.product.id === product.product.id);
    if (index !== -1 && this.products[index].quantity < 99999) {
      this.products[index].quantity += 1;
    }
  }

  removeProduct(product: ProductOrderSelect): void {

    if(this.products.length > 1){
      const index = this.products.findIndex(p => p.product.id === product.product.id);
      if (index !== -1) {
        this.products.splice(index, 1);
      }
    }else{
      this.toast.error('El pedido debe tener al menos 1 producto')
    }
  }

  getSubTotalForProduct(productOrder: ProductOrderSelect): string {
    if (!productOrder || !productOrder.product) {
      return this.formatCurrency(0);
    }
    const subtotal = productOrder.quantity * productOrder.product.price;
    return this.formatCurrency(subtotal);
  }

  // Método para calcular el total de la compra
  getTotal(): string {
    if (!this.products) {
      return this.formatCurrency(0);
    }
    const total = this.products.reduce((sum, productOrder) => {
      return sum + productOrder.quantity * productOrder.product.price;
    }, 0);
    return this.formatCurrency(total);
  }

  private formatCurrency(value: number): string {
    return this.decimalPipe.transform(value, '1.2-2') || '0.00';
  }

  backStepProducts(){
    this.backStep.emit(true);
  }

  

  buildOrder(){
    this.load = true;
    this.count ++;
    if(this.count === 1){
    const userId = this.authService.getUserData().id;
    const name: string = this.authService.getUserData().sub;
    const email: string = this.authService.getUserData().email;

    const order: Order = {
      clientId: this.client.id,
      userId: userId,
      user: name,
      emailUser: email,
      transportDelivery: this.panel.key as 'P1' | 'P2',
      description: this.getObservation(),
      status: 'PENDING',
      products: this.buildProducts(this.products)
    }

    this.confirmOrder.emit(order);
    }else{
      this.toast.info('cargando pedido...');
    }

  }

  buildProducts(products: ProductOrderSelect[]): ProductOrder[] {
    return products.map(product => {
      const subtotal = parseFloat((product.product.price * product.quantity).toFixed(2));
      return {
        productId: product.product.id,
        priceSale: product.product.price,
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
