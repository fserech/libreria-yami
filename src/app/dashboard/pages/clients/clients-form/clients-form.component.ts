import { Component, OnInit } from '@angular/core';
import BaseForm from '../../../../shared/classes/base-form';
import { CrudService } from '../../../../shared/services/crud.service';
import { HeaderComponent } from "../../../../shared/components/header/header.component";
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';
import { matAddIcCallOutline, matAddLocationAltOutline, matArrowBackOutline, matLocalPhoneOutline, matTodayOutline } from '@ng-icons/material-icons/outline';
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
  viewProviders: [provideIcons({ matLocalPhoneOutline, matArrowBackOutline ,matAddLocationAltOutline, matAddIcCallOutline, matTodayOutline})],
  imports: [HeaderComponent, NgIf,  InputComponent, NgIconComponent, ToggleComponent, SelectComponent]
})

export default class ClientsFormComponent extends BaseForm implements OnInit {
   form: FormGroup;
   client: Client;
   userClient!: User;
   users: { label: string, value: number }[] = [];


  daysOfWeek = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' }
  ];

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private bpo: BreakpointObserver){
      super(crud, toast, auth, bpo);
      this.mode = this.setMode(this.route.snapshot.paramMap.get('mode'));
      if(this.mode !== 'new') this.id = Number(this.route.snapshot.paramMap.get('id'));
      this.crud.baseUrl = URL_CLIENTS;

      if(this.isAdmin()){
        this.getUsers();
      }

      this.form = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.pattern(REGUX_AFL)]),
        offerDay: new FormControl('', [Validators.required]),
        address: new FormControl('', [Validators.required]),
        telephone: new FormControl('', [
          Validators.pattern(/^\d+$/),
          Validators.minLength(8), Validators.maxLength(8)
        ]),
        idUser: new FormControl(this.getUserId(), [Validators.required])
      });

      // if(this.isAdmin()){
      // }
      this.form.controls['idUser'].setValue(this.getUserId());

      if(this.mode === 'edit'){
        this.load = true;
        firstValueFrom(this.crud.getId(this.id))
        .then((client: Client) => {          
          this.client = client;
          this.form.controls['name'].setValue(client.name);
          this.form.controls['address'].setValue(client.address);
          this.form.controls['telephone'].setValue(client.telephone);
          this.form.controls['offerDay'].setValue(client.offerDay);
          this.form.controls['idUser'].setValue(client.idUser);
        })
        .catch((error: any) => {
          console.log('error id: ', error);
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

  async submit(){
    this.load = true;
    this.isSaving = true;
    const client: Client = {
      id: (this.id) ? this.id : null,
      name: this.form.controls['name'].value,
      offerDay:  this.form.controls['offerDay'].value,
      address: this.form.controls['address'].value,
      telephone: this.form.controls['telephone'].value,
      idUser: (this.isAdmin()) ? this.form.controls['idUser'].value : this.getUserId()
    }

    if(this.mode === 'edit'){
      await firstValueFrom(this.crud.updateId(this.id, client))
            .then((response: any) => {
              this.toast.success(response.message);
              this.load = false;
            })
            .catch((error: any) => {
              this.toast.error(error.message);
              this.load = false;
            })
            .finally(() => {
              this.load = false;
              this.router.navigate(['dashboard/clients']);
            });
    }else if(this.mode === 'new'){
      await firstValueFrom(this.crud.save(client))
            .then((response: any) => {
              this.toast.success('Datos guardados exitosamente.');
              this.load = false;
            })
            .catch((error: any) => {
              this.toast.error(error.error.message);
              this.load = false;
            })
            .finally(() => {
              this.load = false;
              this.router.navigate(['dashboard/clients']);
            });
    }else{
      this.toast.info('Estas en modo vista');
      this.router.navigate(['dashboard/clients']);
    }
  }

  isAdmin(): boolean {
    if(this.auth?.getUserData()?.role === 'ROLE_ADMIN'){
      return true;
    }
    return false;
  }

  async getUserClient(id: number): Promise<any> {
    this.load = true;
    try {
      if (this.mode !== 'new') {
        const user = await firstValueFrom(this.crud.getUserForClients(id));
        return user;
      }
    } catch (error) {
      this.toast.error("error al obtener usuario asignado al cliente");
      return null;
    } finally {
      this.load = false;
    }
    return null;
  }
  
  getUserId(): number{
    return this.auth?.getUserData()?.id;
  }

  getUserForClient(id: number){
    this.getUserClient(id)
    .then((data: any) => {
      this.userClient = data.content[0];
      this.form.controls['idUser'].setValue(this.userClient.name);
    })
    .catch((error: any) => {this.toast.error('no se pudo obtener el vendedor del cliente')})
    .finally(() => {this.load = false; });
  }

  getUsers(){
    this.crud
    .getUsersForClients()
    .then((users: any[]) => {
      if(users.length > 0){
        users.forEach((user: { email: string, id_users: number, name: string, role: string}) => {
          const record = {
            label: user.name + ' - ' + user.email,
            value: user.id_users
          }
          this.users.push(record);
        });
      }

    }).catch((error: any) => {
      this.toast.error(error.error.message);
    });
  }
}
