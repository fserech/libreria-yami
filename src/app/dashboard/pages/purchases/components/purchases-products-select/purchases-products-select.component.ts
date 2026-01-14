import { NgClass, KeyValuePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { bootstrapChevronBarLeft, bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarRight } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matAddOutline, matArrowUpwardOutline, matArrowDownwardOutline, matShoppingCartOutline, matPlaylistAddCheckOutline, matExpandMoreOutline } from '@ng-icons/material-icons/outline';
import { ChatBubbleComponent } from '../../../../../shared/components/chat-bubble/chat-bubble.component';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { SearchInputTextComponent } from '../../../../../shared/components/search-input-text/search-input-text.component';
import { Product, ProductVariant } from '../../../../../shared/interfaces/product';
import { Dialog } from '@angular/cdk/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { URL_PRODUCTS } from '../../../../../shared/constants/endpoints';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CrudService } from '../../../../../shared/services/crud.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import BaseForm from '../../../../../shared/classes/base-form';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectProductQuantityDialogComponent } from '../select-product-quantity-dialog/select-product-quantity-dialog.component';
import { firstValueFrom } from 'rxjs';
import { MatBadgeModule } from '@angular/material/badge';
import { ProductPurchaseSelect } from '../../../../../shared/interfaces/purchase';
import { PurchasesProductsSelectListDialogComponent } from '../purchases-products-select-list-dialog/purchases-products-select-list-dialog.component';

@Component({
  selector: 'app-purchases-products-select',
  standalone: true,
  imports: [HeaderComponent, NgIcon, SearchInputTextComponent, NgClass, ChatBubbleComponent,
    MatCheckboxModule, FormsModule, ReactiveFormsModule, SelectProductQuantityDialogComponent,
    MatBadgeModule, KeyValuePipe],
  templateUrl: './purchases-products-select.component.html',
  styleUrl: './purchases-products-select.component.scss',
  viewProviders: [ provideIcons({ matAddOutline, bootstrapChevronBarLeft, bootstrapChevronLeft,
    bootstrapChevronRight, bootstrapChevronBarRight, matArrowUpwardOutline,
    matArrowDownwardOutline, matShoppingCartOutline, matPlaylistAddCheckOutline, matExpandMoreOutline
   }) ]
})
export class PurchasesProductsSelectComponent extends BaseForm implements OnInit {

  form: FormGroup;
  products: ProductPurchaseSelect[];
  displayedColumns: string[] = ['productName'];
  dataSource;
  selectedIdControl = new FormControl(null);
  expandedProductId: number | null = null; // Para controlar qué producto está expandido

  @Output() changes = new EventEmitter<ProductPurchaseSelect[]>();
  @Output() finalized = new EventEmitter<boolean>();

  constructor(
    private _formBuilder: FormBuilder,
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: Dialog,
    private auth: AuthService,
    private bpo: BreakpointObserver
  ){
    super(crud, toast, auth, bpo);

    this.crud.baseUrl = URL_PRODUCTS;
    this.mode = this.setMode(this.route.snapshot.paramMap.get('mode'));
    this.sortConfig.sortBy = 'productName';
    this.sortConfig.sortOrder = 'asc';
    this.pageSize = 10;
    this.products = [];

    if(this.mode !== 'new') this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.form = new FormGroup({
      productName: new FormControl('', []),
    });
  }

  ngOnInit(): void {
    this.crud.baseUrl = URL_PRODUCTS;
    this.filter();
  }

  filter(name?: string){
    this.crud.baseUrl = URL_PRODUCTS;

    // Cargar TODOS los productos activos (con y sin variantes)
    let filter = '&active=true';
    if(name){
      filter = filter.concat(`&productName=${encodeURIComponent(name)}`);
    }
    this.filters = filter;
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, filter);
  }

  introSearch(){
    const name: any = this.form.controls['productName'].value;
    if(name && name !== ''){
      this.filter(name);
    }
  }

  changeSortOrderBy(field: string){
    if(field === this.sortConfig.sortBy){
      if(this.sortConfig.sortOrder === 'asc'){
        this.sortConfig.sortOrder = 'desc';
      }else if(this.sortConfig.sortOrder === 'desc'){
        this.sortConfig.sortOrder = 'asc';
      }
    }
    if(field !== this.sortConfig.sortBy){
      this.sortConfig.sortBy = field;
      this.sortConfig.sortOrder = 'asc';
    }
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, this.filters);
  }

  back(){
    this.router.navigate(['dashboard/purchases']);
  }

  initPage(){
    this.crud.baseUrl = URL_PRODUCTS;
    let filter = '&active=true';
    this.filters = filter;
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, 1, 10, this.filters);
    this.form.reset();
  }

  // Toggle para expandir/colapsar variantes
  toggleVariants(productId: number): void {
    if (this.expandedProductId === productId) {
      this.expandedProductId = null;
    } else {
      this.expandedProductId = productId;
    }
  }

  isExpanded(productId: number): boolean {
    return this.expandedProductId === productId;
  }

  // Seleccionar producto SIMPLE (sin variantes)
  async selectProduct(product: Product) {
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(SelectProductQuantityDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark') ? ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                  ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      data: {
        title: product.productName,
        record: product,
        isPurchase: true
      },
    });

    await firstValueFrom(dialogRef.closed)
      .then(async (quantity: number) => {
        if(quantity){
          const record: ProductPurchaseSelect = {
            product: product,
            quantity: quantity,
            variantId: null
          }
          if (!this.products.some(p => p.product.id === record.product.id && !p.variantId)){
            this.products.push(record);
            this.changes.emit(this.products);
          }else{
            this.toast.info('El producto ya se encuentra en la lista');
          }
        }
      })
      .catch((error: any) => {
        this.toast.error(error.message);
      });
  }

  // Seleccionar VARIANTE específica
  async selectVariant(product: Product, variant: ProductVariant) {
    const darkmode = localStorage.getItem('theme');

    // Crear un producto temporal con los datos de la variante
    const variantAsProduct: Product = {
      ...product,
      id: product.id,
      productName: variant.variantName,
      sku: variant.sku,
      costPrice: variant.costPrice,
      salePrice: variant.salePrice,
      currentStock: variant.currentStock,
      minStock: variant.minStock,
      maxStock: variant.maxStock
    };

    const dialogRef = this.dialog.open(SelectProductQuantityDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark') ? ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                  ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      data: {
        title: variant.variantName,
        record: variantAsProduct,
        isPurchase: true
      },
    });

    await firstValueFrom(dialogRef.closed)
      .then(async (quantity: number) => {
        if(quantity){
          const record: ProductPurchaseSelect = {
            product: variantAsProduct,
            quantity: quantity,
            variantId: variant.id || null
          }

          // Verificar si esta variante específica ya está en la lista
          if (!this.products.some(p => p.product.id === product.id && p.variantId === variant.id)){
            this.products.push(record);
            this.changes.emit(this.products);
          }else{
            this.toast.info('Esta variante ya se encuentra en la lista');
          }
        }
      })
      .catch((error: any) => {
        this.toast.error(error.message);
      });
  }

  async viewProductsSelect(){
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(PurchasesProductsSelectListDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark') ? ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                  ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      disableClose: false,
      data: {
        title: 'Lista de productos',
        products: this.products
      },
    });

    await firstValueFrom(dialogRef.closed)
      .then(async (products: ProductPurchaseSelect[] | boolean) => {
        if(products && Array.isArray(products)){
          if((JSON.stringify(products) !== JSON.stringify(this.products))){
            this.products = [];
            this.products = products;
          }
        }else if(products === true){
          this.products = [];
        }
        this.changes.emit(this.products);
      });
  }

  finalizedPurchase(){
    this.finalized.emit(true);
  }

  // Helper para obtener el rango de precios de las variantes
  getVariantPriceRange(product: Product): string {
    if (!product.variants || product.variants.length === 0) return '';

    const prices = product.variants.map(v => v.costPrice);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) {
      return `Q ${min.toFixed(2)}`;
    }
    return `Desde Q ${min.toFixed(2)} hasta Q ${max.toFixed(2)}`;
  }

  // Helper para mostrar los atributos de una variante
  getVariantAttributesDisplay(variant: ProductVariant): string {
    if (!variant.attributes || Object.keys(variant.attributes).length === 0) {
      return '';
    }

    return Object.entries(variant.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }
}
