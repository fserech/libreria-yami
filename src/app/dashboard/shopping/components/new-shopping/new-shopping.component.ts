import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { PRODUCTS_COLLECTION_NAME, SHOPPING_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { MEASUREMENT_UNITS } from 'src/app/shared/constants/measurement-units';
import { MESSAGES_APP } from 'src/app/shared/constants/messages-app';
import { REGEX_TEX, REGUEX_NUMBERS_FLOAT, REGEX_NUMBERS_INT, REGEX_TEXT_DASHES } from 'src/app/shared/constants/reguex';
import { Brand } from 'src/app/shared/models/brand';
import { Category } from 'src/app/shared/models/category';
import { Product } from 'src/app/shared/models/product';
import { DetailsShopping, Shopping } from 'src/app/shared/models/shopping';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';

@Component({
  selector: 'app-new-shopping',
  templateUrl: './new-shopping.component.html',
  styleUrls: ['./new-shopping.component.scss'],
})
export class NewShoppingComponent  implements OnInit {

  @ViewChild(IonModal) modal: IonModal;
  title: string = 'Nuevo Compra';
  form: FormGroup;
  formProductSelect: FormGroup;
  load: boolean = false;
  copied: boolean = false;
  record: Shopping = null;
  recordAux: Shopping = null;
  regexText: RegExp = REGEX_TEX;
  regexNumberFloat: RegExp = REGUEX_NUMBERS_FLOAT;
  regexNumberInt: RegExp = REGEX_NUMBERS_INT;
  reexTextDashes: RegExp = REGEX_TEXT_DASHES;
  mode: string = 'new';
  productsList: Product[] = [];
  results: Product[] = [];
  isMobile: boolean;
  loadProduct: boolean;
  currentProduct: Product = null;
  productsSelect: {units: string, product: Product, brand: string, price: string}[] = [];
  date: Date = new Date();
  brands: Brand[] = [];
  brandsAux: Brand[] = [];

  constructor(private fb: FormBuilder,
    private toastService: ToastService,
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router) {
      this.load = true;
      this.getFiles();
      this.getAllProducts();
      this.brands = this.route.snapshot.data['brands'];
    }

  ngOnInit() {
    // this.getPageNextProducts(null, '');
    this.checkIfMobile();
    window.addEventListener('resize', () => {
      this.checkIfMobile();
    });
  }

  handleInput(event) {
    this.loadProduct = true;
    setTimeout(() => {
      this.loadProduct = false;
    }, 250);
    const query = event.target.value.toLowerCase();
    this.results = this.productsList.filter(product => product.name.toLowerCase().indexOf(query) > -1);

  }

  getUnit(unitMeasurement: string): string{
    const value = MEASUREMENT_UNITS.find((item: any) => item.value === unitMeasurement)?.label;
    return unitMeasurement === 'U' ? value + 'es' : value + 's';
  }

  getFiles(){
    this.form = this.fb.group({
      description: ['' , [Validators.pattern(this.regexText)]],
      total: ['' , [Validators.required, Validators.pattern(this.regexNumberFloat)]],
      billSerie: ['' , [Validators.required, Validators.pattern(this.regexText)]],
      billNoDTE: ['' , [Validators.required, Validators.pattern(this.regexNumberInt)]],
      billNoAuth: ['' , [Validators.required, Validators.pattern(this.reexTextDashes)]],
      billDate: ['' , [Validators.required]],
      billNitSupplier: ['' , [Validators.required, Validators.pattern(this.regexNumberInt)]]
    });

    this.formProductSelect = this.fb.group({
      units: [1 , [Validators.required, Validators.min(1), Validators.maxLength(4), Validators.minLength(1), Validators.pattern(this.regexNumberFloat)]],
      brand: ['' , [Validators.required]],
      price: ['' , [Validators.required]],
    });
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

  trackByItems(index: number, item: Product): string {
    return item.uid;
  }

  submit(){
    const date: Date = new Date();
    const getDetails: DetailsShopping[] = this.buildDetailsShopping();


    const record: Shopping = {
      createAt: date,
      status: 'PENDING',
      total: this.form.controls['total'].value,
      bill: {
        serie: this.form.controls['billSerie'].value,
        noDTE: this.form.controls['billNoDTE'].value,
        noAuth: this.form.controls['billNoAuth'].value,
        date: this.form.controls['billDate'].value,
        nitSupplier: this.form.controls['billNitSupplier'].value
      },
      shoppCanceled: false,
      products: getDetails,
     }
     if(this.form.controls['description'].value)record.description = this.form.controls['description'].value;

     console.log('la compra es: ', record);
     this.dashboardService
      .saveDocument(SHOPPING_COLLECTION_NAME, record)
      .then((response: any) => {
        console.log('response: ', response);
        console.log('record es: ', record);
        if(response)this.toastService.success('Compra registrada correctamente');
      })
      .catch((error: any) => {
        console.log('error: ', error)
        this.toastService.error('ocurrio un error al guardar la compra, intenta luego')
      });
  }

  buildDetailsShopping():DetailsShopping[]{
    if(this.productsSelect.length > 0){
      let details: DetailsShopping[] = [];

      this.productsSelect.forEach((item:{ units: string, product: Product, brand: string, price: string}) => {

        const detail: DetailsShopping = {
          productUid: item.product.uid,
          productName: item.product.name,
          productBrand: item.brand,
          // productCategory: category.name,
          quantity: item.units.toString(),
          priceUnit: item.price,
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

  getMessageApp(code: string): string{
    return MESSAGES_APP.find((element: any) => element.code === code).message;
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

  addProductShopping(product: Product){

    this.currentProduct = product;
    this.brandsAux = [];
    const uidList: string[] = this.currentProduct.brandsRef;
    const brands: Brand[] = this.brands.filter((brand) => uidList.includes(brand.uid || ''));
    this.brandsAux = brands;
    this.formProductSelect.get('units').setValue(1);
    // unitsControl.clearValidators();
    // unitsControl.setValidators(
    //   [
    //     Validators.required, Validators.min(1),
    //     Validators.maxLength(4), Validators.minLength(1),
    //     Validators.pattern(this.regexNumberFloat)
    //   ]);
    // unitsControl.updateValueAndValidity();
    this.modal.present();
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  parseFloat(value: string): number{
    return parseFloat(Number(value).toFixed(2));
  }

  getSubtotalUnitSelect(a: number, b: string): string{
    return 'Q ' + (a * this.parseFloat(b)).toFixed(2);
  }

  getSubtotalProduct(a: string, b: string): string{
    return 'Q ' + (this.parseFloat(a) * this.parseFloat(b)).toFixed(2);
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

  resetModal(){
    this.formProductSelect.reset();
    this.brandsAux = [];
  }

  closeModal(){
    this.modal.dismiss();
    this.resetModal();
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
}
