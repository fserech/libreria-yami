import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import {  CANCELLATIONS_COLLECTION_NAME, PRODUCTS_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { Cancellation } from 'src/app/shared/models/cancellation';
import { Product } from 'src/app/shared/models/product';

import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';

@Component({
  selector: 'app-cancellation-stock',
  templateUrl: './cancellation-stock.component.html',
  styleUrls: ['./cancellation-stock.component.scss'],
})
export class CancellationStockComponent  implements OnInit {

  cancellations: Cancellation[] = [];
  cancellation: Cancellation = null;
  products: Product[];
  selectedOption: any;
  load: boolean = false;
pendingCancellations: Cancellation[] = [];
finalizedCancellations: Cancellation[] = [];

  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private toastService: ToastService,
  ) { 
    
  }

  ngOnInit() {
    // Cargar todas las solicitudes
    this.dashboardService.getAllItemsCollection(CANCELLATIONS_COLLECTION_NAME, 'type')
      .subscribe({
        next: (cancellations: Cancellation[]) => {
          // Filtrar las solicitudes por estado
          this.pendingCancellations = cancellations.filter(cancellation => cancellation.status === 'PENDING');
          this.finalizedCancellations = cancellations.filter(cancellation => cancellation.status === 'FINALIZED');
        },
        error: error => {
          console.log('Error al cargar solicitudes de anulación:', error);
        }
      });
  }
  
  
  
  getTypeLabel(type: string): string {
    if (type === 'SALES') {
      return 'Venta';
    } else if (type === 'SHOPPING') {
      return 'Compra';
    } else {
      return type;
    }
  }


  
  async submit(cancellation: Cancellation) {
    this.load = true;
    if (cancellation.discardStock) {
      if (cancellation.status === 'PENDING') {
        cancellation.status = 'FINALIZED';
        // Mover la solicitud a la lista de autorizadas
        this.pendingCancellations.push(cancellation);
        // Quitar la solicitud de la lista de solicitudes de anulaciones
        this.cancellations = this.cancellations.filter(item => item !== cancellation);

        // Actualizar la solicitud en la base de datos
        this.dashboardService.udpateDocument(cancellation.uid, CANCELLATIONS_COLLECTION_NAME, cancellation)
          .then(() => {
            console.log('Solicitud autorizada y actualizada en la base de datos');
          })
          .catch(error => {
            console.error('Error al actualizar en la base de datos:', error);
          });
      }
    }
  }
  

reset(route?: string) {
  this.reset();
  this.load = false;
  if (route) {
    this.router.navigate([route]);
  } else {
    this.router.navigate(['/dashboard/brands']);
  }
}


async returnProductsToStock(cancellation: Cancellation) {
  this.products.forEach((product) => {
    this.dashboardService
      .getDocumentById(PRODUCTS_COLLECTION_NAME, product.uid)
      .subscribe({
        next: (product: Product) => {
          if (product) {
            product.stock = (Number(product.stock) + Number(product. stock)).toString();
            this.dashboardService.udpateDocument(PRODUCTS_COLLECTION_NAME, product.uid, product)
              .then(() => {
                console.log('Se actualizo el stock del producto: ' + product.name);
              })
              .catch((error) => {
                console.log(error);
              });
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
  });
}
 

 
}




  

function then(arg0: (response: any) => void) {
  throw new Error('Function not implemented.');
}

