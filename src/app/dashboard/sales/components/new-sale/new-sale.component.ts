import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable, first, map, take } from 'rxjs';
import { Sale } from 'src/app/shared/models/sale';
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
  routeBackAll: string = '/dashboard/sales/all';
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
      description: ['', []]
    });
  }

  submit(){
    this.load = true;
    const date: Date = new Date();


    // this.record = {
    //   name: this.form.controls['name'].value.toLowerCase(),
    //   description: this.form.controls['description'].value,
    //   productRef: this.dashboardService.getDocumentReference(PRODUCTS_COLLECTION_NAME,this.form.controls['product'].value),
    //   stock: this.mode === 'new' ? '0' : this.recordAux.stock,
    //   unitMeasurement: this.form.controls['unitMeasurement'].value,
    //   typeWholesaleUnitMeasure: this.form.controls['typeWholesaleUnitMeasure'].value,
    //   priceSale: this.mode === 'new' ? '00.00' : this.recordAux.priceSale,
    //   quantity: this.form.controls['quantity'].value,
    //   totalPrice: this.mode === 'new' ? '00.00' : this.recordAux.priceSale,
    //   date: this.form.controls['date'].value,
    //   nit:  this.form.controls['active'].value,
    //   unitsPackage: this.form.controls['unitsPackage'].value,
    //   active: this.form.controls['active'].value,
    //   stockMin: this.form.controls['stockMin'].value,
    //   stockMax: this.form.controls['stockMax'].value,
    //   createAt: this.mode === 'new' ? date : this.recordAux.createAt,
    //   keywords: this.keywords,

    // }
    // if(this.mode == 'new'){
    //   this.dashboardService
    //       .saveDocument(SALES_COLLECTION_NAME,this.record)
    //       .then(( response: any ) => {
    //          this.reset(); })
    //       .catch(( error: any ) => {
    //          this.reset();
    //          console.log(error)
    //         });
    // }else{
    //   (this.mode === 'edit')
    //   const uid = this.route.snapshot.params['uid'];
    //   this.dashboardService
    //     .udpateDocument(uid, SALES_COLLECTION_NAME, this.record)
    //     .then((response: any) => {
    //       this.reset('/dashboard/sales/all');
    //     })
    //     .catch((error: any) => {
    //       this.reset('/dashboard/sales/all');
    //     });
    // }

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
        console.log('products: ', products);
        console.log('products new: ', updatedProducts);
        this.products$ = null;
        this.products$ = new Observable(observer => {
          observer.next(updatedProducts);
        });
      }
    });
  }

  addProductListTemp(product: any){
    product.units = 1;
    this.selectedProducts.push(product);
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

}



