import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonInfiniteScroll, ModalController, NavController } from '@ionic/angular';
import { SHOPPING_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { MONTHS } from 'src/app/shared/constants/months-year';
import { Month } from 'src/app/shared/models/month';
import { Segments } from 'src/app/shared/models/segments';
import { Shopping } from 'src/app/shared/models/shopping';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';


@Component({
  selector: 'app-history-shopping',
  templateUrl: './history-shopping.component.html',
  styleUrls: ['./history-shopping.component.scss'],
})
export class HistoryShoppingComponent  implements OnInit {

  form: FormGroup;
  shopping: Shopping[] = [];
  title: string = 'Historial Compras';
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

  monthsYear: Month[] = MONTHS;


  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController,
    private modalController: ModalController,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,) {
    this.form = this.formBuilder.group({
      date: ['', Validators.required], // Cambia "categoryName" a "name"
    });
  }

  ngOnInit() {
    const date = new Date();
    this.getShopping(date, date);
  }
  

  submit(){}

  changeDate($event: any){
    console.log('se cambio la fecha: ', $event)
  }
  isInvoiceStatus(status: string): boolean {
    return status === 'INVOICED';
  }
  formatDate(timestamp: any): string {
    const date = timestamp ? timestamp.toDate() : null;
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
  }
  updateSaleStatus(shopp: any) {
    // Cambia el estado de la venta
    if (shopp.status === 'UNBILLED') {
      shopp.status = 'INVOICED';
    } else {
      shopp.status = 'UNBILLED';
    }

    // Aquí puedes agregar la lógica para guardar el cambio en tu base de datos o servicio
    // Por ejemplo, puedes emitir una solicitud HTTP a tu servidor para actualizar el estado.

    // Si estás usando Firebase Firestore, puedes hacer algo como esto (asegúrate de importar AngularFire):
    // this.afs.collection('sales').doc(sale.uid).update({ status: sale.status });
  }

  handleInput(event: any) {
    const value = event.target.value.toLowerCase();
    this.dashboardService.searchForField(SHOPPING_COLLECTION_NAME, 'nit', value)
    .subscribe((response: any[]) => {
        this.shopping = response;
      },
      (error: any) => {
        console.log(error);
      }
      );
  }
  firstCapitalLetter(cadena: string): string {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  }
  getShopping(dateInit: Date, endDate: Date){
    this.load = true;
    this.shopping = [];
    this.dashboardService.getDocumentsByDateRange(SHOPPING_COLLECTION_NAME, dateInit, endDate,'createAt').subscribe({
      next: (res: Shopping[]) => {
        this.shopping = res;
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
    this.getShopping(firstDate, lastDate);
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

    if(value === 'day')this.getShopping(date, date);

    if(value === 'month')this.getShopping(initDate, endDate);
  }
  calculateTotalShoppingPrice(): number {
    let totalPrice = 0;
  
    if (this.shopping && this.shopping.length > 0) {
      for (const sale of this.shopping) {
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
