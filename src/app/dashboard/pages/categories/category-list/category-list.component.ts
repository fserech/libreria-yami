import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ToastService } from '../../../../shared/services/toast.service';
import { DialogData } from '../../../../shared/interfaces/dialog-data';
import { REGUEX_INT } from '../../../../shared/constants/reguex';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';
import { NgIconComponent } from '@ng-icons/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [HeaderComponent,NgIconComponent , InputComponent,ToggleComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent {
    form: FormGroup;
    load: boolean = false;
     constructor(
      @Inject(DIALOG_DATA) public data: DialogData,
                  public dialogRef: DialogRef,
                  private toast: ToastService) {
        this.form = new FormGroup({
          id: new FormControl('', Validators.pattern(REGUEX_INT)),
          name: new FormControl(''),
          active: new FormControl('')
        });
      }

      filter(){
        if(this.form.valid){
          {
          const filters = {
            id: (this.form.controls['id'].value && this.form.controls['id'].value !== '') ? Number(this.form.controls['id'].value) : null,
            name: (this.form.controls['name'].value && this.form.controls['name'].value !== '') ? this.form.controls['name'].value : null,
            active: (this.form.controls['active'].value && this.form.controls['active'].value !== '') ? this.form.controls['active'].value : null,
          }
          this.dialogRef.close(filters);
        } {

          this.toast.warning('El formulario es invalido');
        }
      }


}
}
