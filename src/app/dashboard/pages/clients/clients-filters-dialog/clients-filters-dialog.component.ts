import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DialogData } from '../../../../shared/interfaces/dialog-data';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { REGUEX_INT } from '../../../../shared/constants/reguex';
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
export class ClientsFiltersDialogComponent {

  form: FormGroup;
  load: boolean = false;
  users: { label: string; value: number }[] = [];

  constructor(
    @Inject(DIALOG_DATA) public data: DialogData,
    public dialogRef: DialogRef,
    private auth: AuthService,
    private toast: ToastService,
    private crud: CrudService
  ) {
    this.form = new FormGroup({
      id: new FormControl('', Validators.pattern(REGUEX_INT)),
      name: new FormControl(''),
      idUser: new FormControl('')
    });

    if (this.isAdmin()) {
      this.getUsers();
    }
  }

  filter(): void {
    if (!this.form.valid) {
      this.toast.warning('El formulario es inválido');
      return;
    }

    const filters = {
      id: this.form.controls['id'].value
        ? Number(this.form.controls['id'].value)
        : null,

      name: this.form.controls['name'].value || null,

      idUser: this.form.controls['idUser'].value
        ? Number(this.form.controls['idUser'].value)
        : null
    };

    this.dialogRef.close(filters);
  }

  getUsers(): void {
    this.crud
      .getUsersForClients()
      .then((users: any[]) => {
        this.users = users.map(user => ({
          label: `${user.name} - ${user.email}`,
          value: user.id_users
        }));
      })
      .catch((error: any) => {
        this.toast.error(error?.error?.message || 'Error al cargar usuarios');
      });
  }

  isAdmin(): boolean {
    return this.auth?.getUserData()?.role === 'ROLE_ADMIN';
  }
}
