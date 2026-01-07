import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DialogData } from '../../../../shared/interfaces/dialog-data';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ToastService } from '../../../../shared/services/toast.service';
import { REGUEX_DECIMAL_INT, REGUEX_INT } from '../../../../shared/constants/reguex';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { MIN_DATE, MAX_DATE } from '../../../../shared/constants/date-min-max';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { AuthService } from '../../../../shared/services/auth.service';
import { CrudService } from '../../../../shared/services/crud.service';
import { URL_USERS } from '../../../../shared/constants/endpoints';

@Component({
  selector: 'app-purchases-filter-dialog',
  standalone: true,
  imports: [FormsModule, InputComponent, SelectComponent, DatePickerComponent],
  templateUrl: './purchases-filter-dialog.component.html',
  styleUrl: './purchases-filter-dialog.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PurchasesFilterDialogComponent {

  form: FormGroup;
  load: boolean = false;
  minDate: Date = MIN_DATE;
  maxDate: Date = MAX_DATE;
  maxDateDeliver: Date = this.getFutureDate(60); // 60 días para compras
  statusList: { value: string, label: string}[] = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'RECEIVED', label: 'Recibida' },
    { value: 'COMPLETED', label: 'Completada' },
    { value: 'CANCELLED', label: 'Anulada' }
  ];

  users: { label: string, value: number }[] = [];

  constructor(@Inject(DIALOG_DATA) public data: DialogData,
              public dialogRef: DialogRef, public authService: AuthService,
              private toast: ToastService, private crud: CrudService) {

    this.form = new FormGroup({
      id: new FormControl('', Validators.pattern(REGUEX_INT)),
      userId: new FormControl('', []),
      supplierId: new FormControl('', []),
      status: new FormControl('', []),
      idBranch: new FormControl('', []),
      dateCreated: new FormControl('', []),
      deliveryDate: new FormControl('', []),
    });
    this.crud.baseUrl = URL_USERS;

    if(this.authService?.getUserData()?.role === 'ROLE_ADMIN'){
      this.crud.getUsers()
      .then((users: any[]) => {
        if(users.length > 0){
          users.forEach((user: { email: string, id_users: number, name: string, role: string}) => {
            const record = {
              label: user.name + ' - ' + user.email,
              value: user.id_users
            }
            this.users.push(record);
          });
        }

      }).catch((error: any) => {
        this.toast.error(error.error.message);
      });
    }
  }

  filter(){
    const filters: { id: number, userId: number, supplierId: number, status: string, idBranch: number,
      dateCreatedInit: Date, dateCreatedEnd: Date, deliveryDateInit: Date, deliveryDateEnd: Date} = {
      id: (this.form.controls['id'].value && this.form.controls['id'].value !== '') ? Number(this.form.controls['id'].value) : null,
      userId: (this.form.controls['userId'].value && this.form.controls['userId'].value !== '') ? Number(this.form.controls['userId'].value) : null,
      supplierId: (this.form.controls['supplierId'].value && this.form.controls['supplierId'].value !== '') ? Number(this.form.controls['supplierId'].value) : null,
      status: (this.form.controls['status'].value && this.form.controls['status'].value !== '') ? this.form.controls['status'].value : null,
      idBranch: (this.form.controls['idBranch'].value && this.form.controls['idBranch'].value !== '') ? Number(this.form.controls['idBranch'].value) : null,
      dateCreatedInit: (this.form.controls['dateCreated'].value && this.form.controls['dateCreated'].value !== '') ? new Date(this.form.controls['dateCreated'].value) : null,
      dateCreatedEnd: (this.form.controls['dateCreated'].value && this.form.controls['dateCreated'].value !== '') ? new Date(this.form.controls['dateCreated'].value ) : null,
      deliveryDateInit: (this.form.controls['deliveryDate'].value && this.form.controls['deliveryDate'].value !== '') ? new Date(this.form.controls['deliveryDate'].value) : null,
      deliveryDateEnd: (this.form.controls['deliveryDate'].value && this.form.controls['deliveryDate'].value !== '') ? new Date(this.form.controls['deliveryDate'].value) : null,
    }
    this.dialogRef.close(filters);
  }

  getFutureDate(daysToAdd: number): Date {
    const today: Date = new Date();
    const futureDate: Date = new Date(today);
    futureDate.setDate(today.getDate() + daysToAdd);
    return futureDate;
  }


}
