import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { DialogData } from '../../../../../shared/interfaces/dialog-data';
import { ToastService } from '../../../../../shared/services/toast.service';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { REGUEX_INT } from '../../../../../shared/constants/reguex';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { Supplier } from '../../../../../shared/interfaces/supplier';
import { AuthService } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-purchases-supplier-new-dialog',
  standalone: true,
  imports: [FormsModule, InputComponent, SelectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './purchases-supplier-new-dialog.component.html',
  styleUrl: './purchases-supplier-new-dialog.component.scss'
})
export class PurchasesSupplierNewDialogComponent {
  form: FormGroup;
  load: boolean = false;

  constructor(
    @Inject(DIALOG_DATA) public data: DialogData,
    public dialogRef: DialogRef,
    private toast: ToastService,
    private auth: AuthService
  ){
    this.form = new FormGroup({
      id: new FormControl('', Validators.pattern(REGUEX_INT)),
      supplierName: new FormControl('', Validators.required),
      supplierDesc: new FormControl(''),
      address: new FormControl('', Validators.required),
      phone: new FormControl('', [Validators.pattern(/^\d+$/), Validators.minLength(8), Validators.maxLength(8)]),
      email: new FormControl('', [Validators.email])
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  ok(): void {
    const data: Supplier = {
      supplierName: this.form.controls['supplierName'].value,
      supplierDesc: (this.form.controls['supplierDesc'].value !== '') ? this.form.controls['supplierDesc'].value : '',
      address: (this.form.controls['address'].value !== '') ? this.form.controls['address'].value : '',
      phone: (this.form.controls['phone'].value !== '') ? this.form.controls['phone'].value : '',
      email: (this.form.controls['email'].value !== '') ? this.form.controls['email'].value : '',
      active: true
    };
    this.dialogRef.close(data);
  }

  getUserId(): number {
    return this.auth?.getUserData()?.id;
  }
}
