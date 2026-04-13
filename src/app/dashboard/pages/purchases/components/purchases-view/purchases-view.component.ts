import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { ToastService } from '../../../../../shared/services/toast.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CrudService } from '../../../../../shared/services/crud.service';
import BaseForm from '../../../../../shared/classes/base-form';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matArrowBackOutline, matCalendarMonthOutline, matCalendarTodayOutline, matCancelOutline, matEditAttributesOutline, matLocationOnOutline, matPersonOutlineOutline } from '@ng-icons/material-icons/outline';
import { URL_PURCHASES } from '../../../../../shared/constants/endpoints';
import { firstValueFrom } from 'rxjs';
import { Purchase, ProductPurchase } from '../../../../../shared/interfaces/purchase';
import { Supplier } from '../../../../../shared/interfaces/supplier';
import moment from 'moment';
import 'moment/locale/es';
import { bootstrapCalculator, bootstrapCheckCircleFill, bootstrapClockFill, bootstrapShop } from '@ng-icons/bootstrap-icons';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-purchases-view',
  standalone: true,
  imports: [HeaderComponent, NgIconComponent, NgClass],
  templateUrl: './purchases-view.component.html',
  styleUrl: './purchases-view.component.scss',
  viewProviders: [ provideIcons({
    matArrowBackOutline, bootstrapCheckCircleFill, bootstrapClockFill, bootstrapShop,
    matLocationOnOutline, bootstrapCalculator, matCalendarMonthOutline, matPersonOutlineOutline,
    matEditAttributesOutline, matCancelOutline, matCalendarTodayOutline })],
  providers: [DecimalPipe]
})
export default class PurchasesViewComponent extends BaseForm implements OnInit{
  purchase: Purchase;
  supplier: Supplier;
  products: ProductPurchase[];
  darkmode: string = '';

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private bpo: BreakpointObserver,
    private decimalPipe: DecimalPipe,
  ){
    super(crud, toast, auth, bpo);
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.crud.baseUrl = URL_PURCHASES;
    moment.locale('es');
    this.darkmode = localStorage.getItem('theme');
  }

ngOnInit(): void {
  this.load = true;
  firstValueFrom(this.crud.getId(this.id))
    .then((purchase: any) => { 

      this.purchase = purchase;
      this.supplier = purchase.supplier;
      this.products = purchase.products;
    })
    .catch((error: any) => {
      
      this.toast.error('Error al cargar la compra');
    })
    .finally(() => {
      this.load = false;
    });
}
  async back() {
    this.router.navigate(['dashboard/purchases']);
  }

  formatDate(dateString: string): string {
    return moment(dateString).format('dddd, D [de] MMMM [de] YYYY, h:mm:ss a');
  }

  formatDateNotHour(dateString: string): string {
    return moment(dateString).format('dddd, D [de] MMMM [de] YYYY');
  }

  calculateTotal(): string {
    if(this.products?.length > 0){
      const total = this.products.reduce((acc, product) => acc + product.subtotal, 0);
      return this.formatCurrency(total);
    }
    return this.formatCurrency(0);
  }

  formatCurrency(value: number): string {
    return this.decimalPipe.transform(value, '1.2-2') || '0.00';
  }

  formatCurrencySring(value: string): string {
    return this.decimalPipe.transform(Number(value), '1.2-2') || '0.00';
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'PENDING': return 'Pendiente';
      case 'COMPLETED': return 'Completada';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  }

  /**
   * ⭐ Obtiene el nombre del producto manejando diferentes formatos del backend
   */
  getProductName(item: ProductPurchase): string {
    if (!item || !item.product) {
      return 'Sin nombre';
    }

    // Intentar obtener el nombre de diferentes propiedades
    const product = item.product as any;
    return product.productName || product.name || 'Sin nombre';
  }

  /**
   * ⭐ Obtiene el SKU del producto manejando diferentes formatos del backend
   */
  getProductSku(item: ProductPurchase): string | null {
    if (!item || !item.product) {
      return null;
    }

    const product = item.product as any;
    return product.sku || null;
  }


  getSupplierName(): string {
  if (!this.supplier) {
    return 'Sin nombre';
  }

  const supplier = this.supplier as any;
  return supplier.supplierName || supplier.name || 'Sin nombre';
}




}
