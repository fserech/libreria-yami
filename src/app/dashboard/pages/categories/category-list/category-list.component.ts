import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ToastService } from '../../../../shared/services/toast.service';
import { DialogData } from '../../../../shared/interfaces/dialog-data';
import { REGUEX_DECIMAL_INT, REGUEX_INT } from '../../../../shared/constants/reguex';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export default class CategoryListComponent {
    form: FormGroup;
    load: boolean = false;
     constructor(
      @Inject(DIALOG_DATA) public data: DialogData,
                  public dialogRef: DialogRef,
                  private toast: ToastService) {
        this.form = new FormGroup({
          id: new FormControl('', Validators.pattern(REGUEX_INT)),
          name: new FormControl(''),
          initPrice: new FormControl('', Validators.pattern(REGUEX_DECIMAL_INT)),
          endPrice: new FormControl('', Validators.pattern(REGUEX_DECIMAL_INT)),
          active: new FormControl('')
        });
      }

      filter(){
        if(this.form.valid){
          if(this.form.controls['initPrice'].value !== '' && this.form.controls['endPrice'].value !== '' ||
           this.form.controls['initPrice'].value === '' && this.form.controls['endPrice'].value === ''){
          const filters = {
            id: (this.form.controls['id'].value && this.form.controls['id'].value !== '') ? Number(this.form.controls['id'].value) : null,
            name: (this.form.controls['name'].value && this.form.controls['name'].value !== '') ? this.form.controls['name'].value : null,
            initPrice: (this.form.controls['initPrice'].value && this.form.controls['initPrice'].value !== '') ? parseFloat(this.form.controls['initPrice'].value) : null,
            endPrice: (this.form.controls['endPrice'].value && this.form.controls['endPrice'].value !== '') ? parseFloat(this.form.controls['endPrice'].value) : null,
            active: (this.form.controls['active'].value && this.form.controls['active'].value !== '') ? this.form.controls['active'].value : null,
          }
          this.dialogRef.close(filters);
        } else {

          if(this.form.controls['initPrice'].value !== ''){
            this.toast.warning('El precio de final es requerido.');
          }
          if(this.form.controls['endPrice'].value !== ''){
            this.toast.warning('El precio inicial es requerido.');
          }
        }
        }else{

          this.toast.warning('El formulario es invalido');
        }
      }


}
