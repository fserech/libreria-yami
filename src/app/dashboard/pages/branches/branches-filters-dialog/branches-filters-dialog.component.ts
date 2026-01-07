import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogData } from '../../../../shared/interfaces/dialog-data';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { REGUEX_INT } from '../../../../shared/constants/reguex';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { CrudService } from '../../../../shared/services/crud.service';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-branches-filters-dialog',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, InputComponent, SelectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './branches-filters-dialog.component.html',
  styleUrl: './branches-filters-dialog.component.scss'
})
export class BranchesFiltersDialogComponent implements OnInit {
  form: FormGroup;
  load: boolean = false;
  users: { label: string, value: number }[] = [];

  constructor(
    @Inject(DIALOG_DATA) public data: DialogData,
    public dialogRef: DialogRef,
    private auth: AuthService,
    private toast: ToastService,
    private crud: CrudService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.getUsers();
    }
  }

  private initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', [Validators.pattern(REGUEX_INT), Validators.min(1)]),
      name: new FormControl('', [Validators.minLength(2), Validators.maxLength(60)]),
      idUser: new FormControl('')
    });
  }

  filter(): void {
    // Validar que al menos un filtro esté completado
    const hasFilters = this.form.controls['id'].value ||
                       this.form.controls['name'].value ||
                       this.form.controls['idUser'].value;

    if (!hasFilters) {
      this.toast.warning('Debe ingresar al menos un criterio de búsqueda');
      return;
    }

    if (this.form.invalid) {
      this.toast.warning('Por favor corrija los errores en el formulario');
      this.markFormGroupTouched(this.form);
      return;
    }

    const filters = {
      id: this.getFilterValue('id'),
      name: this.getFilterValue('name'),
      idUser: this.getFilterValue('idUser')
    };

    // Verificar que al menos un filtro tenga valor
    const hasValidFilters = Object.values(filters).some(value => value !== null);

    if (!hasValidFilters) {
      this.toast.warning('Debe ingresar al menos un criterio de búsqueda válido');
      return;
    }

    this.dialogRef.close(filters);
  }

  private getFilterValue(controlName: string): any {
    const value = this.form.controls[controlName].value;
    if (!value || value === '') return null;

    if (controlName === 'id' || controlName === 'idUser') {
      return Number(value);
    }

    return String(value).trim();
  }

  clearFilters(): void {
    this.form.reset();
    this.toast.info('Filtros limpiados');
  }

  close(): void {
    this.dialogRef.close();
  }

  getUsers(): void {
    this.load = true;
    this.crud
      .getUsersForClients()
      .then((users: any[]) => {
        if (users && users.length > 0) {
          this.users = users.map((user: {
            email: string,
            id_users: number,
            name: string,
            role: string
          }) => ({
            label: `${user.name} - ${user.email}`,
            value: user.id_users
          }));
        } else {
          this.toast.info('No hay usuarios disponibles');
        }
      })
      .catch((error: any) => {
        console.error('Error al obtener usuarios:', error);
        this.toast.error(error.error?.message || 'Error al cargar usuarios');
      })
      .finally(() => {
        this.load = false;
      });
  }

  isAdmin(): boolean {
    return this.auth?.getUserData()?.role === 'ROLE_ADMIN';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get hasActiveFilters(): boolean {
    return !!(this.form.controls['id'].value ||
              this.form.controls['name'].value ||
              this.form.controls['idUser'].value);
  }
}
