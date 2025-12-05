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
import { saveAs } from 'file-saver';
import { URL_RECEIPTS } from '../../../../shared/constants/endpoints';

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
  // users: { label: string, value: number }[] = [
  //   { value: -1, label: 'Todos los usuarios'}
  // ];
  panel: { label: string, value: string }[] = [
    // { label: 'Todos los transportes', value: '-1' },
    { label: 'Panel 1', value: 'P1'},
    { label: 'Panel 2', value: 'P2'}
  ];

  constructor(private toast: ToastService, private router: Router,
              private route: ActivatedRoute, private auth: AuthService,
              private service: ReportsReceiptsService){
                this.service.baseUrl = URL_RECEIPTS;
                this.form = new FormGroup({
                  date: new FormControl({ value: '', disabled: false }, [Validators.required]),
                  panel: new FormControl('', [Validators.required]),
                  // user: new FormControl('', [Validators.required])
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
    const panel: string = this.form.controls['panel'].value;
    const date: Date = this.form.controls['date'].value;
    this.service.getReportPanel('CHARGE_PRODUCTS', date, panel).subscribe({
      next: (response: Blob)=> {
        if(response){
          saveAs(response, this.generateDynamicFileName());
          this.isSaving = false;
        }
      },
      error: (error: any) => {
        this.toast.error('Error al Generar Reporte!')
        this.load = false;
        this.isSaving = false;
      },
      complete: () => {
        this.toast.success('Reporte Generados!')
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
    const hours = ('0' + currentDate.getHours()).slice(-2);
    const minutes = ('0' + currentDate.getMinutes()).slice(-2);
    const seconds = ('0' + currentDate.getSeconds()).slice(-2);
    const timestamp = date.getTime();
    const panel: string = this.form.controls['panel'].value;

    return `Reporte_Carga_Productos_${(panel === 'P1')?'Panel_1':'Panel_2'}_${day}${month}${year}_${timestamp}`;
    // return `Reporte_${(panel === 'P1')?'Panel_1':'Panel_2'}_${day}${month}${year}_${hours}:${minutes}:${seconds}_${timestamp}`;
  }

}
