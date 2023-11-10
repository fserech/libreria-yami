import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  itemsPerPage: number = 8;
  currentPage: number = 1;
  totalItems: number;
  isLoading: boolean = false;


  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController,
    private router: Router,
    
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
  

  editProduct(product: Product) {
    // console.log(product.uid)
    const uid = product.uid;
    this.router.navigate([`/dashboard/products/edit/${uid}`]);
    // this.navCtrl.navigateForward(`/dashboard/products/edit/${product.uid}`);
  }

  deleteProduct(product: Product){

  }

  handleInput(event: any) {
    const value = event.target.value.toLowerCase();
    this.dashboardService.searchForField(PRODUCTS_COLLECTION_NAME, 'name', value)
      .subscribe(
        (response: any[]) => {
          this.products = response;
        },
        (error: any) => {
          console.log(error);
        }
      );
  }
  

  firstCapitalLetter(cadena: string): string {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  }

}
