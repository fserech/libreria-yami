import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { SALES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { Sale } from 'src/app/shared/models/sale';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { Segments } from 'src/app/shared/models/segments';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-history-sales',
  templateUrl: './history-sales.component.html',
  styleUrls: ['./history-sales.component.scss'],
})
export class HistorySalesComponent  implements OnInit {

  form: FormGroup;
  sales: Sale[] = [];
  title: string = 'Historial de ventas';
  truncatedUID: string;
  value: Date = new Date();
  date: string = this.value.toISOString();
  segmentSelected = 'day';
  load: boolean = false;
  segmentList: Array<Segments> = [
    {name: 'day', label: 'Por Día', icon: 'partly-sunny-outline'},
    {name: 'month', label: 'Por Mes', icon: 'today-outline'},
    {name: 'report', label: 'Reporte', icon: 'document-text-outline'}
  ];

  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController,
    private modalController: ModalController,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      date: ['', Validators.required]
    });
  }

  ngOnInit() {
    const date = new Date();
    this.getSales(date, date);
  }

  updateSaleStatus(sale: any) {
    // Cambia el estado de la venta
    if (sale.status === 'UNBILLED') {
      sale.status = 'INVOICED';
    } else {
      sale.status = 'UNBILLED';
    }

    // Aquí puedes agregar la lógica para guardar el cambio en tu base de datos o servicio
    // Por ejemplo, puedes emitir una solicitud HTTP a tu servidor para actualizar el estado.

    // Si estás usando Firebase Firestore, puedes hacer algo como esto (asegúrate de importar AngularFire):
    // this.afs.collection('sales').doc(sale.uid).update({ status: sale.status });
  }

  isInvoiceStatus(status: string): boolean {
    return status === 'INVOICED';
  }

  formatDate(timestamp: any): string {
    const date = timestamp ? timestamp.toDate() : null;
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
  }

  handleInput(event: any) {
    const value = event.target.value.toLowerCase();
    this.dashboardService.searchForField(SALES_COLLECTION_NAME, 'nit', value)
    .subscribe((response: any[]) => {
        this.sales = response;
      },
      (error: any) => {
        console.log(error);
      }
      );
  }

  firstCapitalLetter(cadena: string): string {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  }

  changeDate($event: any){
    const value = $event.detail.value;
    const date = new Date(value);
    this.getSales(date, date);
  }

  getSales(dateInit: Date, endDate: Date){
    this.load = true;
    this.sales = [];
    this.dashboardService.getDocumentsByDateRange(SALES_COLLECTION_NAME, dateInit, endDate,'createAt').subscribe({
      next: (res: Sale[]) => {
        this.sales = res;
        this.load = false;
      },
      error: (err: any) => {
        this.load = false;
      },
    })
  }

  dateString(value: string): string{
    const date: Date = new Date(value);

    if (isNaN(date.getTime())) {
      return 'Fecha no válida';
    }
    const day = date.getDate().toString().padStart(2, '0'); // Agrega ceros a la izquierda si es necesario
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const year = date.getFullYear();
    const formattedDate = `${day} de ${this.getMonth(month)} de ${year}`;

    return formattedDate;
  }

  getMonth(value: string): string{
    const month = Number(value);
    let date = '';
    switch (month) {
      case month: 1
        date = 'Enero';
        break;
      case month: 2
        date = 'Febrero';
        break;
      case month: 3
        date = 'Marzo';
        break;
      case month: 4
        date = 'Abril';
        break;
      case month: 5
        date = 'Mayo';
        break;
      case month: 6
        date = 'Junio';
        break;
      case month: 7
        date = 'Julio';
        break;
      case month: 8
        date = 'Agosto';
        break;
      case month: 9
        date = 'Septiembre';
        break;
      case month: 10
        date = 'Octubre';
        break;
      case month: 11
        date = 'Noviembre';
        break;
      case month: 12
        date = 'Diciembre';
        break;
      default:
        date = 'Error';
        break;
    }
    return date;
  }
}
