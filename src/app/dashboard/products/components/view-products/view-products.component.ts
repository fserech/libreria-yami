import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PRODUCTS_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { Product } from 'src/app/shared/models/product';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';

@Component({
  selector: 'app-view-products',
  templateUrl: './view-products.component.html',
  styleUrls: ['./view-products.component.scss'],
})
export class ViewProductsComponent  implements OnInit {
  products: Product[] = [];
  title: string = 'Ver Productos';

  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController
  ) { }

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

  deleteProduct(product: Product){

  }

  handleInput(event: any){
    const query = event.target.value.toLowerCase();

    this.dashboardService.searchForField(PRODUCTS_COLLECTION_NAME, 'name', query)
      .subscribe(
        (response: any[]) => {
          this.products = response;
        },
        (error: any) => {
          console.log(error);
        }
      //   {
      //   next: (response: Product[]) => {
      //     this.products = response;
      //   },
      //   error: (error: any) => {
      //     console.log(error);
      //   }
      // }
      );
  }

  firstCapitalLetter(cadena: string): string {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  }

}
