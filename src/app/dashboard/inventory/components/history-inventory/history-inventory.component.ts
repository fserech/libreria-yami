import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonModal, ModalController, NavController } from '@ionic/angular';
import { PRODUCTS_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { Inventory } from 'src/app/shared/models/Inventory';
import { Product } from 'src/app/shared/models/product';
import { Sale } from 'src/app/shared/models/sale';
import { DetailsShopping, ProductShopping, Shopping } from 'src/app/shared/models/shopping';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';
import { OverlayEventDetail } from '@ionic/core/components';
import { REGEX_TEX, REGUEX_NUMBERS_FLOAT } from 'src/app/shared/constants/reguex';
@Component({
  selector: 'app-history-inventory',
  templateUrl: './history-inventory.component.html',
  styleUrls: ['./history-inventory.component.scss'],
})
export class HistoryInventoryComponent  implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  record: Product = null;
  products: Product[] = [];
  producShopping:ProductShopping[] = [];
  shoppingDetails: DetailsShopping[] = [];
  sales: Sale[] = [];
  productShopping: ProductShopping [] =[];
  shopping: Shopping [] = [];
  regexNumberFloat: RegExp = REGUEX_NUMBERS_FLOAT;
  regexText: RegExp = REGEX_TEX;
  inventory: Inventory = null;
  title: string = 'Historial';
  itemsPerPage: number = 6;
  currentPage: number = 1;
  totalItems: number;
  selectedProduct: Product;
  shopp:  any;
  form: FormGroup;
  load: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController,
    private modalController: ModalController,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    
   }
  
  

  ngOnInit() {
    this.dashboardService.getAllItemsCollection(PRODUCTS_COLLECTION_NAME, 'name')
    .subscribe({
      next: (products: Product[]) => {
        this.products = products;
      },
      error: error => {console.log(error);}
    });
  }

  editProduct(product: any) {
    this.navCtrl.navigateForward(`/dashboard/products/edit/${product.uid}`);


  }


  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  
  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.products.length) {
      this.currentPage++;
    }
  }

  handleInput(event: any) {
    const query = event.target.value.toLowerCase().trim();
    this.dashboardService.searchForField(PRODUCTS_COLLECTION_NAME, 'name', query)
      .subscribe(
        (response: any[]) => {
          this.products = response;
        },
        (error: any) => {
          console.log(error);
        },
        () => {
          // Verificar si no hay resultados y manejarlo
          if (this.products.length === 0) {
            // Puedes mostrar un mensaje o realizar otra acción
            console.log('No se encontraron resultados.');
          }
        }
      );
  }
  
  
firstCapitalLetter(cadena: string): string {
  return cadena.charAt(0).toUpperCase() + cadena.slice(1);
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
cancel() {
  this.modal.dismiss(null, 'cancel');
}
onWillDismiss(event: Event) {
  const ev = event as CustomEvent<OverlayEventDetail<string>>;
  
}
async openModal(product: Product) {
  


  this.modal.present();
}



async submitClicked() {
  await this.modalController.dismiss('/dashboard/shopping/history-shopping/');
}
formatDate(timestamp: any): string {
  const date = timestamp ? timestamp.toDate() : null;
  return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
}




}
