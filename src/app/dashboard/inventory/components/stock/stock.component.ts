import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PRODUCTS_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { Inventory } from 'src/app/shared/models/Inventory';
import { Product } from 'src/app/shared/models/product';
import { Sale } from 'src/app/shared/models/sale';
import { DetailsShopping, ProductShopping, Shopping } from 'src/app/shared/models/shopping';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
})
export class StockComponent  implements OnInit {
  products: Product[] = [];
  producShopping:ProductShopping[] = [];
  shoppingDetails: DetailsShopping[] = [];
  sales: Sale[] = [];
  shopping: Shopping [] = [];
  inventory: Inventory = null;
  title: string = 'Existencias';
  itemsPerPage: number = 6;
  currentPage: number = 1;
  totalItems: number;


  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController
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

  deleteProduct(article: Product) {
    /**1. CONSULTAR SI EL REGISTRO ES UTILIZADO EN OTRA COLECCION,
     * 1.2. SI SE USA EN OTRA COLECCION NO SE ELIMINA
     * 1.3. SI NO SE USA EN OTRA COLECCION O EL REGISTRO NO TIENE REFERENCIA EN OTRA COLECCION SE ELIMINA
     * 2. ANTES DE ELIMINAR CUALQUIER REGISTRO SE DEBE MOSTRAR UN DIALOGO PREGUNTANDO AL USUARIO SI ETA SEGURO(SI/NO) */

    // // Utiliza la función deleteDocument de DashboardService para eliminar la categoría
    // this.dashboardService.DeleteDocument(CATEGORIES_COLLECTION_NAME, category.uid)
    //   .then(() => {
    //     // Eliminación exitosa, actualiza la lista de categorías
    //     this.categories = this.categories.filter(c => c.uid !== category.uid);
    //   })
    //   .catch(error => {
    //     console.error('Error al eliminar la categoría:', error);
    //   });
  }

  
  getStockIconColor(product: any): string {
    const stock = parseInt(product.stock);
    const stockMin = parseInt(product.stockMin);
    const stockMax = parseInt(product.stockMax);

    if (stock <= stockMin) {
      return 'danger '; // Rojo para stock igual o menor al mínimo
    } else if (stock >= stockMax) {
      return 'success'; // Verde para stock igual o mayor al máximo
    } else {
      return 'warning'; // Amarillo para stock en un rango aceptable
    }
  }

  getStockIconName(product: any): string {
    const color = this.getStockIconColor(product);
  
    switch (color) {
      case 'danger':
        return 'close-circle-outline';
      case 'success':
        return 'checkmark-done-circle-outline';
      case 'warning':
        return 'alert-circle-outline';
      default:
        return 'close-circle-outline';
    }
  }
  
  
  getSortedProducts(): any[] {
    const sortedColors = ['danger', 'warning', 'success'];
  
    return this.products.sort((a, b) => {
      const colorA = this.getStockIconColor(a);
      const colorB = this.getStockIconColor(b);
  
  
      return sortedColors.indexOf(colorA) - sortedColors.indexOf(colorB);
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

}
