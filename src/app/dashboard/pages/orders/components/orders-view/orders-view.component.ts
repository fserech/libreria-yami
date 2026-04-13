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
  matEditAttributesOutline,
  matLocationOnOutline,
  matPersonOutlineOutline,
  matEditOutline,
  matVisibilityOutline
} from '@ng-icons/material-icons/outline';
import { URL_ORDERS } from '../../../../../shared/constants/endpoints';
import { firstValueFrom } from 'rxjs';
import { Order, ProductOrder } from '../../../../../shared/interfaces/order';
import { Client } from '../../../../../shared/interfaces/client';
import moment from 'moment';
import 'moment/locale/es';
import { bootstrapCalculator, bootstrapCheckCircleFill, bootstrapClockFill, bootstrapShop } from '@ng-icons/bootstrap-icons';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-orders-view',
  standalone: true,
  imports: [
    HeaderComponent,
    NgIconComponent,
    NgClass
  ],
  templateUrl: './orders-view.component.html',
  styleUrl: './orders-view.component.scss',
  viewProviders: [provideIcons({
    matArrowBackOutline,
    bootstrapCheckCircleFill,
    bootstrapClockFill,
    bootstrapShop,
    matLocationOnOutline,
    bootstrapCalculator,
    matCalendarMonthOutline,
    matPersonOutlineOutline,
    matEditAttributesOutline,
    matEditOutline,
    matVisibilityOutline
  })],
  providers: [DecimalPipe]
})
export default class OrdersViewComponent extends BaseForm implements OnInit {
  order: Order;
  client: Client;
  products: ProductOrder[];
  darkmode: string = '';

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private bpo: BreakpointObserver,
    private decimalPipe: DecimalPipe
  ) {
    super(crud, toast, auth, bpo);
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.crud.baseUrl = URL_ORDERS;
    moment.locale('es');
    this.darkmode = localStorage.getItem('theme');
  }

  ngOnInit(): void {
    this.loadOrder();
  }

  // Verificar si la venta está finalizada
  get isFinalized(): boolean {
    return this.order?.status === 'FINALIZED';
  }

  // Verificar si se puede editar
  get canEdit(): boolean {
    return !this.isFinalized;
  }

  // Cargar la orden
  loadOrder() {
    this.load = true;
    firstValueFrom(this.crud.getId(this.id))
      .then((order: any) => {
        this.order = order;
        this.client = order.client;
        this.products = order.products;
      })
      .catch((error: any) => {
        console.error('Error al cargar la orden:', error);
        this.toast.error('Error', 'No se pudo cargar la información de la venta');
      })
      .finally(() => {
        this.load = false;
      });
  }

  // Navegar a edición completa
  async enableEditMode() {
  if (this.isFinalized) {
    this.toast.warning('Venta finalizada', 'No se puede editar una venta finalizada');
    return;
  }

  // ✅ Navegación correcta a la ruta de edición

  this.router.navigate([`/dashboard/orders/detail/edit/${this.id}`]);
}

  // Regresar a la lista (SIN validación de cambios)
  async back() {
    this.router.navigate(['dashboard/orders']);
  }

  formatDate(dateString: string): string {
    return moment(dateString).format('dddd, D [de] MMMM [de] YYYY, h:mm:ss a');
  }

  formatDateNotHour(dateString: string): string {
    return moment(dateString).format('dddd, D [de] MMMM [de] YYYY');
  }

  calculateTotal(): string {
    if (this.products?.length > 0) {
      const total = this.products.reduce((acc, order) => acc + order.subtotal, 0);
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
}
