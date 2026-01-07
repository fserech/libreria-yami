import { Component, OnInit } from '@angular/core';
import BaseForm from '../../../../shared/classes/base-form';
import { CrudService } from '../../../../shared/services/crud.service';
import { HeaderComponent } from "../../../../shared/components/header/header.component";
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { matAddLocationAltOutline, matArrowBackOutline, matLocalPhoneOutline, matPersonOutline, matDriveFileRenameOutlineOutline } from '@ng-icons/material-icons/outline';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Branch } from '../../../../shared/interfaces/branch';
import { ToastService } from '../../../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { URL_BRANCHES } from '../../../../shared/constants/endpoints';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { SelectComponent } from "../../../../shared/components/select/select.component";
import { AuthService } from '../../../../shared/services/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgIf, DatePipe } from '@angular/common';
import { REGUX_AFL } from '../../../../shared/constants/reguex';
import { User } from '../../../../shared/interfaces/user-data';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  templateUrl: './branch-form.component.html',
  styleUrl: './branch-form.component.scss',
  viewProviders: [provideIcons({
    matLocalPhoneOutline,
    matArrowBackOutline,
    matAddLocationAltOutline,
    matPersonOutline,
    matDriveFileRenameOutlineOutline
  })],
  imports: [
    HeaderComponent,
    NgIf,
    InputComponent,
    NgIconComponent,
    SelectComponent,
    ReactiveFormsModule,
    DatePipe
  ]
})
export default class BranchFormComponent extends BaseForm implements OnInit {
  form: FormGroup;
  branch: Branch;
  userBranch!: User;
  users: { label: string, value: number }[] = [];

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private bpo: BreakpointObserver
  ) {
    super(crud, toast, auth, bpo);
    this.mode = this.setMode(this.route.snapshot.paramMap.get('mode'));
    if (this.mode !== 'new') this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.crud.baseUrl = URL_BRANCHES;

    if (this.isAdmin()) {
      this.getUsers();
    }

    this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.pattern(REGUX_AFL), Validators.minLength(3)]),
      address: new FormControl('', [Validators.required, Validators.minLength(5)]),
      telephone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]),
      idUser: new FormControl(this.getUserId(), [Validators.required])
    });

    // Deshabilitar campo de usuario si no es admin
    if (!this.isAdmin()) {
      this.form.controls['idUser'].disable();
    }

    this.form.controls['idUser'].setValue(this.getUserId());

    if (this.mode === 'edit') {
      this.loadBranchData();
    }

    if (this.mode === 'view') {
      this.form.disable();
      this.loadBranchData();
    }
  }

  ngOnInit() {}

  isDirty(): boolean {
    return this.form.dirty;
  }

  private async loadBranchData() {
    this.load = true;
    try {
      const branch: Branch = await firstValueFrom(this.crud.getId(this.id));
      this.branch = branch;
      this.form.patchValue({
        name: branch.name,
        address: branch.address,
        telephone: branch.telephone,
        idUser: branch.idUser
      });

      // Si es admin, obtener información del usuario asignado
      if (this.isAdmin() && branch.idUser) {
        this.getUserForBranch(branch.idUser);
      }
    } catch (error: any) {
      console.error('Error al cargar sucursal:', error);
      this.toast.error('Error al cargar los datos de la sucursal');
      this.router.navigate(['dashboard/branches']);
    } finally {
      this.load = false;
    }
  }

  back() {
    if (this.form.dirty && this.mode !== 'view') {
      if (confirm('¿Desea salir sin guardar los cambios?')) {
        this.router.navigate(['dashboard/branches']);
      }
    } else {
      this.router.navigate(['dashboard/branches']);
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.toast.warning('Por favor complete todos los campos requeridos correctamente');
      this.markFormGroupTouched(this.form);
      return;
    }

    this.load = true;
    this.isSaving = true;

    const branch: Branch = {
      id: this.id ? this.id : null,
      name: this.form.controls['name'].value.trim(),
      address: this.form.controls['address'].value.trim(),
      telephone: this.form.controls['telephone'].value,
      idUser: this.isAdmin() ? this.form.controls['idUser'].value : this.getUserId()
    };

    try {
      if (this.mode === 'edit') {
        const response: any = await firstValueFrom(this.crud.updateId(this.id, branch));
        this.toast.success(response.message || 'Sucursal actualizada exitosamente');
      } else if (this.mode === 'new') {
        const response: any = await firstValueFrom(this.crud.save(branch));
        this.toast.success(response.message || 'Sucursal creada exitosamente');
      } else {
        this.toast.info('Está en modo vista');
      }
      this.router.navigate(['dashboard/branches']);
    } catch (error: any) {
      console.error('Error al guardar sucursal:', error);
      this.toast.error(error.error?.message || 'Error al guardar la sucursal');
    } finally {
      this.load = false;
      this.isSaving = false;
    }
  }

  isAdmin(): boolean {
    return this.auth?.getUserData()?.role === 'ROLE_ADMIN';
  }

  getUserId(): number {
    return this.auth?.getUserData()?.id;
  }

 async getUserForBranch(id: number): Promise<void> {
  try {
    const response: any = await firstValueFrom(this.crud.getUserForClients(id));

    // Manejar diferentes estructuras de respuesta
    if (response) {
      if (Array.isArray(response)) {
        this.userBranch = response[0];
      } else if (response.content && Array.isArray(response.content)) {
        this.userBranch = response.content[0];
      } else {
        this.userBranch = response;
      }
    }
  } catch (error: any) {
    console.error('Error al obtener usuario:', error);
    this.toast.error('No se pudo obtener el usuario responsable');
  }
}

  getUsers() {
    this.crud
      .getUsersForClients()
      .then((users: any[]) => {
        if (users && users.length > 0) {
          this.users = users.map((user: { email: string, id_users: number, name: string, role: string }) => ({
            label: `${user.name} - ${user.email}`,
            value: user.id_users
          }));
        }
      })
      .catch((error: any) => {
        console.error('Error al obtener usuarios:', error);
        this.toast.error(error.error?.message || 'Error al cargar usuarios');
      });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get nameControl() {
    return this.form.get('name');
  }

  get addressControl() {
    return this.form.get('address');
  }

  get telephoneControl() {
    return this.form.get('telephone');
  }

  get userControl() {
    return this.form.get('idUser');
  }
}
