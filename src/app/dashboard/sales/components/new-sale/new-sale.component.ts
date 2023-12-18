
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal, NavController } from '@ionic/angular';
import { Observable, first, map, take } from 'rxjs';
import { BRANDS_COLLECTION_NAME, PRODUCTS_COLLECTION_NAME, SALES_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { MESSAGES_APP } from 'src/app/shared/constants/messages-app';
import { ProductSale, Sale } from 'src/app/shared/models/sale';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';
import { OverlayEventDetail } from '@ionic/core/components';
import { Product } from 'src/app/shared/models/product';
import { Brand } from 'src/app/shared/models/brand';
import { REGEX_NUMBERS_INT, REGEX_TEX, REGEX_TEXT_DASHES, REGUEX_NUMBERS_FLOAT } from 'src/app/shared/constants/reguex';
import { MEASUREMENT_UNITS } from 'src/app/shared/constants/measurement-units';
@Component({
  selector: 'app-new-sale',
  templateUrl: './new-sale.component.html',
  styleUrls: ['./new-sale.component.scss'],
})
export class NewSaleComponent  implements OnInit, AfterViewChecked {
  @ViewChild(IonModal) modal: IonModal;
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
  products: any[] = [];
  isModalOpen = false;
  results: Product[] = [];
  loadProduct: boolean;
  currentProduct: Product = null;
  brands: Brand[] = [];
  brandsAux: Brand[] = [];
  formProductSelect: FormGroup;
  regexText: RegExp = REGEX_TEX;
  regexNumberFloat: RegExp = REGUEX_NUMBERS_FLOAT;
  regexNumberInt: RegExp = REGEX_NUMBERS_INT;
  reexTextDashes: RegExp = REGEX_TEXT_DASHES;
  isMobile: boolean;
  productsList: Product[] = [];
  productsSelect: {units: string, product: Product, brand: string, price: string}[] = [];


  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    
    this.load = true;
      this.getFiles();
      this.getAllProducts();
      this.brands = this.route.snapshot.data['brands'];
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  
  ngOnInit() {
    this.checkIfMobile();
    window.addEventListener('resize', () => {
      this.checkIfMobile();
    });
    this.dashboardService.getAllItemsCollection(BRANDS_COLLECTION_NAME, 'name')
    .subscribe({
      next: (brands: Brand[]) => {
        this.brands = brands;
      },
      error: error => {
        console.log(error);
      }
    });

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
    this.formProductSelect = this.fb.group({
      units: [1 , [Validators.required, Validators.min(1), Validators.maxLength(4), Validators.minLength(1), Validators.pattern(this.regexNumberFloat)]],
      brand: ['' , [Validators.required]],
      price: ['' , [Validators.required]],
    });
  }

  async submit() {
    if(this.form){
      this.load = true;
      const date: Date = new Date();
     
      this.record = {
        nit: this.form.controls['nit'].value,
        createAt: date,
        total: this.form.controls['total'].value,
        status: 'UNBILLED',
        products: this.buildProductSale(),
        saleCanceled: false,
      };
      

      if(this.form.controls['description'].value !== '' &&
         this.form.controls['description'].value !== null &&
         this.form.controls['description'].value !== undefined){
        this.record.description = this.form.controls['description'].value;
      }

      let stock: Boolean = false;
      await this.checkStock().then((result: any) => {
        if(result.success && result.message === 'OK'){
          this.dashboardService
          .saveDocument(SALES_COLLECTION_NAME, this.record)
          .then((response: any) => {
            console.log(response);
            this.updateStockFb();
            this.load = false;
            this.form.reset();
            this.formProductSelect.reset();
            this.reset(this.routeBack);
          })
          .catch((error: any) => {
            console.log(error);
            this.load = false;
            this.form.reset();
            this.formProductSelect.reset();
          });
        }else{
          console.log(result.message)
        }
      });
    }
    this.form.reset();
    this.formProductSelect.reset();
    this.reset(this.routeBack);
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
      const successData = (stockCheck.length === this.record.products.length) ? true : false;
      return {success: successData, message: successData ? 'OK' : 'Existen productos sin stock suficiente'};
    }

    return {success: false, message:'Error'};
  }

  async updateStockFb(){
    if(this.record){
      const productSelected: ProductSale[] = this.record.products;
      let stockCheck: any[] = [];

      await productSelected.forEach((product: ProductSale, index: number) => {
        this.dashboardService
            .getDocumentByIdToPromise(PRODUCTS_COLLECTION_NAME, product.uid)
            .then((productFb: any) => {
              const currentStock = parseFloat(productFb.stock) - parseFloat(product.units);
              if(currentStock >= 0){
                currentStock.toString();
                stockCheck.push({uid: product.uid, name: product.name, stock: currentStock.toString(), success: true});
                this.dashboardService
                  .udpateDocument(product.uid, PRODUCTS_COLLECTION_NAME ,{stock: currentStock})
                  .then((res: any) => console.log(res))
                  .catch((error: any) => console.log(error));
              }else{
                stockCheck.push({uid: product.uid, name: product.name, stock: currentStock.toString(), success: false});
              }
            })
            .catch((error: any) => {console.log(error)});
      });
      console.log(stockCheck);
    }
  }

reset(route?: string){
    this.form.reset();
    this.formProductSelect.reset();
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



  getMessageApp(code: string): string{
    return MESSAGES_APP.find((element: any) => element.code === code).message;
  }

  trackByItems(index: number, item: Product): string {
    return item.uid;
  }

  addProductShopping(product: Product){
    this.currentProduct = product;
    this.brandsAux = [];
    const uidList: string[] = this.currentProduct.brandsRef;
    const brands: Brand[] = this.brands.filter((brand) => uidList.includes(brand.uid || ''));
    this.brandsAux = brands;
    this.formProductSelect.get('units').setValue(1);
   
    this.modal.present();

    }
  

  getColorLabelUnits(product: Product): string{
    const stock = parseFloat(product.stock);
    const min = parseFloat(product.stockMin);
    const max = parseFloat(product.stockMax);
    if(product.active){
      switch (true) {
        case stock > max:
          return 'success';
        case stock > min && stock <= max:
          return 'primary';
        case stock <= min && stock > 0:
          return 'warning';
        case stock === 0:
          return 'danger';
        default:
          return '';
      }
    }
    return 'medium';
  }

  getColorLabelIconUnits(product: Product): string{
    const stock = parseFloat(product.stock);
    const min = parseFloat(product.stockMin);
    const max = parseFloat(product.stockMax);
    if(product.active){
      switch (true) {
        case stock > max:
          return 'checkmark-circle-outline';
        case stock > min && stock <= max:
          return 'checkmark-circle-outline';
        case stock <= min && stock > 0:
          return 'checkmark-circle-outline';
        case stock === 0:
          return 'close-circle-outline';
        default:
          return '';
      }
    }
    return 'close-circle-outline';
  }

  getUnit(unitMeasurement: string): string{
    const value = MEASUREMENT_UNITS.find((item: any) => item.value === unitMeasurement)?.label;
    return unitMeasurement === 'U' ? value + 'es' : value + 's';
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  handleInput(event) {
    this.loadProduct = true;
    setTimeout(() => {
      this.loadProduct = false;
    }, 250);
    const query = event.target.value.toLowerCase();
    this.results = this.productsList.filter(product => product.name.toLowerCase().indexOf(query) > -1);

  }
  
  getAllProducts(){
    this.load = true;
    this.dashboardService.getAllItemsCollection(PRODUCTS_COLLECTION_NAME, 'name').subscribe({
      next: (products: Product[]) => {
        this.productsList = products;
        this.results = [...this.productsList];
        this.load = false;
      },
      error: (error: any) => {
        this.load = false;
        console.log(error); }
    })
  }

  resetModal(){
    this.formProductSelect.reset();
    this.brandsAux = [];
  }

  closeModal(){
    this.modal.dismiss();
    this.resetModal();
  }

  add(currentProduct: Product){
    const units: string = this.formProductSelect.controls['units'].value;
    const brand: string = this.formProductSelect.controls['brand'].value;
    const price: string = this.formProductSelect.controls['price'].value;
    const product = currentProduct;

    if(this.productsSelect.length > 0){

      const productFind = this.productsSelect.find((item: {units: string, product: Product, brand: string, price: string}) => (item.product.uid === product.uid) ? item : null);
      if(!productFind)this.productsSelect.push({units: units, product: product, brand: brand, price: parseFloat(price).toFixed(2) });

    }else{
      this.productsSelect.push({units: units, product: product, brand: brand, price: parseFloat(price).toFixed(2) });
    }
    this.modal.dismiss();
    this.resetModal();
  }

  getSubtotalUnitSelect(a: number, b: string): string{
    return 'Q ' + (a * this.parseFloat(b)).toFixed(2);
  }

  parseFloat(value: string): number{
    return parseFloat(Number(value).toFixed(2));
  }

  getTotalProductSelect(): string{
    if(this.productsSelect.length > 0){
      let total = 0;
      this.productsSelect.forEach((item: {units: string, product: Product, brand: string, price: string}) => {
        const subtotal = this.parseFloat((this.parseFloat(item.units) * this.parseFloat(item.price)).toFixed(2));
        total += subtotal;
      });
      return 'Q ' + total.toFixed(2);
    }
    return 'Q 00.00'
  }

  addRemoveUnitsProductSelect(value: number, item: {units: string, product: Product, brand: string, price: string}){
    this.load = true;
    const index = this.productsSelect.findIndex(itemSelect => itemSelect.product === item.product);
    if (index !== -1 && parseFloat(item.units) > 0) {
        const unitsNew = parseFloat(this.productsSelect[index].units) + value;
        unitsNew === 0 ? this.productsSelect[index].units = '1' : this.productsSelect[index].units = unitsNew.toFixed(0);
    }
    this.load = false;
  }

  getSubtotalProduct(a: string, b: string): string{
    return 'Q ' + (this.parseFloat(a) * this.parseFloat(b)).toFixed(2);
  }

  buildProductSale():ProductSale[]{
    if(this.productsSelect.length > 0){
      let details: ProductSale[] = [];

      this.productsSelect.forEach((item:{ units: string, product: Product, brand: string, price: string}) => {

        const detail: ProductSale = {
          uid: item.product.uid,
          name: item.product.name,
          productBrand: item.brand,
          // productCategory: category.name,
          units: item.units.toString(),
          priceSale: item.price,
          subTotal: (parseFloat(item.units) * parseFloat(item.price)).toFixed(2)
        };
        details.push(detail);
        // this.dashboardService.getDataDocumentReference(item.product.categoryRef).then((category: Category) => {

        // });

      });
      return details;
    }
    return [];
  }
}



