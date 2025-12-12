import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ToastService } from '../../../../../shared/services/toast.service';
import { DialogData } from '../../../../../shared/interfaces/dialog-data';
import { REGUEX_INT } from '../../../../../shared/constants/reguex';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ToggleComponent } from '../../../../../shared/components/toggle/toggle.component';
import { matArrowBackOutline } from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-brand-list',
  standalone: true,
  imports: [HeaderComponent,NgIconComponent , InputComponent,ToggleComponent],
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.scss',
  viewProviders: [provideIcons({matArrowBackOutline})]
})
export default class BrandListComponent {
  form: FormGroup;
     load: boolean = false;
      constructor(@Inject(DIALOG_DATA) public data: DialogData,
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
         }
         }else{

           this.toast.warning('El formulario es invalido');
         }
       }

}
