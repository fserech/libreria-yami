import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matInfoOutline,
  matCheckCircleOutline,
  matCancelOutline,
} from '@ng-icons/material-icons/outline';
import { Product } from '../../../../../shared/interfaces/product';
import { getProductCostPrice } from '../../../../../shared/utils/product-utils';

interface DialogData {
  product: Product;
  title: string;
  isPurchase: boolean; // true = compra, false = venta
}

@Component({
  selector: 'app-select-product-quantity-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIconComponent
  ],
  templateUrl: './select-product-quantity-dialog.component.html',
  viewProviders: [provideIcons({
    matInfoOutline,
    matCheckCircleOutline,
    matCancelOutline,
  })]
})
export class SelectProductQuantityDialogComponent implements OnInit {
  form: FormGroup;
  maxStock: number;
  suggestedPrice: number = 0;

  // ⭐ PRECIO DE COSTO DEL PROVEEDOR
  costPrice: number = 0;

  constructor(
    public dialogRef: MatDialogRef<SelectProductQuantityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder
  ) {
    this.maxStock = data.product.currentStock || 0;

    // ⭐ OBTENER PRECIO DE COSTO DEL PROVEEDOR
    this.costPrice = getProductCostPrice(data.product);

    // Para ventas, el precio sugerido es el precio de venta
    // Para compras, el precio sugerido es el precio de costo
    this.suggestedPrice = data.isPurchase
      ? this.costPrice
      : (data.product.salePrice || 0);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      // ⭐ CAMPO DE PRECIO (opcional, para sobrescribir)
      customPrice: [this.suggestedPrice, [Validators.min(0)]]
    });

    // Si es venta, validar que no exceda el stock
    if (!this.data.isPurchase) {
      this.form.get('quantity')?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(this.maxStock)
      ]);
    }
  }

  get quantity() {
    return this.form.get('quantity')?.value || 0;
  }

  get customPrice() {
    return this.form.get('customPrice')?.value || this.suggestedPrice;
  }

  get total(): number {
    return this.quantity * this.customPrice;
  }

  // ⭐ CALCULAR GANANCIA POTENCIAL (solo para ventas)
  get potentialProfit(): number {
    if (this.data.isPurchase) return 0;
    return (this.customPrice - this.costPrice) * this.quantity;
  }

  get profitMargin(): number {
    if (this.data.isPurchase || this.costPrice === 0) return 0;
    return ((this.customPrice - this.costPrice) / this.costPrice) * 100;
  }

  incrementQuantity(): void {
    const current = this.quantity;
    if (this.data.isPurchase || current < this.maxStock) {
      this.form.patchValue({ quantity: current + 1 });
    }
  }

  decrementQuantity(): void {
    const current = this.quantity;
    if (current > 1) {
      this.form.patchValue({ quantity: current - 1 });
    }
  }

  // ⭐ RESETEAR AL PRECIO SUGERIDO
  resetToSuggestedPrice(): void {
    this.form.patchValue({ customPrice: this.suggestedPrice });
  }

  confirm(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        product: {
          ...this.data.product,
          // Sobrescribir el precio si se modificó
          salePrice: this.customPrice
        },
        quantity: this.quantity,
        customPrice: this.customPrice
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
