import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DialogData } from '../../../../shared/interfaces/dialog-data';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { REGUEX_DECIMAL_INT, REGUEX_INT } from '../../../../shared/constants/reguex';

@Component({
  selector: 'app-users-filters-dialog',
  standalone: true,
  imports: [FormsModule, InputComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './users-filters-dialog.component.html',
  styleUrl: './users-filters-dialog.component.scss'
})
export class UsersFiltersDialogComponent{

  form: FormGroup;
  load: boolean = false;

  constructor(@Inject(DIALOG_DATA) public data: DialogData,
              public dialogRef: DialogRef,
              private toast: ToastService) {
    this.form = new FormGroup({
      id: new FormControl('', Validators.pattern(REGUEX_INT)),
      name: new FormControl(''),
      email: new FormControl(''),
      
     
    });
  }

  filter(){
    if(this.form.valid){
      if(this.form.controls['email'].value !== '' && this.form.controls['email'].value !== '' ||
       this.form.controls['email'].value === '' && this.form.controls['email'].value === ''){
      const filters = {
        id: (this.form.controls['id'].value && this.form.controls['id'].value !== '') ? Number(this.form.controls['id'].value) : null,
        name: (this.form.controls['name'].value && this.form.controls['name'].value !== '') ? this.form.controls['name'].value : null,
        // address: (this.form.controls['address'].value && this.form.controls['address'].value !== '') ? this.form.controls['address'].value : null,
        // telepnone: (this.form.controls['telephone'].value && this.form.controls['telephone'].value !== '') ? this.form.controls['telephone'].value : null,
        email: (this.form.controls['email'].value && this.form.controls['email'].value !== '') ? this.form.controls['email'].value : null,

      }
      this.dialogRef.close(filters);
    } else {

      if(this.form.controls['email'].value !== ''){
        this.toast.warning('email asignado requerido');
      }
      if(this.form.controls['email'].value !== ''){
        this.toast.warning('email asignado requerido');
      }
    }
    }else{

      this.toast.warning('El formulario es invalido');
    }
  }
}

