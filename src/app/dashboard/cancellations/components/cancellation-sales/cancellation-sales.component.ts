import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonSearchbar } from '@ionic/angular';
import { Observable, map } from 'rxjs';
import { CANCELLATIONS_COLLECTION_NAME, SALES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { MESSAGES_APP } from 'src/app/shared/constants/messages-app';
import { REGEX_TEX } from 'src/app/shared/constants/reguex';
import { Cancellation } from 'src/app/shared/models/cancellation';
import { ProductSale, Sale } from 'src/app/shared/models/sale';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';

@Component({
  selector: 'app-cancellation-sales',
  templateUrl: './cancellation-sales.component.html',
  styleUrls: ['./cancellation-sales.component.scss'],
})
export class CancellationSalesComponent  implements OnInit {


  form: FormGroup;
  load: boolean = false;
  sales: Sale[] = [];
  record: Cancellation =null;
  title: string = 'Anular Ventas';
  @ViewChild('searchBar') searchBar: IonSearchbar;
  sales$: Observable<any[]>;
  searchInputNotEmpty = false;
  products$: Observable<any[]>;
  documentRef: DocumentReference;
  sale: Sale = null;
  productsSale: ProductSale[];
  formSale: FormGroup;
  routeBack: string = '/dashboard/cancellations';

  constructor(
    private dashboardService: DashboardService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService,
    private alertController: AlertController
  ) {
    this.sales$ = this.route.data.pipe(map(data => {
      const sales = data['sales'] as any[];
      console.log(sales);
      return sales
      .map(sale => ({ ...sale, select: false }));
    }));
    this.getFiles();
  }

  ngOnInit() {}

  getFiles() {
    this.form = this.fb.group({
      comment: ['', [Validators.required, Validators.pattern(REGEX_TEX)]],
      discardStock: [false, []]
    });

    this.formSale = this.fb.group({
      nit: ['', []],
      date: ['', []],
      description: ['', []],
      status: ['', []],
      total: ['Q 00.00', []],
    });
    this.formSale.disable();
  }

  handleInput(searchBar: IonSearchbar) {
    this.load = true;
    const query = searchBar.value;
    if (query.trim() === '') {
      this.toastService.info('UID esta vacío, Ingresa UID')
      this.load = false;
  } else {
    this.dashboardService
    .getDocumentByIdToPromise(SALES_COLLECTION_NAME, query)
    .then((document: Sale) => {
      if(document){
        this.sale = document;
        this.formSale.controls['nit'].setValue(this.getLabelNIT(this.sale.nit));
        this.formSale.controls['date'].setValue(this.formatDate(this.sale.createAt));
        this.formSale.controls['description'].setValue(this.sale.description?this.sale.description:'');
        this.formSale.controls['status'].setValue(this.getLabelStatus(this.sale.status));
        this.formSale.controls['total'].setValue('Q ' + this.sale.total);
        this.formSale.disable();
        this.productsSale = this.sale.products;
        this.load = false;
      }else{
        this.toastService.info('No se encontro UID de venta')
      }
    })
    .catch((error:any) => {
      this.toastService.info('Ocurrio un error, Intentelo más tarde')
    })
}
  }

  getLabelStatus(status: string): string{
    return (status === 'UNBILLED' ) ? 'Pendiente de Facturar' : 'Facturado';
  }

  getLabelNIT(value: string): string{
    return (value === 'CF' ) ? 'Consumidor Final (CF)' : value;
  }

  reset(route?: string){
    this.load = false;
    if(route){
      this.router.navigate([route]);
    }else{
      this.router.navigate(['/dashboard/cancellations']);
    }

  }

  formatDate(timestamp: any): string {
    const date = timestamp ? timestamp.toDate() : null;
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
  }

  getMessageApp(code: string): string{
    return MESSAGES_APP.find((element: any) => element.code === code).message;
  }

  getSubtotalProduct(a: string, b: string): string{
    return 'Q ' + (parseFloat(a) * parseFloat(b)).toFixed(2);
  }

  async submitAlert() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Confirmación',
      message: 'Se creará una solicitud de anulación para esta venta, ¿Deseas continuar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.submit();
          }
        }
      ]
    });

    await alert.present();
  }

  async submit() {
    if(this.sale && this.form.valid){

      this.load = true;
      this.record = {
        type: 'SALE',
        documentRef: this.dashboardService.getDocumentReference(SALES_COLLECTION_NAME, this.sale.uid),
        comment: this.form.controls['comment'].value,
        discardStock: this.form.controls['discardStock'].value,
        status: 'PENDING',
      };

      this.dashboardService.saveDocument(CANCELLATIONS_COLLECTION_NAME, this.record)
        .then((response:any) => {

          if(response){
            this.toastService.success('Solicitud de anulación de venta enviada');
          }
          this.load = false;
          this.form.reset();
        })
        .catch((error) => {
          this.toastService.error('Ocurrió un error al guardar la anulación:');
          this.load=false;
          this.form.reset();
        });
        this.reset(this.routeBack);
      }
    }
}
