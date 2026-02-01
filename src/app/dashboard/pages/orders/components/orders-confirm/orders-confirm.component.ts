import { Order, ProductOrder, ProductOrderSelect } from './../../../../../shared/interfaces/order';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Client } from '../../../../../shared/interfaces/client';
import { Branch } from '../../../../../shared/interfaces/branch';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapCalculator, bootstrapCheckCircleFill, bootstrapShop } from '@ng-icons/bootstrap-icons';
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
      bootstrapShop, matPersonOutline, matLocationOnOutline, matDeleteOutline, matAddOutline,
      matRemoveCircleOutline, matAddCircleOutline, bootstrapCalculator, bootstrapCheckCircleFill
    })],
  providers: [DecimalPipe]
})
export class OrdersConfirmComponent implements OnInit {

  @Input() client: Client;
  @Input() products: ProductOrderSelect[];
  @Input() branch: Branch | null;
  @Input() observation: string;
  @Input() orderId?: number;
  @Input() isEditMode: boolean = false;

  @Output() confirmOrder = new EventEmitter<Order>();
  @Output() backStep = new EventEmitter<boolean>();

  darkmode: string = '';
  load: boolean = false;
  count: number = 0;

  constructor(
    private decimalPipe: DecimalPipe,
    private toast: ToastService,
    private authService: AuthService
  ){
    this.darkmode = localStorage.getItem('theme');
  }

  ngOnInit(): void {
    console.log('🔍 orders-confirm ngOnInit:', {
      orderId: this.orderId,
      isEditMode: this.isEditMode,
      client: this.client?.name,
      productsCount: this.products?.length,
      branch: this.branch?.name
    });
  }

  removeUnit(product: ProductOrderSelect): void {
    const index = this.products.findIndex(p =>
      p.product.id === product.product.id &&
      (p.variantId === product.variantId || (!p.variantId && !product.variantId))
    );
    if (index !== -1 && this.products[index].quantity > 1) {
      this.products[index].quantity -= 1;
    }
  }

  addUnit(product: ProductOrderSelect): void {
    const index = this.products.findIndex(p =>
      p.product.id === product.product.id &&
      (p.variantId === product.variantId || (!p.variantId && !product.variantId))
    );
    if (index !== -1 && this.products[index].quantity < 99999) {
      this.products[index].quantity += 1;
    }
  }

  removeProduct(product: ProductOrderSelect): void {
    if(this.products.length > 1){
      const index = this.products.findIndex(p =>
        p.product.id === product.product.id &&
        (p.variantId === product.variantId || (!p.variantId && !product.variantId))
      );
      if (index !== -1) {
        this.products.splice(index, 1);
      }
    }else{
      this.toast.error('La venta debe tener al menos 1 producto')
    }
  }

  getSubTotalForProduct(productOrder: ProductOrderSelect): string {
    if (!productOrder || !productOrder.product) {
      return this.formatCurrency(0);
    }
    const subtotal = productOrder.quantity * productOrder.product.salePrice;
    return this.formatCurrency(subtotal);
  }

  getTotal(): string {
    if (!this.products) {
      return this.formatCurrency(0);
    }
    const total = this.products.reduce((sum, productOrder) => {
      return sum + productOrder.quantity * productOrder.product.salePrice;
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
    console.log('🚀 buildOrder iniciado');
    console.log('📋 Datos actuales:', {
      orderId: this.orderId,
      isEditMode: this.isEditMode,
      branchId: this.branch?.id,
      clientId: this.client?.id,
      productsCount: this.products?.length
    });

    if (!this.branch || !this.branch.id) {
      this.toast.error('Debe seleccionar una sucursal');
      return;
    }

    this.load = true;
    this.count++;

    if(this.count === 1){
      const userId = this.authService.getUserData().id;
      const name: string = this.authService.getUserData().sub;
      const email: string = this.authService.getUserData().email;

      const order: Order = {
        id: this.isEditMode && this.orderId ? this.orderId : undefined,
        clientId: this.client.id,
        userId: userId,
        user: name,
        emailUser: email,
        idBranch: this.branch.id,
        branchName: this.branch.name,
        description: this.getObservation(),
        status: 'PENDING',
        products: this.buildProducts(this.products)
      }

      console.log('✅ Orden construida para enviar:', {
        id: order.id,
        clientId: order.clientId,
        branchId: order.idBranch,
        productsCount: order.products.length,
        isEditMode: this.isEditMode
      });

      console.log('📦 Orden completa:', order);

      this.confirmOrder.emit(order);
    }else{
      this.toast.info('Cargando venta...');
    }
  }

  buildProducts(products: ProductOrderSelect[]): ProductOrder[] {
    return products.map(product => {
      const subtotal = parseFloat((product.product.salePrice * product.quantity).toFixed(2));
      return {
        productId: product.product.id,
        variantId: product.variantId || null,
        priceSale: product.product.salePrice,
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
