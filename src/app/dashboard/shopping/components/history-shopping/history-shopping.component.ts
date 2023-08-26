import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Segments } from 'src/app/shared/models/segments';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';


@Component({
  selector: 'app-history-shopping',
  templateUrl: './history-shopping.component.html',
  styleUrls: ['./history-shopping.component.scss'],
})
export class HistoryShoppingComponent  implements OnInit {

  title: string = '';
  form: FormGroup;
  load: boolean;
  segmentSelected = 'day';
  segmentList: Array<Segments> = [
    {name: 'day', label: 'Por Día', icon: 'partly-sunny-outline'},
    {name: 'month', label: 'Por Mes', icon: 'today-outline'},
    {name: 'report', label: 'Reporte', icon: 'document-text-outline'}
  ]


  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private dashboardService: DashboardService,) {
    this.form = this.formBuilder.group({
      date: ['', Validators.required], // Cambia "categoryName" a "name"
    });
  }

  ngOnInit() {}

  submit(){}

  changeDate($event: any){
    console.log('se cambio la fecha: ', $event)
  }


}
