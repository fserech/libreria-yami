import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { DialogData } from '../../../../../shared/interfaces/dialog-data';
import { ToastService } from '../../../../../shared/services/toast.service';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { REGUEX_INT } from '../../../../../shared/constants/reguex';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { Client } from '../../../../../shared/interfaces/client';
import { AuthService } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-orders-client-new-dialog',
  standalone: true,
  imports: [FormsModule, InputComponent, SelectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './orders-client-new-dialog.component.html',
  styleUrl: './orders-client-new-dialog.component.scss'
})
export class OrdersClientNewDialogComponent {

  form: FormGroup;
  load: boolean = false;
  daysOfWeek = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' }
  ];

  constructor(@Inject(DIALOG_DATA) public data: DialogData,
  public dialogRef: DialogRef,
  private toast: ToastService, private auth: AuthService){
    this.form = new FormGroup({
      id: new FormControl('', Validators.pattern(REGUEX_INT)),
      name: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      telephone: new FormControl('',[Validators.pattern(/^\d+$/), Validators.minLength(8), Validators.maxLength(8)]),
      offerDay: new FormControl('', Validators.required),
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  ok(): void {
    const data: Client = {
      name: this.form.controls['name'].value,
      address: (this.form.controls['address'].value !== '')? this.form.controls['address'].value: '',
      telephone: (this.form.controls['telephone'].value !== '') ? this.form.controls['telephone'].value: '',
      offerDay: this.form.controls['offerDay'].value,
      idUser: this.getUserId()
    };

    this.dialogRef.close(data);
  }

  getUserId(): number {
    return this.auth?.getUserData()?.id;
  }
}
