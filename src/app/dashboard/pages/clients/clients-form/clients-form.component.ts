import { Component, OnInit } from '@angular/core';
import BaseForm from '../../../../shared/classes/base-form';
import { CrudService } from '../../../../shared/services/crud.service';
import { HeaderComponent } from "../../../../shared/components/header/header.component";
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { matAddIcCallOutline, matAddLocationAltOutline, matArrowBackOutline, matPersonOutline } from '@ng-icons/material-icons/outline';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Client } from '../../../../shared/interfaces/client';
import { ToastService } from '../../../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { URL_CLIENTS } from '../../../../shared/constants/endpoints';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { SelectComponent } from "../../../../shared/components/select/select.component";
import { AuthService } from '../../../../shared/services/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgIf } from '@angular/common';
import { REGUX_AFL } from '../../../../shared/constants/reguex';
import { User } from '../../../../shared/interfaces/user-data';

@Component({
  selector: 'app-clients-form',
  standalone: true,
  templateUrl: './clients-form.component.html',
  styleUrl: './clients-form.component.scss',
  viewProviders: [provideIcons({ matArrowBackOutline, matAddLocationAltOutline, matAddIcCallOutline, matPersonOutline })],
  imports: [HeaderComponent, NgIf, InputComponent, NgIconComponent, SelectComponent]
})
export default class ClientsFormComponent extends BaseForm implements OnInit {
  form: FormGroup;
  client: Client;
  userClient!: User;
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
    this.crud.baseUrl = URL_CLIENTS;

    if (this.isAdmin()) {
      this.getUsers();
    }

    this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.pattern(REGUX_AFL)]),
      address: new FormControl('', [Validators.required]),
      telephone: new FormControl('', [
        Validators.pattern(/^\d+$/),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]),
      idUser: new FormControl(this.getUserId(), [Validators.required])
    });

    this.form.controls['idUser'].setValue(this.getUserId());

    if (this.mode === 'edit') {
      this.load = true;
      firstValueFrom(this.crud.getId(this.id))
        .then((client: Client) => {
          this.client = client;
          this.form.controls['name'].setValue(client.name);
          this.form.controls['address'].setValue(client.address);
          this.form.controls['telephone'].setValue(client.telephone);
          this.form.controls['idUser'].setValue(client.idUser);
        })
        .catch((error: any) => {

          this.toast.error('Error al cargar los datos del cliente');
        })
        .finally(() => {
          this.load = false;
        });
    }
  }

  ngOnInit() {}

  isDirty(): boolean {
    return this.form.dirty;
  }

  back() {
    this.router.navigate(['dashboard/clients']);
  }

  async submit() {
    this.load = true;
    this.isSaving = true;
    const client: Client = {
      id: (this.id) ? this.id : null,
      name: this.form.controls['name'].value,
      address: this.form.controls['address'].value,
      telephone: this.form.controls['telephone'].value,
      idUser: (this.isAdmin()) ? this.form.controls['idUser'].value : this.getUserId()
    }

    if (this.mode === 'edit') {
      await firstValueFrom(this.crud.updateId(this.id, client))
        .then((response: any) => {
          this.toast.success(response.message || 'Cliente actualizado exitosamente');
          this.load = false;
        })
        .catch((error: any) => {
          this.toast.error(error.error?.message || 'Error al actualizar el cliente');
          this.load = false;
        })
        .finally(() => {
          this.load = false;
          this.router.navigate(['dashboard/clients']);
        });
    } else if (this.mode === 'new') {
      await firstValueFrom(this.crud.save(client))
        .then((response: any) => {
          this.toast.success('Cliente guardado exitosamente');
          this.load = false;
        })
        .catch((error: any) => {
          this.toast.error(error.error?.message || 'Error al guardar el cliente');
          this.load = false;
        })
        .finally(() => {
          this.load = false;
          this.router.navigate(['dashboard/clients']);
        });
    } else {
      this.toast.info('Estás en modo vista');
      this.router.navigate(['dashboard/clients']);
    }
  }

  isAdmin(): boolean {
    return this.auth?.getUserData()?.role === 'ROLE_ADMIN';
  }

  async getUserClient(id: number): Promise<any> {
    this.load = true;
    try {
      if (this.mode !== 'new') {
        const user = await firstValueFrom(this.crud.getUserForClients(id));
        return user;
      }
    } catch (error) {
      this.toast.error("Error al obtener usuario asignado al cliente");
      return null;
    } finally {
      this.load = false;
    }
    return null;
  }

  getUserId(): number {
    return this.auth?.getUserData()?.id;
  }

  getUserForClient(id: number) {
    this.getUserClient(id)
      .then((data: any) => {
        this.userClient = data.content[0];
        this.form.controls['idUser'].setValue(this.userClient.name);
      })
      .catch((error: any) => {
        this.toast.error('No se pudo obtener el vendedor del cliente')
      })
      .finally(() => {
        this.load = false;
      });
  }

  getUsers() {
    this.crud
      .getUsersForClients()
      .then((users: any[]) => {
        if (users.length > 0) {
          users.forEach((user: { email: string, id_users: number, name: string, role: string }) => {
            const record = {
              label: user.name + ' - ' + user.email,
              value: user.id_users
            }
            this.users.push(record);
          });
        }
      })
      .catch((error: any) => {
        this.toast.error(error.error?.message || 'Error al cargar usuarios');
      });
  }
}
