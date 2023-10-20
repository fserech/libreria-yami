import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DocumentReference } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonSearchbar, NavController } from '@ionic/angular';
import { Observable, map } from 'rxjs';
import { CANCELLATIONS_COLLECTION_NAME, PRODUCTS_COLLECTION_NAME, SALES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { MESSAGES_APP } from 'src/app/shared/constants/messages-app';
import { Cancellation } from 'src/app/shared/models/cancellation';

import { ProductSale, Sale } from 'src/app/shared/models/sale';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';

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
  sale: Sale;
  productsSale: ProductSale[];
  formSale: FormGroup;
  formProduct: FormGroup;
  routeBack: string = '/dashboard/cancellations';

  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private firestore: AngularFirestore,
  ) { 
    this.sales$ = this.route.data.pipe(map(data => {
      const sales = data['sales'] as any[];
      console.log(sales);
      return sales
      // .filter(product => product.active === true)
      .map(sale => ({ ...sale, select: false }));
    }));
    this.getFiles();
  }
 

  ngOnInit() {
  

  }

  getFiles() {
    this.form = this.fb.group({
      defective: [false, []],
      comment: ['', [Validators.required]],
      status: ['PENDING', []],
      stock: [false, []],
    });

    this.formSale = this.fb.group({
      nit: ['', []],
      date: ['', []],
      description: ['', []],
      status: ['', []],
      total: ['Q 00.00', []],
    });
    this.formSale.disable();

    this.formProduct = this.fb.group({
      name: ['', []],
      priceSale: ['', []],
      units: ['', []],
    });
    this.formProduct.disable();
  }

 async submit() {
  if(this.form){
    this.load = true;
    this.record = {
      type: 'SALE',
      documentRef: null,
      comment: this.form.controls['comment'].value,
      status: this.form.controls['status'].value,
    };
   
    

    
    this.dashboardService.saveDocument(CANCELLATIONS_COLLECTION_NAME, this.record)
      .then((response:any) => {
        console.log('guardado exitosamente',response);
        this.load=false;
        this.form.reset();
      })
      .catch((error) => {
        console.log('Ocurrió un error al guardar la cancelación:', error);
        this.load=false;
        this.form.reset();
      });
      this.reset(this.routeBack);
  } 
  }
  
  

  handleInput(searchBar: IonSearchbar) {
    const query = searchBar.value;
    if (query.trim() === '') {
      console.log('Campo vacío');
    
  } else { 
    this.dashboardService
    .getDocumentByIdToPromise(SALES_COLLECTION_NAME, query)
    .then((document: Sale) => {
      this.sale = document;
      this.formSale.controls['nit'].setValue(this.getLabelNIT(this.sale.nit));
      this.formSale.controls['date'].setValue(this.formatDate(this.sale.createAt));
      this.formSale.controls['description'].setValue(this.sale.description?this.sale.description:'');
      this.formSale.controls['status'].setValue(this.getLabelStatus(this.sale.status));
      this.formSale.controls['total'].setValue('Q ' + this.sale.total);
      console.log( document)
      console.log( this.formSale.value)
      this.formSale.disable();
      this.productsSale = this.sale.products;  
    })
    .catch((_error:any)=>{console.log('El Dato no Pertenece a Ventas')})
}
}

getLabelStatus(status: string): string{
  return (status === 'UNBILLED' ) ? 'Pendiente de Facturar' : 'Facturado';
} 

getLabelNIT(value: string): string{
  return (value === 'CF' ) ? 'Consumidor Final (CF)' : value;
} 

async changeToogle($event: any) {
  const valueCheck = $event.detail.checked;
  if (valueCheck) {
    this.form.get('status').setValue('Finalized');
    this.form.get('comment').setValue('');
    this.form.get('comment').disable();
  } else {
    this.form.get('status').setValue('Finalized');
    this.form.get('comment').enable();
    if (this.form.controls['sale'] && this.form.controls['sale'].value) {
      const success = await this.returnProductToStock();
      if (success) {
        this.form.get('status').setValue('Canceled');
      } else {
        console.log('error');
      }
    } 
  }
}

   


// Función para devolver los productos al stock
async returnProductToStock(){

  if (this.record) {

   
  }

  return null;
}
 
  reset(route?: string){
    this.load = false;
    if(route){
      this.router.navigate([route]);
    }else{
      this.router.navigate(['/dashboard/cancellations']);
    }

  }

  defective(value: string): string{
    return (value === 'defective' ) ? 'Producto Defectuoso' :"coment";
  } 
  
  formatDate(timestamp: any): string {
    const date = timestamp ? timestamp.toDate() : null;
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
  }
  getMessageApp(code: string): string{
    return MESSAGES_APP.find((element: any) => element.code === code).message;
  }
  
}