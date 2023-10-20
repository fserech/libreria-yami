import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PRODUCTS_COLLECTION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { MEASUREMENT_UNITS } from 'src/app/shared/constants/measurement-units';
import { MESSAGES_APP } from 'src/app/shared/constants/messages-app';
import { REGEX_TEX, REGUEX_NUMBERS_FLOAT, REGEX_NUMBERS_INT, REGEX_TEXT_DASHES } from 'src/app/shared/constants/reguex';
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

  title: string = 'Nuevo Compra';
  form: FormGroup;
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

  constructor(private fb: FormBuilder,
    private toastService: ToastService,
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router) {
      this.load = true;
      this.getFiles();
      this.getAllPRoducts();
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
    const value = MEASUREMENT_UNITS.find((item: any) => item.value === unitMeasurement).label;
    return unitMeasurement === 'U' ? value + 'es' : value + 's';
  }

  getFiles(){
    this.form = this.fb.group({
      description: ['' , [Validators.pattern(this.regexText)]],
      total: ['' , [Validators.required, Validators.pattern(this.regexText)]],
      billSerie: ['' , [Validators.required, Validators.pattern(this.regexText)]],
      billNoDTE: ['' , [Validators.required, Validators.pattern(this.regexNumberInt)]],
      billNoAuth: ['' , [Validators.required, Validators.pattern(this.reexTextDashes)]],
      billDate: ['' , [Validators.required]],
      billNitSupplier: ['' , [Validators.required, Validators.pattern(this.regexNumberInt)]]
    });
  }

  getAllPRoducts(){
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

  getSelectProducts(){}

  setSelectProcut(){}

  removeSelectProduct(){}

  submit(){
    const date: Date = new Date();
    const status: string = 'PENDING';
  }

  buildDetailsShopping():DetailsShopping[]{
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
    console.log(product.name);
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768; // Define 768 como el punto de corte entre móvil y computadora
  }
}
