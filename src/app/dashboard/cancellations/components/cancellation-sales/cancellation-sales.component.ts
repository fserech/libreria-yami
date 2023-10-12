import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DocumentReference } from '@angular/fire/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonSearchbar, NavController } from '@ionic/angular';
import { Observable, first, map, of } from 'rxjs';
import { SALES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { MESSAGES_APP } from 'src/app/shared/constants/messages-app';
import { Cancellation } from 'src/app/shared/models/cancellation';
import { Product } from 'src/app/shared/models/product';
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
  products: Product[] = [];
  record: Cancellation;
  title: string = 'Anular Ventas';
  @ViewChild('searchBar') searchBar: IonSearchbar;
  sales$: Observable<any[]>;
  searchText: string = '';
  searchInputNotEmpty = false;
  selectedSales: any = true;
  selectedSaleProducts: any []=[true]; 
  products$: Observable<any[]>;
  documentRef: DocumentReference;
  

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
    this.dashboardService.getAllItemsCollection(SALES_COLLECTION_NAME, 'uid')
  .subscribe({
    next: (sales: Sale[]) => {
      this.sales$ = of(sales); // Actualiza sales$ con los datos de ventas
          console.log('Datos de ventas recibidos:', this.sales);
    },
    error: error => {
      console.log('Error al obtener datos de ventas:', error);
    }
  });

  }

  getFiles() {
    this.form = this.fb.group({
      type: ['SALE', []],
      comment: ['', []],
      total: ['', []],
      status: ['PENDING', []],
      stock: [false, []],
      
      
    });
  }

  handleInput(searchBar: IonSearchbar) {
    const query = searchBar.value; 

   
    this.dashboardService.searchForField(SALES_COLLECTION_NAME, 'description', query)
      .subscribe(
        (response: any[]) => {
          this.sales$ = of(response); 
        },
        (error: any) => {
          console.log('Error searching sales:', error);
        });
}

submit(){

}

  
  
  handleInputChange(event: any) {
    const query = event.target.value.trim(); 
    if (query.length > 0) {
      this.searchInputNotEmpty = true; 
    } else {
      this.searchInputNotEmpty = false; 
    }
  }

  clearSearchResults() {
    this.sales = [];
    this.sales$ = null;
    this.searchBar.value = '';
  
    // Establecer la variable searchInputNotEmpty en false para ocultar la tarjeta
    this.searchInputNotEmpty = false;
  }
  
   
  changeCheckToogle(sale: any) {
    sale.checked = !sale.checked;

    if (sale.checked) {
      console.log('Venta deseleccionada:', sale);
      this.selectedSales = [];
      this.selectedSaleProducts = [];
  
    } else if (!sale.checked) {
      console.log('Venta seleccionada:', sale);
      this.selectedSales = sale;
      this.selectedSaleProducts = sale.products;
      
    }
 }

  changeToogle($event: any){

    const valueCheck = $event.detail.checked;
   
  }
  
 

   

  formatDate(timestamp: any): string {
    const date = timestamp ? timestamp.toDate() : null;
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
  }
  getMessageApp(code: string): string{
    return MESSAGES_APP.find((element: any) => element.code === code).message;
  }

  removeProduct(product: any) {
    
    const index = this.selectedSaleProducts.indexOf(product);
    if (index !== -1) {
      this.selectedSaleProducts.splice(index, 1);
    }
  }
}