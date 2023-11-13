import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonInfiniteScroll, IonModal, ModalController, NavController } from '@ionic/angular';
import {  PRODUCTS_COLLECTION_NAME, SHOPPING_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { Segments } from 'src/app/shared/models/segments';
import { DetailsShopping, Shopping } from 'src/app/shared/models/shopping';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';
import { OverlayEventDetail } from '@ionic/core/components';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/shared/models/product';
import { MESSAGES_APP } from 'src/app/shared/constants/messages-app';

@Component({
  selector: 'app-history-shopping',
  templateUrl: './history-shopping.component.html',
  styleUrls: ['./history-shopping.component.scss'],
})
export class HistoryShoppingComponent  implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  form: FormGroup;
  shopping: Shopping[] = [];
  title: string = 'Historial de compras'; // Ajusta el título según sea necesario
  truncatedUID: string;
  copied: boolean = false;
  shopp:  any;
  value: Date = new Date();
  date: string = this.value.toISOString();
  segmentSelected = 'day' ;
  load: boolean = false;
  formProduct: FormGroup;
  DetailsShopping: DetailsShopping[] = [];
  products: Product[] = [];;
  segmentList: Array<Segments> = [ // Asegúrate de ajustar el tipo de datos de 'segmentList' según tus necesidades
    { name: 'day', label: 'Por Día', icon: 'partly-sunny-outline' },
    { name: 'month', label: 'Por Mes', icon: 'today-outline' }
  ];
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(
    private dashboardService: DashboardService, // Asegúrate de importar 'DashboardService'
    private navCtrl: NavController,
    private modalController: ModalController,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
     private route: ActivatedRoute,
    private router: Router
    
  ) {
    this.form = this.formBuilder.group({
        date: ['', Validators.required],
      }); 
      this.formProduct = this.formBuilder.group({
        priceSale: ['', []],
      });
  }
  
  ngOnInit() {
    const date = new Date();
    this.getShopping(date, date);
  }

  formatDate(timestamp: any): string {
    const date = timestamp ? timestamp.toDate() : null;
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
  }

  changeDate($event: any){
    const value = $event.detail.value;
    const date = new Date(value);
    this.getShopping(date, date);
  }

  getShopping(dateInit: Date, endDate: Date){
    this.load = true;
    this.shopping = [];
  
    this.dashboardService.getDocumentsByDateRange(SHOPPING_COLLECTION_NAME, dateInit, endDate, 'createAt').subscribe({
      next: (shopping: Shopping[]) => {
        this.shopping = shopping;
        this.load = false;
      },
      error: (err: any) => {
        this.load = false;
      },
    });
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

  monthString(value: string): string {
    const date = new Date(value);
  
    if (!isNaN(date.getTime())) {
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
      const year = date.getFullYear();
  
      const formattedDate = `${this.getMonth(month)} de ${year}`;
      return formattedDate;
    } else {
      return 'Fecha no válida';
    }
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
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Fecha no válida';
    }
  
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
  

  changeSegment($event) {
    const value = $event.detail.value;
    const date: Date = new Date();
    const dates = this.getFirstAndLastDayOfMonth(date.toISOString());
    const initDate: Date = new Date(dates.firstDate);
    const endDate: Date = new Date(dates.lastDate);
  
    if (value === 'day') {
      this.getShopping(date, date);
    }
  
    if (value === 'month') {
      this.getShopping(initDate, endDate);
    }
  }
  

  calculateTotalShoppingPrice(): number {
    let totalPrice = 0;

    if (this.shopping && this.shopping.length > 0) {
      for (const shop of this.shopping) {
        const shopTotal = parseFloat(shop.total);
        if (!isNaN(shopTotal)) {
          totalPrice += shopTotal;
        }
      }
    }

    return parseFloat(totalPrice.toFixed(2));
  }

  copyToClipboard(text: string | undefined) {
    if (text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.copied = true;
      this.toastService.success('Se copió el UID del registro');
      setTimeout(() => {
        this.copied = false;
      }, 1000);
    }
  }
 
  async finalizeShopping() {
    const shopping = this.shopping.find((element: any) => element.status === 'PENDING');
    if (shopping) {
      const shoppingUid = shopping.uid;
      await this.dashboardService.udpateDocument(shoppingUid, SHOPPING_COLLECTION_NAME, { status: 'FINALIZED' });
      const updatePromises: Promise<any>[] = [];
      const updateStockPromises: Promise<any>[] = [];
      for (const product of shopping.products) {
        const productUid = product.productUid;
        const productQuantity = parseFloat(product.quantity);
        const productFb = await this.dashboardService.getDocumentByIdToPromise(PRODUCTS_COLLECTION_NAME, productUid);
        const currentStock = parseFloat(productFb.stock) + productQuantity;
        const updateProductPromise = this.dashboardService.udpateDocument(productUid, PRODUCTS_COLLECTION_NAME, { stock: currentStock });
        updateStockPromises.push(updateProductPromise);
      }
      updatePromises.push(...updateStockPromises);
      const updatePriceSalePromises: Promise<any>[] = [];
      for (const product of shopping.products) {
        const productUid = product.productUid;
        const newPriceSale = this.formProduct.get('priceSale')?.value;
        const updateProductPromise = this.dashboardService.udpateDocument(productUid, PRODUCTS_COLLECTION_NAME, { priceSale: newPriceSale });
        updatePriceSalePromises.push(updateProductPromise);
      }
      updatePromises.push(...updatePriceSalePromises);
      await Promise.all(updatePromises);
      this.submitClicked();
      this.toastService.success('Compra autorizada correctamente');
    }
  }
  
  getMessageApp(code: string): string{
    return MESSAGES_APP.find((element: any) => element.code === code).message;
  }
  
  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
  }
  async openModal(shopp: Shopping)
  {
    this.shopp = shopp;
    this.DetailsShopping = shopp.products;
      this.modal.present();

  }
  
  async submitClicked() {
    await this.modalController.dismiss('/dashboard/shopping/history-shopping/');
  }
 
  
  }
  

