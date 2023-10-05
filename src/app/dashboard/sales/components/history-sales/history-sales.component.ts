import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController, NavController } from '@ionic/angular';
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
  title: string = 'Historial ventas';
  truncatedUID: string;
  value: Date = new Date();
  date: string = this.value.toISOString();
  segmentSelected = 'day';
  load: boolean = false;
  segmentList: Array<Segments> = [
    {name: 'day', label: 'Por Día', icon: 'partly-sunny-outline'},
    {name: 'month', label: 'Por Mes', icon: 'today-outline'},
    // {name: 'report', label: 'Reporte', icon: 'document-text-outline'}
  ];
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;


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

  monthString(value: string): string{
    const date: Date = new Date(value);

    if (isNaN(date.getTime())) {
      return 'Fecha no válida';
    }
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const year = date.getFullYear();

    const formattedDate = `${this.getMonth(month)} de ${year}`;

    return formattedDate;
  }

  getMonth(value: string): string{
    let date = '';
    switch (value) {
      case '01':
        date = 'Enero';
        break;
      case '02':
        date = 'Febrero';
        break;
      case '03':
        date = 'Marzo';
        break;
      case '04':
        date = 'Abril';
        break;
      case '05':
        date = 'Mayo';
        break;
      case '06':
        date = 'Junio';
        break;
      case '07':
        date = 'Julio';
        break;
      case '08':
        date = 'Agosto';
        break;
      case '09':
        date = 'Septiembre';
        break;
      case '10':
        date = 'Octubre';
        break;
      case '11':
        date = 'Noviembre';
        break;
      case '12':
        date = 'Diciembre';
        break;
      default:
        date = 'Error';
        break;
    }
    return date;
  }

  changeMonth($event: any){
    const value = $event.detail.value;
    const dates = this.getFirstAndLastDayOfMonth(value);
    const firstDate = new Date(dates.firstDate);
    const lastDate = new Date(dates.lastDate);
    this.getSales(firstDate, lastDate);
  }

  getFirstAndLastDayOfMonth(dateString: string): { firstDate: string, lastDate: string } {

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const firstDate = new Date(year, month - 1, 1);
    const firstDateString = this.formatDateMonth(firstDate);
    const lastDate = new Date(year, month, 0);
    const lastDateString = this.formatDateMonth(lastDate);

    return { firstDate: firstDateString, lastDate: lastDateString };
  }

  formatDateMonth(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  changeSegment($event){
    const value = $event.detail.value;
    const date: Date = new Date();
    const dates = this.getFirstAndLastDayOfMonth(date.toISOString());
    const initDate: Date = new Date(dates.firstDate);
    const endDate: Date = new Date(dates.lastDate);

    if(value === 'day')this.getSales(date, date);

    if(value === 'month')this.getSales(initDate, endDate);
  }

  calculateTotalSalesPrice(): number {
    let totalPrice = 0;
  
    if (this.sales && this.sales.length > 0) {
      for (const sale of this.sales) {
        // Verificamos que 'total' sea un número válido antes de sumarlo
        const saleTotal = parseFloat(sale.total);
        if (!isNaN(saleTotal)) {
          totalPrice += saleTotal;
        }
      }
    }
  
    // Devolvemos el precio total como número con dos decimales
    return parseFloat(totalPrice.toFixed(2));
  }
  
  

}
