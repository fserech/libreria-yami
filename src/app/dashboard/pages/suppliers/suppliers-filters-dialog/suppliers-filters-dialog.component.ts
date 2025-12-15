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
  selector: 'app-suppliers-filters-dialogt',
  standalone: true,
  imports: [HeaderComponent, NgIconComponent, InputComponent, ToggleComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './suppliers-filters-dialog.component.html',
  styleUrl: './suppliers-filters-dialog.component.scss'
})
export class SuppliersFiltersDialogComponent {
  form: FormGroup;
  load: boolean = false;

  constructor(
    @Inject(DIALOG_DATA) public data: DialogData,
    public dialogRef: DialogRef,
    private toast: ToastService
  ) {
    this.form = new FormGroup({
      id: new FormControl('', Validators.pattern(REGUEX_INT)),
      name: new FormControl(''),
      email: new FormControl('', [Validators.email]),
      phone: new FormControl(''),
      active: new FormControl('')
    });
  }

  filter() {
    if (this.form.valid) {
      const filters = {
        id: (this.form.controls['id'].value && this.form.controls['id'].value !== '') ? Number(this.form.controls['id'].value) : null,
        name: (this.form.controls['name'].value && this.form.controls['name'].value !== '') ? this.form.controls['name'].value : null,
        email: (this.form.controls['email'].value && this.form.controls['email'].value !== '') ? this.form.controls['email'].value : null,
        phone: (this.form.controls['phone'].value && this.form.controls['phone'].value !== '') ? this.form.controls['phone'].value : null,
        active: (this.form.controls['active'].value && this.form.controls['active'].value !== '') ? this.form.controls['active'].value : null,
      }
      this.dialogRef.close(filters);
    } else {
      this.toast.warning('El formulario es invalido');
    }
  }
}
