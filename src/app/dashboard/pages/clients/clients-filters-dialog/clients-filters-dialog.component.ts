import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DialogData } from '../../../../shared/interfaces/dialog-data';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { REGUEX_DECIMAL_INT, REGUEX_INT } from '../../../../shared/constants/reguex';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { CrudService } from '../../../../shared/services/crud.service';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-clients-filters-dialog',
  standalone: true,
  imports: [FormsModule, InputComponent, SelectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './clients-filters-dialog.component.html',
  styleUrl: './clients-filters-dialog.component.scss'
})
export class ClientsFiltersDialogComponent{

  form: FormGroup;
  load: boolean = false;
  users: { label: string, value: number }[] = [];
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
              public dialogRef: DialogRef, private auth: AuthService,
              private toast: ToastService, private crud: CrudService,) {
    this.form = new FormGroup({
      id: new FormControl('', Validators.pattern(REGUEX_INT)),
      name: new FormControl(''),
      // address: new FormControl(''),
      // telephone: new FormControl('', Validators.pattern(REGUEX_DECIMAL_INT)),
      offerDay: new FormControl(''),
      idUser: new FormControl('')
    });
    if(this.isAdmin()){
      this.getUsers();
    }
  }

  filter(){
    if(this.form.valid){
      if(this.form.controls['offerDay'].value !== '' && this.form.controls['offerDay'].value !== '' ||
       this.form.controls['offerDay'].value === '' && this.form.controls['offerDay'].value === ''){
      const filters = {
        id: (this.form.controls['id'].value && this.form.controls['id'].value !== '') ? Number(this.form.controls['id'].value) : null,
        name: (this.form.controls['name'].value && this.form.controls['name'].value !== '') ? this.form.controls['name'].value : null,
        offerDay: (this.form.controls['offerDay'].value && this.form.controls['offerDay'].value !== '') ? this.form.controls['offerDay'].value : null,
        idUser: (this.form.controls['idUser'].value && this.form.controls['idUser'].value !== '') ? this.form.controls['idUser'].value : null,
      }
      this.dialogRef.close(filters);
    } else {

      if(this.form.controls['offerDay'].value !== ''){
        this.toast.warning('dia asignado requerido');
      }
      if(this.form.controls['offerDay'].value !== ''){
        this.toast.warning('dia asignado requerido');
      }
    }
    }else{

      this.toast.warning('El formulario es invalido');
    }
  }

  getUsers(){
    this.crud
    .getUsersForClients()
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

  isAdmin(): boolean {
    if(this.auth?.getUserData()?.role === 'ROLE_ADMIN'){
      return true;
    }
    return false;
  }
}
