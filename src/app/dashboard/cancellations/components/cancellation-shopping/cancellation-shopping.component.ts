import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonSearchbar } from '@ionic/angular';
import { Observable, map } from 'rxjs';
import { CANCELLATIONS_COLLECTION_NAME, SHOPPING_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { MESSAGES_APP } from 'src/app/shared/constants/messages-app';
import { REGEX_TEX } from 'src/app/shared/constants/reguex';
import { Bill } from 'src/app/shared/models/bill';
import { Cancellation } from 'src/app/shared/models/cancellation';
import { DetailsShopping, ProductShopping, Shopping } from 'src/app/shared/models/shopping';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';

@Component({
  selector: 'app-cancellation-shopping',
  templateUrl: './cancellation-shopping.component.html',
  styleUrls: ['./cancellation-shopping.component.scss'],
})
export class CancellationShoppingComponent  implements OnInit {
  form: FormGroup;
  load: boolean = false;
  shopping: Shopping[] = [];
  record: Cancellation =null;
  title: string = 'Anular compras';
  @ViewChild('searchBar') searchBar: IonSearchbar;
  shopping$: Observable<any[]>;
  searchInputNotEmpty = false;
  products$: Observable<any[]>;
  documentRef: DocumentReference;
  shopp: Shopping = null;
  DetailsShopping: DetailsShopping[];
  ProductShopping: ProductShopping[];
  formShopping: FormGroup;
  routeBack: string = '/dashboard/cancellations';
  bill: Bill;


  constructor(
    private dashboardService: DashboardService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService,
    private alertController: AlertController
  ) {
    this.shopping$ = this.route.data.pipe(map(data => {
      const shopping = data['shopping'] as any[];
      console.log(shopping);
      return shopping
      .map(shopp => ({ ...shopp, select: false }));
    }));
    this.getFiles();
   }

  ngOnInit() {}

  getFiles() {
    this.form = this.fb.group({
      comment: ['', [Validators.required, Validators.pattern(REGEX_TEX)]],
      discardStock: [false, []]
    });

    this.formShopping = this.fb.group({
      date: [''],
      status: ['', []],
      description: ['', []],
      total: ['Q 00.00', []],
      bill: this.fb.group({
        serie: ['', []],
        noDTE: ['', []],
        noAuth: ['', []],
        date: ['', []],
        nitSupplier: ['', []],
      }),
    });
    this.formShopping.disable();

  }

  handleInput(searchBar: IonSearchbar) {
    this.load = true;
    const query = searchBar.value;
    if (query.trim() === '') {
      this.toastService.info('UID está vacío, Ingresa UID')
      this.load = false;
    } else {
      this.dashboardService
        .getDocumentByIdToPromise(SHOPPING_COLLECTION_NAME, query)
        .then((document: Shopping) => {
          if (document) {
            this.shopp = document;
  
            this.formShopping.controls['date'].setValue(this.formatDate(this.shopp.createAt));
            this.formShopping.controls['status'].setValue(this.getLabelStatus(this.shopp.status));
            this.formShopping.controls['description'].setValue(this.shopp.description ? this.shopp.description : '');
            this.formShopping.controls['total'].setValue('Q ' + this.shopp.total);
            this.formShopping.controls['bill'].get('serie').setValue(this.shopp.bill.serie);
            this.formShopping.controls['bill'].get('noDTE').setValue(this.shopp.bill.noDTE);
            this.formShopping.controls['bill'].get('noAuth').setValue(this.shopp.bill.noAuth);
            this.formShopping.controls['bill'].get('date').setValue(this.formatDate(this.shopp.bill.date));
            this.shopp.shoppCanceled ? this.form.disable() : this.form.enable();
            this.formShopping.disable();
            this.DetailsShopping = this.shopp.products;
            // this.ProductShopping = this.shopp.details.map(detail => detail);
  
            this.load = false;
          } else {
            this.toastService.info('No se encontró el UID de la compra')
          }
        })
        .catch((error: any) => {
          console.log('Error al buscar el documento:', error); // Agregado para mostrar el error
          this.toastService.info('Ocurrió un error, inténtelo más tarde')
        })
    }
  }
  
getLabelStatus(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pendiente de procesamiento';
    case 'PENDING_CHARGE_STOCK':
      return 'Pendiente de carga de Stock';
    case 'FINALIZED':
      return 'Compra finalizada';
    default:
      return 'Estado desconocido';
  }
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
  if (timestamp instanceof Date) {
    return this.datePipe.transform(timestamp, 'dd/MM/yyyy HH:mm:ss') || '';
  } else if (timestamp && timestamp.toDate instanceof Function) {
    const date = timestamp.toDate();
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
  } else {
    return '';
  }
}


getMessageApp(code: string): string{
  return MESSAGES_APP.find((element: any) => element.code === code).message;
}
async submitAlert() {
  const alert = await this.alertController.create({
    mode: 'ios',
    header: 'Confirmación',
    message: 'Se creará una solicitud de anulación para esta compra, ¿Deseas continuar?',
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
  if(this.shopp && this.form.valid){

    this.load = true;
    const date: Date = new Date();
    this.record = {
      type: 'SHOPPING',
      documentRef: this.dashboardService.getDocumentReference(SHOPPING_COLLECTION_NAME, this.shopp.uid),
      comment: this.form.controls['comment'].value,
      discardStock: this.form.controls['discardStock'].value,
      status: 'PENDING',
      createAt: date
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
