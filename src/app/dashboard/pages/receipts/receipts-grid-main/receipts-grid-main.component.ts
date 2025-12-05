import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { AuthService } from '../../../../shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matArrowBackOutline } from '@ng-icons/material-icons/outline';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { ReportsReceiptsService } from '../../../../shared/services/reports-receipts.service';
import { URL_RECEIPTS, URL_USERS } from '../../../../shared/constants/endpoints';
import { saveAs } from 'file-saver';
import { CrudService } from '../../../../shared/services/crud.service';

@Component({
  selector: 'app-receipts-grid-main',
  standalone: true,
  imports: [HeaderComponent, NgIconComponent, DatePickerComponent, SelectComponent],
  templateUrl: './receipts-grid-main.component.html',
  styleUrl: './receipts-grid-main.component.scss',
  viewProviders: [ provideIcons({ matArrowBackOutline })]
})
export default class ReceiptsGridMainComponent implements OnInit {

  load: boolean = false;
  isSaving = false;
  form: FormGroup;
  minDate: Date = new Date(2024, 3, 1);
  maxDate: Date = new Date();
  users: { label: string, value: number }[] = [
    { value: -1, label: 'Todos los usuarios'}
  ];

  constructor(private toast: ToastService, private router: Router,
              private route: ActivatedRoute, private auth: AuthService,
              private service: ReportsReceiptsService,
              private crud: CrudService){
                this.service.baseUrl = URL_RECEIPTS;
                this.crud.baseUrl = URL_USERS;

                this.form = new FormGroup({
                  date: new FormControl({ value: '', disabled: false }, [Validators.required]),
                  user: new FormControl('', [Validators.required])
                });

                this.crud.getUsers()
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

  ngOnInit(): void {}

  isDirty(): boolean {
    return this.form.dirty;
  }

  back(){
    this.router.navigate(['dashboard/products']);
  }

  submit(){
    this.load = true;
    this.isSaving = true;
    const id_user: number = this.form.controls['user'].value;
    const date: Date = this.form.controls['date'].value;
    this.service.getReceipt('RECEIPTS', id_user, date).subscribe({
      next: (response: Blob)=> {
        if(response){
          saveAs(response, this.generateDynamicFileName());
          this.isSaving = false;
        }
      },
      error: (error: any) => {
        this.toast.error('Error al Generar Recibos!')
        this.load = false;
        this.isSaving = false;
      },
      complete: () => {
        this.toast.success('Recibos Generados!')
        this.load = false;
        this.form.reset();
        this.isSaving = false;
      }
    });
  }

  generateDynamicFileName(): string {
    const currentDate = new Date(this.form.controls['date'].value);
    const date = new Date();
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const day = ('0' + currentDate.getDate()).slice(-2);
    // const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
    const monthIndex = currentDate.getMonth();
    const month = months[monthIndex];
    const year = currentDate.getFullYear();
    const hours = ('0' + currentDate.getHours()).slice(-2);
    const minutes = ('0' + currentDate.getMinutes()).slice(-2);
    const seconds = ('0' + currentDate.getSeconds()).slice(-2);
    const timestamp = date.getTime();

    return `Recibos_${day}${month}${year}_${timestamp}`;
    // return `Recibos_${day}${month}${year}_${hours}:${minutes}:${seconds}_${timestamp}`;
  }

}
