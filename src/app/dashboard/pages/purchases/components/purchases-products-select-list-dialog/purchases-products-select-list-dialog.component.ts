import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ProductPurchaseSelect } from '../../../../../shared/interfaces/purchase';
import { DialogDataProductsSelect } from '../../../../../shared/interfaces/dialog-data-products-select';
import {
  matAddCircleOutline,
  matDeleteOutline,
  matRemoveCircleOutline,
  matAddShoppingCartOutline,
  matCloseOutline,
  matCheckCircleOutline,
  matShoppingCartOutline
} from '@ng-icons/material-icons/outline';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-purchases-products-select-list-dialog',
  standalone: true,
  imports: [NgIcon, NgClass],
  templateUrl: './purchases-products-select-list-dialog.component.html',
  styleUrl: './purchases-products-select-list-dialog.component.scss',
  viewProviders: [
    provideIcons({
      matDeleteOutline,
      matAddCircleOutline,
      matRemoveCircleOutline,
      matAddShoppingCartOutline,
      matCloseOutline,
      matCheckCircleOutline,
      matShoppingCartOutline
    })
  ]
})
export class PurchasesProductsSelectListDialogComponent {
  darkmode: string = '';
  load: boolean = false;
  productsSelectList: ProductPurchaseSelect[] = [];

  constructor(
    @Inject(DIALOG_DATA) public data: DialogDataProductsSelect,
    public dialogRef: DialogRef,
    private toast: ToastService
  ){
    this.productsSelectList = this.data.products;
    this.darkmode = localStorage.getItem('theme') || '';
  }

  close(): void {
    this.dialogRef.close();
  }

  ok(): void {
    if (this.productsSelectList.length === 0) {
      this.toast.error('Debe seleccionar al menos un producto');
      return;
    }
    this.dialogRef.close(this.productsSelectList);
  }

  clearList(): void {
    if (this.productsSelectList.length === 0) {
      this.toast.info('No hay productos para limpiar');
      return;
    }

    // Confirmar antes de limpiar
    if (confirm('¿Está seguro de que desea eliminar todos los productos seleccionados?')) {
      this.dialogRef.close(true);
    }
  }

  removeUnit(product: ProductPurchaseSelect): void {
    const index = this.productsSelectList.findIndex(p => p.product.id === product.product.id);
    if (index !== -1 && this.productsSelectList[index].quantity > 1) {
      this.productsSelectList[index].quantity -= 1;
    }
  }

  addUnit(product: ProductPurchaseSelect): void {
    const index = this.productsSelectList.findIndex(p => p.product.id === product.product.id);
    if (index !== -1 && this.productsSelectList[index].quantity < 99999) {
      this.productsSelectList[index].quantity += 1;
    }
  }

  removeProduct(product: ProductPurchaseSelect): void {
    const index = this.productsSelectList.findIndex(p => p.product.id === product.product.id);
    if (index !== -1) {
      this.productsSelectList.splice(index, 1);
      this.toast.success('Producto eliminado de la lista');
    }
  }

  /**
   * Calcula el subtotal de un producto (precio costo × cantidad)
   * @param product Producto a calcular
   * @returns Subtotal formateado
   */
  getSubtotal(product: ProductPurchaseSelect): string {
    if (!product || !product.product || !product.product.costPrice) {
      return '0.00';
    }
    const subtotal = product.product.costPrice * product.quantity;
    return subtotal.toFixed(2);
  }

  /**
   * Calcula el total de todos los productos
   * @returns Total formateado
   */
  getTotal(): string {
    if (!this.productsSelectList || this.productsSelectList.length === 0) {
      return '0.00';
    }
    const total = this.productsSelectList.reduce((sum, product) => {
      return sum + (product.product.costPrice * product.quantity);
    }, 0);
    return total.toFixed(2);
  }

  /**
   * Obtiene el total de unidades
   * @returns Número total de unidades
   */
  getTotalUnits(): number {
    if (!this.productsSelectList || this.productsSelectList.length === 0) {
      return 0;
    }
    return this.productsSelectList.reduce((sum, product) => sum + product.quantity, 0);
  }
}
