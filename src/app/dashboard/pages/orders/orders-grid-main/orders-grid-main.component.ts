import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import BaseForm from '../../../../shared/classes/base-form';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../../../../shared/services/auth.service';
import { URL_ORDERS } from '../../../../shared/constants/endpoints';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { OrdersFiltersDialogComponent } from '../orders-filters-dialog/orders-filters-dialog.component';
import { firstValueFrom } from 'rxjs';
import { OptionsChatBubble } from '../../../../shared/interfaces/options-chat-bubble';
import { bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight, bootstrapXCircle, bootstrapBoxSeam, bootstrapCheckCircleFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matSearchOutline, matFilterAltOutline, matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline, matDeleteOutline, matEditOutline, matReceiptLongOutline, matRemoveRedEyeOutline, matLocalShippingOutline, matPersonOutline, matPlaylistAddCheckCircleOutline, matShoppingBagOutline } from '@ng-icons/material-icons/outline';
import { NgClass } from '@angular/common';
import { ChatBubbleComponent } from '../../../../shared/components/chat-bubble/chat-bubble.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { SearchInputTextComponent } from '../../../../shared/components/search-input-text/search-input-text.component';
import { ACTIONS_GRID_MAIN_ORDERS_FINALIZED, ACTIONS_GRID_MAIN_ORDERS_IN_PROCESS, ACTIONS_GRID_MAIN_ORDERS_PENDING } from '../../../../shared/constants/actions-menu';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';
import moment from 'moment';
import 'moment/locale/es';
import { OrdersStatus } from '../../../../shared/interfaces/orders-status';
import { STATUS_ORDERS } from '../../../../shared/constants/status-orders';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { DatePickerSearchComponent } from '../../../../shared/components/date-picker-search/date-picker-search.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MIN_DATE, MAX_DATE } from '../../../../shared/constants/date-min-max';
import { ReportsReceiptsService } from '../../../../shared/services/reports-receipts.service'; // ✅ IMPORTAR

@Component({
  selector: 'app-orders-grid-main',
  standalone: true,
  imports: [HeaderComponent, SearchInputTextComponent, NgIcon, DatePickerSearchComponent,
    ChatBubbleComponent, NgClass, DialogModule, FormsModule, SelectSearchComponent, DatePickerComponent],
  templateUrl: './orders-grid-main.component.html',
  styleUrl: './orders-grid-main.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  viewProviders: [ provideIcons({ matSearchOutline, matFilterAltOutline, matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline,
    matDeleteOutline, matEditOutline, bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight,
    matReceiptLongOutline, bootstrapXCircle, bootstrapBoxSeam, bootstrapCheckCircleFill, matRemoveRedEyeOutline, matLocalShippingOutline,
    matPersonOutline,matShoppingBagOutline }) ]
})
export default class OrdersGridMainComponent extends BaseForm implements OnInit {

  form: FormGroup;
  actionsGridPending:  OptionsChatBubble[] = ACTIONS_GRID_MAIN_ORDERS_PENDING;
  actionsGridPrepared:  OptionsChatBubble[] = ACTIONS_GRID_MAIN_ORDERS_IN_PROCESS;
  actionsGridFinalized:  OptionsChatBubble[] = ACTIONS_GRID_MAIN_ORDERS_FINALIZED;
  minDate: Date = MIN_DATE;
  maxDate: Date = MAX_DATE;

  activeTimeTab: 'day' | 'week' | 'month' = 'month';

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    public dialog: Dialog,
    private bpo: BreakpointObserver,
    private auth: AuthService,
    private reportsService: ReportsReceiptsService // ✅ INYECTAR SERVICIO
  ){
      super(crud, toast, auth, bpo);
      moment.locale('es');
      this.sortConfig.sortBy = 'dateCreated';
      this.sortConfig.sortOrder = 'desc';
      this.crud.baseUrl = URL_ORDERS;
      this.form = new FormGroup({
        id: new FormControl(),
        userId: new FormControl(),
        dateCreated: new FormControl({ value: '', disabled: true }, []),
        clientId: new FormControl(),
        status: new FormControl(),
        idBranch: new FormControl(),
      });
  }

  ngOnInit(): void {
    this.loadOrdersByTimeRange(this.activeTimeTab);
  }

  setActiveTimeTab(tab: 'day' | 'week' | 'month') {
    this.activeTimeTab = tab;
    this.loadOrdersByTimeRange(tab);
  }

  loadOrdersByTimeRange(timeRange: 'day' | 'week' | 'month') {
    let filter = '';
    const dateInit: Date = new Date();
    const dateEnd: Date = new Date();

    switch (timeRange) {
      case 'day':
        dateInit.setHours(0, 0, 0, 0);
        dateEnd.setHours(23, 59, 59, 999);
        break;

      case 'week':
        const dayOfWeek = dateInit.getDay();
        const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
        dateInit.setDate(dateInit.getDate() + diffToMonday);
        dateInit.setHours(0, 0, 0, 0);
        dateEnd.setDate(dateInit.getDate() + 6);
        dateEnd.setHours(23, 59, 59, 999);
        break;

      case 'month':
        dateInit.setDate(1);
        dateInit.setHours(0, 0, 0, 0);
        dateEnd.setMonth(dateEnd.getMonth() + 1);
        dateEnd.setDate(0);
        dateEnd.setHours(23, 59, 59, 999);
        break;
    }

    filter = filter.concat(`&dateCreatedInit=${dateInit.toISOString()}&dateCreatedEnd=${dateEnd.toISOString()}`);

    if(this.auth.getUserData().role === 'ROLE_USER'){
      filter = filter.concat(`&userId=${this.auth.getUserData().id}`);
    }

    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, filter);
  }

  async openDialog() {
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(OrdersFiltersDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark') ?
                  ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                  ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      data: {
        title: 'Filtros de ventas'
      },
    });

    await firstValueFrom(dialogRef.closed)
    .then((result: {
      id: number,
      userId: number,
      clientId: number,
      status: string,
      idBranch: number,
      dateCreatedInit: Date,
      dateCreatedEnd: Date,
    }) => {
      if(result){
        if(result.id  || result.userId || result.clientId || result.status || result.idBranch ||
          result.dateCreatedInit || result.dateCreatedEnd){
          this.filter(result.id, result.userId, result.clientId, result.status, result.idBranch,
                      result.dateCreatedInit, result.dateCreatedEnd);
        }
      }
    })
    .catch((error: any) => {
      console.log('err', error);
    });
  }

  selectOption(option: OptionsChatBubble){
    if(option.action === 'VIEW_ORDER'){
      this.view(option.id);
    }

    if(option.action === 'FINALIZED'){
      this.finalizedOrder(option.id);
    }

    if(option.action === 'CANCEL'){
      this.cancelOrder(option.id);
    }

    // ✅✅✅ NUEVA ACCIÓN PARA IMPRIMIR RECIBO ✅✅✅
    if(option.action === 'PRINT_RECEIPT'){
      this.printReceipt(option.id);
    }
  }

  edit(id: number){
    this.router.navigate([`/dashboard/orders/detail/edit/${id}`]);
  }

  add(){
    this.router.navigate([`/dashboard/orders/detail/new`]);
  }

  filter(id?: number, userId?: number, clientId?: number, status?: string, idBranch?: number,
       dateCreatedInit?: Date, dateCreatedEnd?: Date){

    this.crud.baseUrl = URL_ORDERS;
    let filter = '';

    const dateInit: Date = new Date();
    const dateEnd: Date = new Date();

    switch (this.activeTimeTab) {
      case 'day':
        dateInit.setHours(0, 0, 0, 0);
        dateEnd.setHours(23, 59, 59, 999);
        break;

      case 'week':
        const dayOfWeek = dateInit.getDay();
        const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
        dateInit.setDate(dateInit.getDate() + diffToMonday);
        dateInit.setHours(0, 0, 0, 0);
        dateEnd.setDate(dateInit.getDate() + 6);
        dateEnd.setHours(23, 59, 59, 999);
        break;

      case 'month':
        dateInit.setDate(1);
        dateInit.setHours(0, 0, 0, 0);
        dateEnd.setMonth(dateEnd.getMonth() + 1);
        dateEnd.setDate(0);
        dateEnd.setHours(23, 59, 59, 999);
        break;
    }

    if(dateCreatedInit && dateCreatedEnd){
      const init: Date = new Date(dateCreatedInit);
      const end: Date = new Date(dateCreatedEnd);
      init.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      filter = filter.concat(`&dateCreatedInit=${init.toISOString()}&dateCreatedEnd=${end.toISOString()}`);
    } else {
      filter = filter.concat(`&dateCreatedInit=${dateInit.toISOString()}&dateCreatedEnd=${dateEnd.toISOString()}`);
    }

    if(id){
      filter = filter.concat(`&id=${id}`)
    }

    if(userId && this.auth.getUserData().role === 'ROLE_ADMIN'){
      filter = filter.concat(`&userId=${userId}`);
    }else if(this.auth.getUserData().role === 'ROLE_USER'){
      filter = filter.concat(`&userId=${this.auth.getUserData().id}`);
    }

    if(clientId){
      filter = filter.concat(`&clientId=${clientId}`)
    }

    if(status){
      filter = filter.concat(`&status=${status}`)
    }

    if(idBranch){
      filter = filter.concat(`&idBranch=${idBranch}`)
    }

    this.filters = filter;
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, filter);
  }

  initPage(){
    this.form.reset();
    this.filters = '';
    this.loadOrdersByTimeRange(this.activeTimeTab);
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

  formatDateNotHour(dateString: string): string {
    return moment(dateString).format('dddd, D [de] MMMM [de] YYYY');
  }

  getStatus(key: string): string{
    return STATUS_ORDERS.find((item: OrdersStatus) => item.key === key)?.label || 'Desconocido';
  }

  async finalizedOrder(id: number){
    this.load = true;
    this.toast.confirm('¿Seguro que desea finalizar la venta?', null, null, 'El registro se finalizará de forma permanente.', 'question')
    .then(async (result) => {
      if (result.isConfirmed) {
        await firstValueFrom(this.crud.updateId(id, { id: id, status: 'FINALIZED' }))
        .then((response: any) => {
          this.toast.success(response.message);
          this.load = false;
        })
        .catch((error: any) => {
          this.toast.error(error.message);
          this.load = false;
        })
        .finally(() => {
          this.loadOrdersByTimeRange(this.activeTimeTab);
          this.load = false;
        });
      }
      this.load = false;
    });
  }

  async cancelOrder(id: number){
    this.load = true;
    this.toast.confirm('¿Seguro que desea anular la venta?', null, null, 'El registro se anulará de forma permanente.', 'question')
    .then(async (result) => {
      if (result.isConfirmed) {
        await firstValueFrom(this.crud.updateId(id, { id: id, status: 'CANCEL' }))
        .then((response: any) => {
          this.toast.success(response.message);
          this.load = false;
        })
        .catch((error: any) => {
          this.toast.error(error.message);
          this.load = false;
        })
        .finally(() => {
          this.loadOrdersByTimeRange(this.activeTimeTab);
          this.load = false;
        });
      }
      this.load = false;
    });
  }

  view(id:number){
    this.router.navigate([`/dashboard/orders/view/${id}`]);
  }

  // ✅✅✅ IMPLEMENTACIÓN DE printReceipt ✅✅✅
  async printReceipt(orderId: number) {
    console.log('=== IMPRIMIENDO RECIBO ===');
    console.log('Order ID:', orderId);

    this.load = true;

    try {
      // Obtener la orden para verificar sus datos
      const order = this.ItemsList.find((o: any) => o.id === orderId);

      if (!order) {
        this.toast.error('No se encontró la orden');
        this.load = false;
        return;
      }

      console.log('Orden encontrada:', order);

      // Generar el reporte usando el servicio
      // NOTA: El backend espera order_id como parámetro
      await firstValueFrom(
        this.reportsService.getReceiptByOrderId(orderId)
      )
      .then((blob: Blob) => {
        console.log('✅ PDF recibido, tamaño:', blob.size);

        // Crear URL del blob
        const url = window.URL.createObjectURL(blob);

        // Abrir en nueva ventana para imprimir
        const printWindow = window.open(url, '_blank');

        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }

        // Limpiar URL después de 1 minuto
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 60000);

        this.toast.success('Recibo generado correctamente');
        this.load = false;
      })
      .catch((error: any) => {
        console.error('❌ Error al generar recibo:', error);
        this.toast.error('Error al generar el recibo: ' + (error.message || 'Error desconocido'));
        this.load = false;
      });

    } catch (error: any) {
      console.error('❌ Error inesperado:', error);
      this.toast.error('Error al procesar la solicitud');
      this.load = false;
    }
  }

  changeDateCreated(ev:MatDatepickerInputEvent<Date>){}
}
