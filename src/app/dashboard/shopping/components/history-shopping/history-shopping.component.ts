import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
