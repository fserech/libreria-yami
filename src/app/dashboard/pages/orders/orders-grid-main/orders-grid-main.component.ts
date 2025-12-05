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
import { matSearchOutline, matFilterAltOutline, matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline, matDeleteOutline, matEditOutline, matReceiptLongOutline, matRemoveRedEyeOutline, matLocalShippingOutline, matPersonOutline, matPlaylistAddCheckCircleOutline } from '@ng-icons/material-icons/outline';
import { NgClass } from '@angular/common';
import { ChatBubbleComponent } from '../../../../shared/components/chat-bubble/chat-bubble.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { SearchInputTextComponent } from '../../../../shared/components/search-input-text/search-input-text.component';
import { ACTIONS_GRID_MAIN_ORDERS_FINALIZED, ACTIONS_GRID_MAIN_ORDERS_IN_PROCESS, ACTIONS_GRID_MAIN_ORDERS_PENDING } from '../../../../shared/constants/actions-menu';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';
import moment from 'moment';
import 'moment/locale/es';
import { DELIVERY_TRANSPORTATION } from '../../../../shared/constants/panels';
import { Panel } from '../../../../shared/interfaces/panel';
import { OrdersStatus } from '../../../../shared/interfaces/orders-status';
import { STATUS_ORDERS } from '../../../../shared/constants/status-orders';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { DatePickerSearchComponent } from '../../../../shared/components/date-picker-search/date-picker-search.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MIN_DATE, MAX_DATE } from '../../../../shared/constants/date-min-max';
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
    matPersonOutline }) ]
})
export default class OrdersGridMainComponent extends BaseForm implements OnInit {

  form: FormGroup;
  actionsGridPending:  OptionsChatBubble[] = ACTIONS_GRID_MAIN_ORDERS_PENDING;
  actionsGridPrepared:  OptionsChatBubble[] = ACTIONS_GRID_MAIN_ORDERS_IN_PROCESS;
  actionsGridFinalized:  OptionsChatBubble[] = ACTIONS_GRID_MAIN_ORDERS_FINALIZED;
  minDate: Date = MIN_DATE;
  maxDate: Date = MAX_DATE;

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    public dialog: Dialog,
    private bpo: BreakpointObserver, private auth: AuthService,){
      super(crud, toast, auth, bpo);
      moment.locale('es');
      this.sortConfig.sortBy = 'dateCreated';
      this.sortConfig.sortOrder = 'desc';
      this.crud.baseUrl = URL_ORDERS;
      this.form = new FormGroup({
        id: new FormControl(),
        userId: new FormControl(),
        dateCreated: new FormControl({ value: '', disabled: true }, []),
        dateDeliver: new FormControl(),
        clientId: new FormControl(),
        status: new FormControl(),
        transportDelivery: new FormControl(),
      });
  }

  ngOnInit(): void {
    let filter = '';
    const dateInit: Date = new Date();
    const dateEnd: Date = new Date();
    dateInit.setHours(0, 0, 0, 0);
    dateEnd.setHours(23, 59, 59, 999);
    filter = filter.concat(`&dateCreatedInit=${dateInit.toISOString()}&dateCreatedEnd=${dateEnd.toISOString()}`);

    if(this.auth.getUserData().role === 'ROLE_USER'){
      filter = filter.concat(`&userId=${this.auth.getUserData().id}`);
      this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, filter);
    }else{
      this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, filter);
    }
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
        title: 'Filtros de pedidos'
      },
      });

      await firstValueFrom(dialogRef.closed)
      .then((result: {
        id: number,
        userId: number,
        clientId: number,
        status: string,
        transportDelivery: string,
        dateCreatedInit: Date,
        dateCreatedEnd: Date,
        dateDeliverInit: Date,
        dateDeliverEnd: Date,
      }) => {
        if(result){
          if(result.id  || result.userId || result.clientId || result.status || result.transportDelivery ||
            result.dateCreatedInit || result.dateCreatedEnd || result.dateDeliverInit || result.dateDeliverEnd){
            this.filter(result.id, result.userId, result.clientId, result.status, result.transportDelivery,
                        result.dateCreatedInit, result.dateCreatedEnd, result.dateDeliverInit, result.dateDeliverEnd);
          }
        }
      })
      .catch((error: any) => {
        console.log('err', error);
      });
  }

  initPage(){
    let filter = '';
    const dateInit: Date = new Date();
    const dateEnd: Date = new Date();
    dateInit.setHours(0, 0, 0, 0);
    dateEnd.setHours(23, 59, 59, 999);
    filter = filter.concat(`&dateCreatedInit=${dateInit.toISOString()}&dateCreatedEnd=${dateEnd.toISOString()}`);

    if(this.auth.getUserData().role === 'ROLE_USER'){
      filter = filter.concat(`&userId=${this.auth.getUserData().id}`);
      this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, 1, 10, filter);
    }else{
      this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, 1, 10, filter);
    }
    this.form.reset();
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
  }

  edit(id: number){
    this.router.navigate([`/dashboard/orders/detail/edit/${id}`]);
  }

  add(){
    this.router.navigate([`/dashboard/orders/detail/new`]);
  }

  filter(id?: number, userId?: number, clientId?: number, status?: string, transportDelivery?: string,
         dateCreatedInit?: Date, dateCreatedEnd?: Date, dateDeliverInit?: Date, dateDeliverEnd?: Date){

    this.crud.baseUrl = URL_ORDERS;
    let filter = '';

    if(id){
      filter = filter.concat(`&id=${id}`)
    }

    if(userId && this.auth.getUserData().role === 'ROLE_ADMIN'){
      filter = filter.concat(`&userId=${userId}`);
    }else if(!userId && this.auth.getUserData().role === 'ROLE_USER'){
      filter = filter.concat(`&userId=${this.auth.getUserData().id}`);
    }

    if(clientId){
      filter = filter.concat(`&clientId=${clientId}`)
    }

    if(status){
      filter = filter.concat(`&status=${status}`)
    }

    if(transportDelivery){
      filter = filter.concat(`&transportDelivery=${transportDelivery}`)
    }

    if(dateCreatedInit && dateCreatedEnd){
      const init: Date = new Date(dateCreatedInit);
      const end: Date = new Date(dateCreatedEnd);
      init.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      filter = filter.concat(`&dateCreatedInit=${init.toISOString()}&dateCreatedEnd=${end.toISOString()}`);
    }else{
      const dateInit: Date = new Date();
      const dateEnd: Date = new Date();
      dateInit.setHours(0, 0, 0, 0);
      dateEnd.setHours(23, 59, 59, 999);
      filter = filter.concat(`&dateCreatedInit=${dateInit.toISOString()}&dateCreatedEnd=${dateEnd.toISOString()}`);
    }

    if(dateDeliverInit && dateDeliverEnd){
      const initD: Date = new Date(dateDeliverInit);
      const endD: Date = new Date(dateDeliverEnd);
      initD.setHours(0, 0, 0, 0);
      endD.setHours(23, 59, 59, 999);
      filter = filter.concat(`&dateDeliverInit=${initD.toISOString()}&dateDeliverEnd=${endD.toISOString()}`);
    }

    this.filters = filter;
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, filter);
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

  formatDate(dateString: string): string {
    return moment(dateString).format('dddd, D [de] MMMM [de] YYYY, h:mm:ss a');
  }

  formatDateNotHour(dateString: string): string {
    return moment(dateString).format('dddd, D [de] MMMM [de] YYYY');
  }

  getValuePanel(key: 'P1' | 'P2'): string {
    return DELIVERY_TRANSPORTATION.find((item: Panel) => item.key === key).label;
  }

  getStatus(key: string): string{
    return STATUS_ORDERS.find((item: OrdersStatus) => item.key === key).label;
  }

  async finalizedOrder(id: number){
    this.load = true;
    this.toast.confirm('¿Seguro que desea finalizar el pedido?', null, null, 'El registro se finalizará de forma permanente.', 'question')
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
          this.ngOnInit();
          this.load = false;
        });
      }
      this.load = false;
    });
  }

  async cancelOrder(id: number){

    this.load = true;
    this.toast.confirm('¿Seguro que desea anular el pedido?', null, null, 'El registro se anulará de forma permanente.', 'question')
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
          this.ngOnInit();
          this.load = false;
        });
      }
      this.load = false;
    });

  }

  formatDateToISOString(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  view(id:number){
    this.router.navigate([`/dashboard/orders/view/${id}`]);
  }

  printReceipt(id: number){}

  changeDateCreated(ev:MatDatepickerInputEvent<Date>){
  }
}
