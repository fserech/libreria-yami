import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { REGUEX_INT } from '../../../../../shared/constants/reguex';
import { DialogData } from '../../../../../shared/interfaces/dialog-data';
import { ToastService } from '../../../../../shared/services/toast.service';
import { Product } from '../../../../../shared/interfaces/product';

@Component({
  selector: 'app-select-product-quantity-dialog',
  standalone: true,
  imports: [FormsModule, InputComponent, SelectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './select-product-quantity-dialog.component.html',
  styleUrl: './select-product-quantity-dialog.component.scss'
})
export class SelectProductQuantityDialogComponent {

  form: FormGroup;
  load: boolean = false;
  product: Product;
  productsList: {product: Product, quantity: number }[];

  constructor(@Inject(DIALOG_DATA) public data: DialogData,
  public dialogRef: DialogRef,
  private toast: ToastService){
    this.form = new FormGroup({
      quantity: new FormControl('', [Validators.pattern(REGUEX_INT), Validators.required])
    });
    if(data.record !== null && data.record !== undefined){
      this.product = data.record;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  ok(): void {
    const data:number = Number(this.form.controls['quantity'].value);
    this.dialogRef.close(data);
  }
}
