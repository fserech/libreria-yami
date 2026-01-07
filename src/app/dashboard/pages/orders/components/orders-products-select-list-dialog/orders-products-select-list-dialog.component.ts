import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { DialogData } from '../../../../../shared/interfaces/dialog-data';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ProductOrderSelect } from '../../../../../shared/interfaces/order';
import { DialogDataProductsSelect } from '../../../../../shared/interfaces/dialog-data-products-select';
import { matAddCircleOutline, matDeleteOutline, matRefreshOutline, matRemoveCircleOutline } from '@ng-icons/material-icons/outline';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-orders-products-select-list-dialog',
  standalone: true,
  imports: [NgIcon, NgClass],
  templateUrl: './orders-products-select-list-dialog.component.html',
  styleUrl: './orders-products-select-list-dialog.component.scss',
  viewProviders: [ provideIcons({ matDeleteOutline, matRefreshOutline, matAddCircleOutline, matRemoveCircleOutline }) ]
})
export class OrdersProductsSelectListDialogComponent {

  darkmode: string = '';
  load: boolean = false;
  productsSelectList: ProductOrderSelect[] = [];

  constructor(@Inject(DIALOG_DATA) public data: DialogDataProductsSelect,
  public dialogRef: DialogRef,
  private toast: ToastService){
    this.productsSelectList = this.data.products;
    this.darkmode = localStorage.getItem('theme');
  }

  close(): void {
    this.dialogRef.close();
  }

  ok(): void {
    this.dialogRef.close(this.productsSelectList);
  }

  clearList(){
    this.dialogRef.close(true);
  }

  removeUnit(product: ProductOrderSelect): void {
    const index = this.productsSelectList.findIndex(p => p.product.id === product.product.id);
    if (index !== -1 && this.productsSelectList[index].quantity > 1) {
      this.productsSelectList[index].quantity -= 1;
    }
  }

  addUnit(product: ProductOrderSelect): void {
    const index = this.productsSelectList.findIndex(p => p.product.id === product.product.id);
    if (index !== -1 && this.productsSelectList[index].quantity < 99999) {
      this.productsSelectList[index].quantity += 1;
    }
  }

  removeProduct(product: ProductOrderSelect): void {
    const index = this.productsSelectList.findIndex(p => p.product.id === product.product.id);
    if (index !== -1) {
      this.productsSelectList.splice(index, 1);
    }
  }

}
