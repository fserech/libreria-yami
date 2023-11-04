
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonModal, ModalController, NavController } from '@ionic/angular';
import {  CANCELLATIONS_COLLECTION_NAME, PRODUCTS_COLLECTION_NAME, SALES_COLLECTION_NAME, SHOPPING_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { Cancellation } from 'src/app/shared/models/cancellation';
import { Segments } from 'src/app/shared/models/segments';
import { OverlayEventDetail } from '@ionic/core/components';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';
import { ProductSale, Sale } from 'src/app/shared/models/sale';
import { DetailsShopping, ProductShopping, Shopping } from 'src/app/shared/models/shopping';

import { Observable, map } from 'rxjs';
import { Product } from 'src/app/shared/models/product';

@Component({
  selector: 'app-cancellation-stock',
  templateUrl: './cancellation-stock.component.html',
  styleUrls: ['./cancellation-stock.component.scss'],
})
export class CancellationStockComponent  implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  cancellations: Cancellation[] = [];
  cancellation: Cancellation = null;
  load: boolean = false;
  shopp: Shopping = null;
  routeBack: string = '/dashboard/cancellations';
  sale: Sale = null;
  isMobile: boolean;
  routeBackAll: string = '/dashboard/cancellations';
  pendingCancellations: Cancellation[] = [];
  finalizedCancellations: Cancellation[] = [];
  products: Product[] = [];
  product: Product = null;
  products$: Observable<any[]>;
  segmentSelected = 'pendingCancellations';
 

    segmentList: Array<Segments> = [
      {name: 'pendingCancellations', label: 'solicitud de anulaciones', icon: "mail-unread-outline"},
      {name: 'finalizedCancellations', label: 'Autorizados', icon: 'checkmark-done-outline'},
      {name: 'report', label: 'Reporte', icon: 'document-text-outline'}
    ];
    selectedCancellation: any; 
    selectedCancellationProducts: ProductSale[] = [];
    DetailsShopping: DetailsShopping[] = [];
    productShopping: ProductShopping[]=[];
    
    

  constructor(
    private dashboardService: DashboardService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private toastService: ToastService,
    private datePipe: DatePipe,
    private modalController: ModalController,
    private fb: FormBuilder,
    
    
  ) { 
    this.cancellation = {
      type: 'SALE',
      documentRef: null,
      comment: '',
      discardStock: false,
      status: 'PENDING',
      createAt: new Date(),
    }; this.selectedCancellation = {
      products: [] 
    };
    

  } 
  ngOnInit() {
    this.dashboardService.getAllItemsCollection(CANCELLATIONS_COLLECTION_NAME, 'type').subscribe({
      next: (cancellations: Cancellation[]) => {
        this.pendingCancellations = cancellations.filter(cancellation => cancellation.status === 'PENDING');
        this.finalizedCancellations = cancellations.filter(cancellation => cancellation.status === 'FINALIZED');
      },
      error: error => {
        console.log('Error al cargar solicitudes de anulación:', error);
      }
    });
   
  }
  
  convertToProductSale(detailsShopping: DetailsShopping[]): { productSale: ProductSale[], product: Product[] } {
    const productSaleArray = detailsShopping.map((detail) => {
      return {
        uid: detail.productUid,
        name: detail.productName,
        priceSale: detail.priceUnit,
        units: detail.quantity.toString(),
        unitMeasurement: '',
        date: new Date(),
      } as ProductSale;
    });
  
    const productArray = detailsShopping.map((detail) => {
      return {
        uid: detail.productUid,
        name: detail.productName,
      } as Product;
    });
  
    return { productSale: productSaleArray, product: productArray };
  }
  
  
  convertToDetailsShopping(productSale: ProductSale[]): DetailsShopping[] {
    return productSale.map((product) => {
      return {
        productUid: product.uid,
        productName: product.name,
        productBrand: '',
        priceUnit: parseFloat(product.priceSale),
        quantity: parseInt(product.units, 10),
        subTotal: 0,
      } as unknown as DetailsShopping;
    });
  }
  
  async onCancellationClick(cancellation: Cancellation) {
    if (cancellation.type === 'SALE' || cancellation.type === 'SHOPPING') {
      const documentRef = cancellation.documentRef;
      this.dashboardService.getDocumentByIdToPromise(
        cancellation.type === 'SALE' ? SALES_COLLECTION_NAME : SHOPPING_COLLECTION_NAME,
        documentRef.id
      ).then((data: any) => {
        if (data) {
          this.selectedCancellation = {
            ...cancellation,
            products: []
          };
          
          if (cancellation.type === 'SALE') {
            this.selectedCancellationProducts = data.products as ProductSale[];
          } else if (cancellation.type === 'SHOPPING') {
            const detailsShopping = data.products as DetailsShopping[];
            const { productSale, product } = this.convertToProductSale(detailsShopping);
            this.selectedCancellationProducts = productSale;
            const detailsShoppingFromProductSale = this.convertToDetailsShopping(productSale);
  
            this.selectedCancellation.products = detailsShoppingFromProductSale;
          }
          
          this.selectedCancellation.products.push(...this.selectedCancellationProducts);
        } 
      });
    }
  }
  async submitClicked() {
    await this.modalController.dismiss('/dashboard/cancellations/cancellation-stock');
  }
  
  
  cancel() {
    this.modal.dismiss(null, 'cancel');
  }
  
  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
  }
  
  getTypeLabel(type: string): string {
    switch (type) {
      case 'SALE':
        return 'Venta';
      case 'SHOPPING':
        return 'Compra';
      default:
        return type;
    }
  }
  
  async submit() {
    
     if (this.selectedCancellation.type === 'SHOPPING') {
      if (!this.selectedCancellation.discardStock) {
        try {
          const shoppDocumentId = this.selectedCancellation.documentRef.id;
          const shoppDocument = await this.dashboardService.getDocumentByIdToPromise(SHOPPING_COLLECTION_NAME, shoppDocumentId);
          if (shoppDocument) {
            shoppDocument.shoppCanceled = true;
            await this.dashboardService.udpateDocument(shoppDocumentId, SHOPPING_COLLECTION_NAME, shoppDocument);
            this.toastService.success('Cancellacion de Compra Autorizada Solo se Anula');
            this.selectedCancellation.status = 'FINALIZED';
            
            // Actualiza la cancelación en la colección de cancelaciones
            await this.dashboardService.udpateDocument(this.selectedCancellation.uid, CANCELLATIONS_COLLECTION_NAME, this.selectedCancellation);
            this.pendingCancellations = this.pendingCancellations.filter(cancellation => cancellation == this.selectedCancellation);
            this.finalizedCancellations.push(this.selectedCancellation);
            this.submitClicked();
          } else {
            console.log('Documento de compra no encontrado en la base de datos.');
            this.submitClicked();
          }
        } catch (error) {
          console.log(error);
          this.submitClicked();
        }
      }
      
      const documentRef = this.selectedCancellation.documentRef;
      if (documentRef) {
        const documentId = documentRef.id;
        this.dashboardService.getDocumentByIdToPromise(SHOPPING_COLLECTION_NAME, documentId).then((data: any) => {
          if (data) {
            const updatedData = {
              ...data,
              shoppCanceled: this.selectedCancellation.discardStock
            };
            this.dashboardService.udpateDocument(documentId, SHOPPING_COLLECTION_NAME, updatedData)
            .then(async (response: any) => {
             

              if (this.selectedCancellation.discardStock) {
                
                try {
                  this.selectedCancellation.status = 'FINALIZED';

                  this.dashboardService.udpateDocument(this.selectedCancellation.uid, CANCELLATIONS_COLLECTION_NAME, this.selectedCancellation);
                  this.pendingCancellations = this.pendingCancellations.filter(cancellation => cancellation == this.selectedCancellation);
                  this.finalizedCancellations.push(this.selectedCancellation);
                  await this.discardStockForShopping(this.selectedCancellation.products);
                  this.toastService.success('Cancellacion de Compra Autorizada se descargo a stock');
                  this.submitClicked();
                } catch (error) {
                  console.log(error);
                  this.submitClicked();
                }
              }
            }).catch((error: any) => {
              console.log(error);
              this.reset('/dashboard/cancellations');
            });
          } else {
            this.submitClicked();
            console.log('Documento no encontrado en la colección de Ventas');
          }
        }).catch((error: any) => {
          console.log(error);
          this.submitClicked();
        });
      }
    }else if (this.selectedCancellation.type === 'SALE') {
      const documentRef = this.selectedCancellation.documentRef;
      if (documentRef) {
        const documentId = documentRef.id;
        this.dashboardService.getDocumentByIdToPromise(SALES_COLLECTION_NAME,documentId ).then((data: any) => {
          if (data) {
            const updatedData = {
              ...data,
              saleCanceled: this.selectedCancellation.discardStock
            };
            this.dashboardService.udpateDocument(documentId, SALES_COLLECTION_NAME, updatedData)
            .then(async (response: any) => {
              this.toastService.success('Cancellacion de Venta Autorizada');
              this.selectedCancellation.status = 'FINALIZED';
              this.dashboardService.udpateDocument(this.selectedCancellation.uid, CANCELLATIONS_COLLECTION_NAME, this.selectedCancellation);
              this.pendingCancellations = this.pendingCancellations.filter(cancellation => cancellation !== this.selectedCancellation);
              this.finalizedCancellations.push(this.selectedCancellation);

              if (!this.selectedCancellation.discardStock) {
                try {
                  await this.returnStockForSale(this.selectedCancellation.products);
                  const saleDocumentId = this.selectedCancellation.documentRef.id;
                  const saleDocument = await this.dashboardService.getDocumentByIdToPromise(SALES_COLLECTION_NAME, saleDocumentId);
                  if (saleDocument) {
                    saleDocument.saleCanceled = true;                   
                    await this.dashboardService.udpateDocument(saleDocumentId, SALES_COLLECTION_NAME, saleDocument);                   
                    this.toastService.success('Cancellacion de Venta Autorizada se devuelve el stock');
                  } else {
                    console.log('Documento de venta no encontrado en la base de datos.');
                  }
              
                  this.submitClicked();
                } catch (error) {
                  console.log(error);
                }
              }
              

            }).catch((error: any) => {
              console.log(error);
              this.submitClicked();
            });
          } else {
            console.log('Documento no encontrado en la colección de Ventas');
          }
        }).catch((error: any) => {
          console.log(error);
          this.submitClicked();
        });
      }
    }
  }
  
 
  async discardStockForShopping(products: DetailsShopping[]) {
    const selectedCancellation: any[] = [];
  
    for (const product of products) {
      if (product.productUid && product.quantity) {
        try {
          console.log('Procesando producto:', product);
          const productFb = await this.dashboardService.getDocumentByIdToPromise(PRODUCTS_COLLECTION_NAME, product.productUid);
          const currentStock = parseFloat(productFb.stock) - parseFloat(product.quantity);
          console.log('Stock actualizado:', currentStock);
          
          await this.dashboardService.udpateDocument(product.productUid, PRODUCTS_COLLECTION_NAME, { stock: currentStock });
         
          selectedCancellation.push({ uid: product.productUid, name: product.productName, stock: currentStock, success: true });
        } catch (error) {
          console.log('Error al procesar el producto:', error);
          selectedCancellation.push({ uid: product.productUid, name: product.productName, success: false, error });
        }
      } else {
        selectedCancellation.push({ uid: product.productUid, success: false, error: 'Producto inválido' });
      }
    }
  
    console.log('Detalles de productos procesados:', selectedCancellation);
  }
  
  
  

  
  async returnStockForSale(products: ProductSale[]) {
    const selectedCancellation: any[] = [];
  
    for (const product of products) {
      try {
        const productFb = await this.dashboardService.getDocumentByIdToPromise(PRODUCTS_COLLECTION_NAME, product.uid);
        const currentStock = parseFloat(productFb.stock) + parseFloat(product.units);
        
        await this.dashboardService.udpateDocument(product.uid, PRODUCTS_COLLECTION_NAME, { stock: currentStock });
        
        selectedCancellation.push({ uid: product.uid, name: product.name, stock: currentStock, success: true });
        this.pendingCancellations = this.pendingCancellations.filter(selectedCancellation => selectedCancellation !== selectedCancellation);
        this.finalizedCancellations.push(this.selectedCancellation);
      } catch (error) {
        selectedCancellation.push({ uid: product.uid, name: product.name, success: false, error });
      }
    }
  
    console.log(selectedCancellation);
  }

  
reset(route?: string) {
  this.reset();
  this.load = false;6589
  if (route) {
    this.router.navigate([route]);
  } else {
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

getStatusLabel(cancellation: Cancellation): string {
  if (cancellation.type === 'SALE') {
    if (this.sale.status === 'UNBILLED') {
      return 'No se Descarga de Stock';
    } else if (this.sale.status === 'INVOICED') {
      return 'Descargar de Stock';
    }
  } else if (cancellation.type === 'SHOPPING') {
    if (this.shopp.status === 'PENDING' ||this.shopp.status === 'PENDING_CHARGE_STOCK') {
      return 'No se Descarga de Stock';
    } else if (this.shopp.status === 'FINALIZED') {
      return 'Descargar de Stock';
    }
  }
  return cancellation.status; // En caso de que no sea ninguno de los estados anteriores
}




}




  



