import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DialogData } from '../../../../shared/interfaces/dialog-data';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { REGUEX_DECIMAL_INT, REGUEX_INT } from '../../../../shared/constants/reguex';
import { SelectComponent } from '../../../../shared/components/select/select.component';

@Component({
  selector: 'app-products-filters-dialog',
  standalone: true,
  imports: [FormsModule, InputComponent, SelectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './products-filters-dialog.component.html',
  styleUrl: './products-filters-dialog.component.scss'
})
export class ProductsFiltersDialogComponent {
  form: FormGroup;
  load: boolean = false;

  // Opciones para el filtro de variantes
  variantOptions = [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Con variantes' },
    { value: 'false', label: 'Producto simple' }
  ];

  // Opciones para el filtro de estado
  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' }
  ];

  constructor(@Inject(DIALOG_DATA) public data: DialogData,
              public dialogRef: DialogRef,
              private toast: ToastService) {
    this.form = new FormGroup({
      id: new FormControl('', Validators.pattern(REGUEX_INT)),
      name: new FormControl(''),
      initPrice: new FormControl('', Validators.pattern(REGUEX_DECIMAL_INT)),
      endPrice: new FormControl('', Validators.pattern(REGUEX_DECIMAL_INT)),
      hasVariants: new FormControl(''),
      active: new FormControl('')
    });
  }

 filter() {
  if (this.form.valid) {
    if (this.form.controls['initPrice'].value !== '' && this.form.controls['endPrice'].value !== '' ||
        this.form.controls['initPrice'].value === '' && this.form.controls['endPrice'].value === '') {
      const filters = {
        id: (this.form.controls['id'].value && this.form.controls['id'].value !== '')
          ? Number(this.form.controls['id'].value)
          : null,
        name: (this.form.controls['name'].value && this.form.controls['name'].value !== '')
          ? this.form.controls['name'].value
          : null,
        initPrice: (this.form.controls['initPrice'].value && this.form.controls['initPrice'].value !== '')
          ? parseFloat(this.form.controls['initPrice'].value)
          : null,
        endPrice: (this.form.controls['endPrice'].value && this.form.controls['endPrice'].value !== '')
          ? parseFloat(this.form.controls['endPrice'].value)
          : null,
        hasVariants: (this.form.controls['hasVariants'].value && this.form.controls['hasVariants'].value !== '')
          ? this.form.controls['hasVariants'].value === 'true'
          : null,
        active: (this.form.controls['active'].value && this.form.controls['active'].value !== '')
          ? this.form.controls['active'].value === 'true'
          : null,
        page: 1  // ← Resetear a la primera página
      }
      this.dialogRef.close(filters);
    } else {
      if (this.form.controls['initPrice'].value !== '') {
        this.toast.warning('El precio final es requerido.');
      }
      if (this.form.controls['endPrice'].value !== '') {
        this.toast.warning('El precio inicial es requerido.');
      }
    }
  } else {
    this.toast.warning('El formulario es inválido');
  }
}
}
