import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { matArrowBackOutline } from '@ng-icons/material-icons/outline';
import { ReportsReceiptsService } from '../../../../shared/services/reports-receipts.service';
import { CrudService } from '../../../../shared/services/crud.service';
import { saveAs } from 'file-saver';
import { URL_RECEIPTS, URL_USERS } from '../../../../shared/constants/endpoints';

@Component({
  selector: 'app-reports-grid-main',
  standalone: true,
  imports: [HeaderComponent, NgIconComponent, DatePickerComponent, SelectComponent],
  templateUrl: './reports-grid-main.component.html',
  styleUrl: './reports-grid-main.component.scss',
  viewProviders: [ provideIcons({ matArrowBackOutline })]
})
export default class ReportsGridMainComponent {

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
              private crudService: CrudService){
                this.service.baseUrl = URL_RECEIPTS;
                this.crudService.baseUrl = URL_USERS;
                this.form = new FormGroup({
                  date: new FormControl({ value: '', disabled: false }, [Validators.required]),
                  user: new FormControl('', [Validators.required])
                });
              }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.crudService.getUsers().then((response: any) => {
      this.users = [
        { value: -1, label: 'Todos los usuarios' },
        ...response.map((user: any) => ({
          value: user.id_users,
          label: user.name
        }))
      ];
    }).catch((error: any) => {
      console.error('Error al cargar usuarios:', error);
      this.toast.error('Error al cargar usuarios');
    });
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  back(){
    this.router.navigate(['dashboard/products']);
  }

  submit(){
    this.load = true;
    this.isSaving = true;
    const userId: number = this.form.controls['user'].value;
    const date: Date = this.form.controls['date'].value;

    // Si userId es -1 (Todos los usuarios), usar método sin id_user
    const request$ = userId === -1
      ? this.service.getReportAllUsers('CHARGE_PRODUCTS', date)
      : this.service.getReceipt('CHARGE_PRODUCTS', userId, date);

    request$.subscribe({
      next: (response: Blob)=> {
        if(response){
          saveAs(response, this.generateDynamicFileName());
          this.isSaving = false;
        }
      },
      error: (error: any) => {
        console.error('Error al generar reporte:', error);
        this.toast.error('Error al Generar Reporte!')
        this.load = false;
        this.isSaving = false;
      },
      complete: () => {
        this.toast.success('Reporte Generado!')
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
    const monthIndex = currentDate.getMonth();
    const month = months[monthIndex];
    const year = currentDate.getFullYear();
    const timestamp = date.getTime();
    const userId: number = this.form.controls['user'].value;

    const userLabel = this.users.find(u => u.value === userId)?.label || 'Usuario';
    const userFileName = userId === -1 ? 'Todos_Usuarios' : userLabel.replace(/\s+/g, '_');

    return `Reporte_Carga_Productos_${userFileName}_${day}${month}${year}_${timestamp}`;
  }

}
