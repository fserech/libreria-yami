import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { SALES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { Sale } from 'src/app/shared/models/sale';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';

@Component({
  selector: 'app-history-sales',
  templateUrl: './history-sales.component.html',
  styleUrls: ['./history-sales.component.scss'],
})
export class HistorySalesComponent  implements OnInit {
 sales: Sale[] = [];
  title: string = 'Historial';
  truncatedUID: string;
  

  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController,
    private modalController: ModalController,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {

    
    // Llama a la función para obtener todas las ventas
    this.dashboardService.getAllItemsCollection(SALES_COLLECTION_NAME, 'nit')
      .subscribe({
        next: (sales: Sale[]) => {
          console.log('sales: ', sales);
          this.sales = sales;
        },
        error: error => {
          console.log(error);
        }
      });

  }

  updateSaleStatus(sale: any) {
    // Cambia el estado de la venta
    if (sale.status === 'UNBILLED') {
      sale.status = 'INVOICED';
    } else {
      sale.status = 'UNBILLED';
    }

    // Aquí puedes agregar la lógica para guardar el cambio en tu base de datos o servicio
    // Por ejemplo, puedes emitir una solicitud HTTP a tu servidor para actualizar el estado.

    // Si estás usando Firebase Firestore, puedes hacer algo como esto (asegúrate de importar AngularFire):
    // this.afs.collection('sales').doc(sale.uid).update({ status: sale.status });
}

isInvoiceStatus(status: string): boolean {
  return status === 'INVOICED';
}

  formatDate(timestamp: any): string {
    const date = timestamp ? timestamp.toDate() : null;
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || '';
  }
  
  
  handleInput(event: any) {
    const value = event.target.value.toLowerCase();
    this.dashboardService.searchForField(SALES_COLLECTION_NAME, 'nit', value)
    .subscribe(
      (response: any[]) => {
        this.sales = response;
      },
      (error: any) => {
        console.log(error);
      }
      // {
      //     next: (response: Brand[]) => {
      //       this.brands = response;
      //     },
      //     error: (error: any) => {
      //       console.log(error);
      //     }
      //   }
        );
  }

  firstCapitalLetter(cadena: string): string {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  }

}
