import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable, first, map, take } from 'rxjs';
import { PRODUCTS_COLLECTION_NAME, SALES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { MESSAGES_APP } from 'src/app/shared/constants/messages-app';
import { ProductSale, Sale } from 'src/app/shared/models/sale';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';

@Component({
  selector: 'app-new-sale',
  templateUrl: './new-sale.component.html',
  styleUrls: ['./new-sale.component.scss'],
})
export class NewSaleComponent  implements OnInit, AfterViewChecked {
  title: string = 'Nueva Venta';
  form: FormGroup;
  load: boolean = false;
  copied: boolean = false;
  record: Sale = null;
  mode: string = 'view';
  searchTerm: string = '';
  routeBack: string = '/dashboard/sales';
  valuesFirestore: string[] = [];
  isChecked: boolean = false;
  selectedProducts: any []=[];
  totalPrice: number = 0;
  products$: Observable<any[]>;
  products: any[] = [];

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    this.products$ = this.route.data.pipe(map(data => {
      const products = data['products'] as any[];
      console.log(products);
      return products
      // .filter(product => product.active === true)
      .map(product => ({ ...product, select: false }));
    }));
    const uid = this.route.snapshot.params['uid'];
    this.mode = this.route.snapshot.params['mode'];
    this.getFiles();
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit() {

    // this.dashboardService.getAllItemsCollection(PRODUCTS_COLLECTION_NAME, 'name')
    // .subscribe({
    //   next: (products: Product[]) => {
    //     this.products = products;

    //   },
    //   error: error => {console.log(error);}
    // });
  }

  getFiles() {
    this.form = this.fb.group({
      cf: [false, []],
      nit: ['', [Validators.required]],
      description: ['', []],
      createAt: [new Date(), []],
      total: ['', []],
      status: ['', []],
      // products: this.fb.array([]),
    });
  }

  async submit() {
    if(this.form){
      this.load = true;
      const date: Date = new Date();

      this.record = {
        nit: this.form.controls['nit'].value,
        createAt: date,
        total: this.getTotalSale(),
        status: 'UNBILLED',
        products: this.getProductSelected(),
      };

      if(this.form.controls['description'].value !== '' &&
         this.form.controls['description'].value !== null &&
         this.form.controls['description'].value !== undefined){
        this.record.description = this.form.controls['description'].value;
      }

      // let stock: Boolean = false;
      // await this.checkStock().then((stockSuccess: any[]) => {
      //   const success = stockSuccess.filter((product: any) => product.success === true);
      //   if(success.length === this.record.products.length){}
      // });
      console.log(this.checkStock());

    }

    // Agregar un console.log para mostrar el JSON antes de guardarlo
    // console.log('JSON a guardar en Firestore:', this.record);

    // if (this.form) {
    //   this.dashboardService
    //     .saveDocument(SALES_COLLECTION_NAME, this.record)
    //     .then((response: any) => {
    //       console.log(response);
    //       this.load = false;
    //       this.form.reset();
    //     })
    //     .catch((error: any) => {
    //       console.log(error);
    //       this.load = false;
    //       this.form.reset();
    //     });
    //     this.reset(this.routeBack);
    // }  this.selectedProducts.forEach((product: any) => {
    //   const updatedStock = product.stock - product.units;
    //   if (updatedStock >= 0) {
    //     // Actualiza el stock del producto en Firestore
    //     this.dashboardService.udpateDocument(product.uid, 'products', { stock: updatedStock });

    //   } else {
    //     console.error(`No hay suficiente stock disponible para ${product.name}`);


    //   }
    // });

  }

  async checkStock(){

    if (this.record) {
      const productSelected: ProductSale[] = this.record.products;
      const stockCheck: any[] = [];

      const promises = productSelected.map(async (product: ProductSale) => {
        try {
          const productFb: any = await this.dashboardService.getDocumentByIdToPromise(PRODUCTS_COLLECTION_NAME, product.uid);
          const currentStock = parseFloat(productFb.stock) - parseFloat(product.units);

          if (currentStock >= 0) {
            stockCheck.push({ uid: product.uid, name: product.name, stock: currentStock.toString(), success: true });
          } else {
            stockCheck.push({ uid: product.uid, name: product.name, stock: currentStock.toString(), success: false });
          }
        } catch (error) {
          console.log(error);
        }
      });
      await Promise.all(promises);
      return (stockCheck.length === this.record.products.length) ? true : false;
    }

    return [];

    // if(this.record){
    //   const productSelected: ProductSale[] = this.record.products;
    //   let stockCheck: any[] = [];

    //   await productSelected.forEach((product: ProductSale, index: number) => {
    //     this.dashboardService
    //         .getDocumentByIdToPromise(PRODUCTS_COLLECTION_NAME, product.uid)
    //         .then((productFb: any) => {
    //           const currentStock = parseFloat(productFb.stock) - parseFloat(product.units);
    //           if(currentStock >= 0){
    //             // currentStock.toString();
    //             stockCheck.push({uid: product.uid, name: product.name, stock: currentStock.toString(), success: true});
    //             // this.dashboardService
    //             //   .udpateDocument(product.uid, PRODUCTS_COLLECTION_NAME ,{stock: currentStock})
    //             //   .then((res: any) => console.log(res))
    //             //   .catch((error: any) => console.log(error));
    //           }else{
    //             stockCheck.push({uid: product.uid, name: product.name, stock: currentStock.toString(), success: false});
    //           }
    //         })
    //         .catch((error: any) => {console.log(error)});
    //   });
    //   console.log(stockCheck);
    // }
  }

  getProductSelected(): ProductSale[]{
    const date: Date = new Date();
    const productSale: ProductSale[] = this.selectedProducts.map((product: any) => {
      const productSelect: ProductSale = {
        uid: product.uid || '',
        name: product.name || '',
        priceSale:  product.priceSale || '',
        units: product.units || '',
        unitMeasurement: product.unitMeasurement || '',
        date: date
      };
      return productSelect;
    });

    return productSale;
  }

  reset(route?: string){
    this.form.reset();
    // this.keywords = [];
    this.valuesFirestore = [];
    this.load = false;
    if(route){
      this.router.navigate([route]);
    }else{
      this.router.navigate(['/dashboard/sales']);
    }

  }

  // copyToClipboard
  copyToClipboard(text: string | undefined) {
    if (text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999); // Para navegadores móviles
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.copied = true;
      this.toastService.success('se copio UID del registro');
      setTimeout(() => {
        this.copied = false;
      }, 1000); // Puedes ajustar el tiempo en milisegundos según tus preferencias

    }
  }

  // Función para filtrar los productos en función del término de búsqueda
  handleInput(event: any){
    console.log('event', event)
  }

  firstCapitalLetter(cadena: string): string {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  }

  toggleProduct(event: any, product: any) {
    const select: boolean = event.detail.checked;
    const uid = product.uid;

    this.products$.pipe(first()).subscribe(products => {

      const index = products.findIndex((product: any) => product.uid == uid);
      (select) ? this.addProductListTemp(product) : this.removeProductListTemp(product);

      if (index !== -1) {
        const updatedProducts = [...products]; // Clona el array
        updatedProducts[index] = { ...updatedProducts[index], select: select }; // Actualiza el producto
        this.products$ = null;
        this.products$ = new Observable(observer => {
          observer.next(updatedProducts);
        });
      }
    });
  }

  addProductListTemp(product: any){
    console.log(product);
    product.units = 1;
    this.selectedProducts.push(product);
    console.log(this.selectedProducts)
  }

  removeProductListTemp(product: any){
    if(this.selectedProducts.length > 0){
      const productRemove = this.selectedProducts.findIndex((element) => element.uid == product.uid);
      this.selectedProducts.splice(productRemove, 1);
    }
  }

  removeListTemp(product: any){
    this.removeProductListTemp(product);
    this.changeCheckToogle(product.uid);
  }

  changeCheckToogle(uid: string) {
    this.products$.pipe(first()).subscribe(products => {
      const index = products.findIndex((product: any) => product.uid == uid);
      if (index !== -1) {
        const updatedProducts = [...products]; // Clona el array
        updatedProducts[index] = { ...updatedProducts[index], select: false }; // Actualiza el producto
        this.products$ = new Observable(observer => {
          observer.next(updatedProducts);
        });
      }
    });
  }

  calculateTotalPrice() {
    this.totalPrice = 0;
    for (const product of this.selectedProducts) {
      this.totalPrice += product.quantity * product.priceSale;
    }
  }

  calculateSubtotal(product: any): number {
    if(product.units > product.stock){
      const index = this.selectedProducts.findIndex(objeto => objeto.uid === product.uid);
      if(index !== -1){
        this.selectedProducts[index].units = product.stock;
      }
    }
    return product.units * product.priceSale;
  }

  getTotalSale(): string{

    let count: string = '00.00';
    if(this.selectedProducts.length > 0){
      this.selectedProducts.forEach((product: any, index: number) => {
        const subTotal = this.calculateSubtotal(product);
        const total = (parseFloat(count) + subTotal).toFixed(2);
        count = total.toString();
      });
    }
    return count;
  }

  changeToogle($event: any){

    const valueCheck = $event.detail.checked;
    if(valueCheck){
      this.form.get('nit').setValue('CF');
      this.form.get('nit').disable();
    }else{
      this.form.get('nit').setValue('');
      this.form.get('nit').enable();
    }
  }

  showPopover(index: number) {
    this.products$.pipe(take(1)).subscribe(products => {
      if (products[index]) {
        products[index].showPopover = true;
      }
    });
  }

  hidePopover(index: number) {
    this.products$.pipe(take(1)).subscribe(products => {
      if (products[index]) {
        products[index].showPopover = false;
      }
    });
  }

  getMessageApp(code: string): string{
    return MESSAGES_APP.find((element: any) => element.code === code).message;
  }

}



