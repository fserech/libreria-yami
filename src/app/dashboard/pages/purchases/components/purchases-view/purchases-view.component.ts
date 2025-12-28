import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { ToastService } from '../../../../../shared/services/toast.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CrudService } from '../../../../../shared/services/crud.service';
import BaseForm from '../../../../../shared/classes/base-form';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matArrowBackOutline,
  matCalendarMonthOutline,
  matCancelOutline,
  matEditAttributesOutline,
  matLocationOnOutline,
  matPersonOutlineOutline,
  matPhoneOutline
} from '@ng-icons/material-icons/outline';
import { URL_PURCHASES } from '../../../../../shared/constants/endpoints';
import { firstValueFrom } from 'rxjs';
import { Purchase, ProductPurchase } from '../../../../../shared/interfaces/purchase';
import { Supplier } from '../../../../../shared/interfaces/supplier';
import moment from 'moment';
import 'moment/locale/es';
import { bootstrapCalculator, bootstrapCheckCircleFill, bootstrapClockFill, bootstrapTruck } from '@ng-icons/bootstrap-icons';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-purchases-view',
  standalone: true,
  imports: [HeaderComponent, NgIconComponent, NgClass],
  templateUrl: './purchases-view.component.html',
  styleUrl: './purchases-view.component.scss',
  viewProviders: [
    provideIcons({
      matArrowBackOutline,
      bootstrapCheckCircleFill,
      bootstrapClockFill,
      bootstrapTruck,
      matLocationOnOutline,
      bootstrapCalculator,
      matCalendarMonthOutline,
      matPersonOutlineOutline,
      matEditAttributesOutline,
      matCancelOutline,
      matPhoneOutline
    })
  ],
  providers: [DecimalPipe]
})
export default class PurchasesViewComponent extends BaseForm implements OnInit {

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
  ) {
    super(crud, toast, auth, bpo);
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.crud.baseUrl = URL_PURCHASES;
    moment.locale('es');
    this.darkmode = localStorage.getItem('theme') || '';
  }

  ngOnInit(): void {
    this.mode = 'view';
    this.load = true;

    firstValueFrom(this.crud.getId(this.id))
      .then((purchase: any) => {
        this.purchase = purchase;
        this.supplier = purchase.supplier;
        this.products = purchase.products || [];
      })
      .catch((error: any) => {
        console.log('Error al cargar compra: ', error);
        this.toast.error('Error al cargar los detalles de la compra');
      })
      .finally(() => {
        this.load = false;
      });
  }

  async back() {
    this.router.navigate(['dashboard/purchases']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return moment(dateString).format('dddd, D [de] MMMM [de] YYYY, h:mm:ss a');
  }

  formatDateNotHour(dateString: string): string {
    if (!dateString) return 'N/A';
    return moment(dateString).format('dddd, D [de] MMMM [de] YYYY');
  }

  calculateTotal(): string {
    if (this.products?.length > 0) {
      const total = this.products.reduce((acc, item) => acc + item.subtotal, 0);
      return this.formatCurrency(total);
    }
    return this.formatCurrency(0);
  }

  formatCurrency(value: number): string {
    return this.decimalPipe.transform(value, '1.2-2') || '0.00';
  }

  formatCurrencyString(value: string): string {
    return this.decimalPipe.transform(Number(value), '1.2-2') || '0.00';
  }
}
