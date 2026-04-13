import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import BaseForm from '../../../../shared/classes/base-form';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../../../../shared/services/auth.service';
import { URL_PURCHASES } from '../../../../shared/constants/endpoints';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { OptionsChatBubble } from '../../../../shared/interfaces/options-chat-bubble';
import { bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight, bootstrapXCircle, bootstrapBoxSeam, bootstrapCheckCircleFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matSearchOutline, matFilterAltOutline, matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline, matDeleteOutline, matEditOutline, matReceiptLongOutline, matRemoveRedEyeOutline, matLocalShippingOutline, matPersonOutline, matPlaylistAddCheckCircleOutline, matShoppingBagOutline, matCalendarTodayOutline } from '@ng-icons/material-icons/outline';
import { NgClass } from '@angular/common';
import { ChatBubbleComponent } from '../../../../shared/components/chat-bubble/chat-bubble.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { SearchInputTextComponent } from '../../../../shared/components/search-input-text/search-input-text.component';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';
import moment from 'moment';
import 'moment/locale/es';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { DatePickerSearchComponent } from '../../../../shared/components/date-picker-search/date-picker-search.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MIN_DATE, MAX_DATE } from '../../../../shared/constants/date-min-max';
import { ACTIONS_GRID_MAIN_PURCHASES_COMPLETED, ACTIONS_GRID_MAIN_PURCHASES_PENDING, ACTIONS_GRID_MAIN_PURCHASES_RECEIVED } from '../../../../shared/constants/actions-menu';
import { PurchasesFilterDialogComponent } from '../purchases-filter-dialog/purchases-filter-dialog.component';
import { PurchaseStatus } from '../../../../shared/interfaces/purchases-status';
import { STATUS_PURCHASES } from '../../../../shared/constants/status-purchases';

@Component({
  selector: 'app-purchases-grid-main',
  standalone: true,
  imports: [HeaderComponent, SearchInputTextComponent, NgIcon, DatePickerSearchComponent,
    ChatBubbleComponent, NgClass, DialogModule, FormsModule, SelectSearchComponent, DatePickerComponent],
  templateUrl: './purchase-grid-main.component.html',
  styleUrl: './purchase-grid-main.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  viewProviders: [ provideIcons({ matSearchOutline, matFilterAltOutline, matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline,
    matDeleteOutline, matEditOutline, bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight,
    matReceiptLongOutline, bootstrapXCircle, bootstrapBoxSeam, bootstrapCheckCircleFill, matRemoveRedEyeOutline, matLocalShippingOutline,
    matPersonOutline, matShoppingBagOutline, matCalendarTodayOutline }) ]
})
export default class PurchaseGridMainComponent extends BaseForm implements OnInit {

  form: FormGroup;
  actionsGridPending:  OptionsChatBubble[] = ACTIONS_GRID_MAIN_PURCHASES_PENDING;
  actionsGridPrepared:  OptionsChatBubble[] = ACTIONS_GRID_MAIN_PURCHASES_RECEIVED;
  actionsGridFinalized:  OptionsChatBubble[] = ACTIONS_GRID_MAIN_PURCHASES_COMPLETED;
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
  ){
    super(crud, toast, auth, bpo);
    moment.locale('es');
    this.sortConfig.sortBy = 'dateCreated';
    this.sortConfig.sortOrder = 'desc';
    this.crud.baseUrl = URL_PURCHASES;

    // ✅ Inicializar page
    this.page = 1;
    this.pageSize = 10;

    this.form = new FormGroup({
      id: new FormControl(),
      userId: new FormControl(),
      dateCreated: new FormControl({ value: '', disabled: true }, []),
      supplierId: new FormControl(),
      status: new FormControl(),
      idBranch: new FormControl(),
    });
  }

  ngOnInit(): void {
    // ✅ Asegurar que page esté inicializado
    if (!this.page || this.page === undefined) {
      this.page = 1;
    }
    this.loadPurchasesByTimeRange(this.activeTimeTab);
  }

  setActiveTimeTab(tab: 'day' | 'week' | 'month') {
    this.activeTimeTab = tab;
    this.page = 1; // ✅ Reset a página 1
    this.loadPurchasesByTimeRange(tab);
  }

  loadPurchasesByTimeRange(timeRange: 'day' | 'week' | 'month') {
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

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    filter = `&dateCreatedInit=${formatDate(dateInit)}&dateCreatedEnd=${formatDate(dateEnd)}`;

    if(this.auth.getUserData().role === 'ROLE_USER'){
      filter = filter.concat(`&userId=${this.auth.getUserData().id}`);
    }

    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, filter);
  }

  async openDialog() {
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(PurchasesFilterDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark') ?
                  ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                  ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      data: {
        title: 'Filtros de compras'
      },
    });

    await firstValueFrom(dialogRef.closed)
      .then((result: {
        id: number,
        userId: number,
        supplierId: number,
        status: string,
        idBranch: number,
        dateCreatedInit: Date,
        dateCreatedEnd: Date,
      }) => {
        if(result){
          if(result.id || result.userId || result.supplierId || result.status || result.idBranch ||
            result.dateCreatedInit || result.dateCreatedEnd){
            this.filter(result.id, result.userId, result.supplierId, result.status, result.idBranch,
                        result.dateCreatedInit, result.dateCreatedEnd);
          }
        }
      })
      .catch((error: any) => {
        this.toast.error('Error al aplicar filtros');
      });
  }

  selectOption(option: OptionsChatBubble){
    if(option.action === 'VIEW_PURCHASE'){
      this.view(option.id);
    }

    if(option.action === 'COMPLETED'){
      this.completePurchase(option.id);
    }

    if(option.action === 'RECEIVED'){
      this.receivePurchase(option.id);
    }

    if(option.action === 'CANCEL'){
      this.cancelPurchase(option.id);
    }
  }

  edit(id: number){
    this.router.navigate([`/dashboard/purchases/detail/edit/${id}`]);
  }

  add(){
    this.router.navigate([`/dashboard/purchases/detail/new`]);
  }

  filter(id?: number, userId?: number, supplierId?: number, status?: string, idBranch?: number,
       dateCreatedInit?: Date, dateCreatedEnd?: Date){

    this.crud.baseUrl = URL_PURCHASES;
    let filter = '';

    if(id){
      filter = filter.concat(`&id=${id}`)
    }

    if(userId && this.auth.getUserData().role === 'ROLE_ADMIN'){
      filter = filter.concat(`&userId=${userId}`);
    }else if(!userId && this.auth.getUserData().role === 'ROLE_USER'){
      filter = filter.concat(`&userId=${this.auth.getUserData().id}`);
    }

    if(supplierId){
      filter = filter.concat(`&supplierId=${supplierId}`)
    }

    if(status){
      filter = filter.concat(`&status=${status}`)
    }

    if(idBranch){
      filter = filter.concat(`&idBranch=${idBranch}`)
    }

    if(dateCreatedInit && dateCreatedEnd){
      const init: Date = new Date(dateCreatedInit);
      const end: Date = new Date(dateCreatedEnd);
      init.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      filter = filter.concat(`&dateCreatedInit=${formatDate(init)}&dateCreatedEnd=${formatDate(end)}`);
    } else if(!id && !supplierId && !status && !idBranch) {
      this.loadPurchasesByTimeRange(this.activeTimeTab);
      return;
    }

    this.filters = filter;
    this.page = 1; // ✅ Reset a página 1
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, filter);
  }

  initPage(){
    this.form.reset();
    this.filters = '';
    this.page = 1; // ✅ Reset a página 1
    this.loadPurchasesByTimeRange(this.activeTimeTab);
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
    return STATUS_PURCHASES.find((item: PurchaseStatus) => item.key === key)?.label || 'Desconocido';
  }

  // ✅ NUEVO: Marcar como RECEIVED (Recibida pero no completada)
  async receivePurchase(id: number){
    this.load = true;
    this.toast.confirm(
      '¿Seguro que desea marcar la compra como recibida?',
      null,
      null,
      'La compra se marcará como recibida pero aún no se actualizará el inventario.',
      'question'
    )
      .then(async (result) => {
        if (result.isConfirmed) {
          await firstValueFrom(this.crud.updateId(id, {
            id: id,
            status: 'RECEIVED'
          }))
            .then((response: any) => {
              this.toast.success(response.message);
              this.load = false;
            })
            .catch((error: any) => {
              this.toast.error(error.message);
              this.load = false;
            })
            .finally(() => {
              this.page = 1; // ✅ Reset a página 1
              this.loadPurchasesByTimeRange(this.activeTimeTab);
              this.load = false;
            });
        }
        this.load = false;
      });
  }

  // ✅ Completar compra (actualiza inventario y registra fecha)
  async completePurchase(id: number){
    this.load = true;

    const today = new Date();
    const deliveryDate = today.toISOString().split('T')[0];

    this.toast.confirm(
      '¿Seguro que desea completar la compra?',
      null,
      null,
      `La compra se marcará como completada, se actualizará el inventario y se registrará la fecha de entrega como: ${this.formatDateNotHour(deliveryDate)}`,
      'question'
    )
      .then(async (result) => {
        if (result.isConfirmed) {
          await firstValueFrom(this.crud.updateId(id, {
            id: id,
            status: 'COMPLETED',
            deliveryDate: deliveryDate
          }))
            .then((response: any) => {
              this.toast.success(response.message);
              this.load = false;
            })
            .catch((error: any) => {
              this.toast.error(error.message);
              this.load = false;
            })
            .finally(() => {
              this.page = 1; // ✅ Reset a página 1
              this.loadPurchasesByTimeRange(this.activeTimeTab);
              this.load = false;
            });
        }
        this.load = false;
      });
  }

  async cancelPurchase(id: number){
    this.load = true;
    this.toast.confirm(
      '¿Seguro que desea cancelar la compra?',
      null,
      null,
      'La compra se cancelará de forma permanente.',
      'question'
    )
      .then(async (result) => {
        if (result.isConfirmed) {
          await firstValueFrom(this.crud.updateId(id, {
            id: id,
            status: 'CANCELLED'
          }))
            .then((response: any) => {
              this.toast.success(response.message);
              this.load = false;
            })
            .catch((error: any) => {
              this.toast.error(error.message);
              this.load = false;
            })
            .finally(() => {
              this.page = 1; // ✅ Reset a página 1
              this.loadPurchasesByTimeRange(this.activeTimeTab);
              this.load = false;
            });
        }
        this.load = false;
      });
  }

  view(id:number){
    this.router.navigate([`/dashboard/purchases/view/${id}`]);
  }

  printReceipt(id: number){}

  changeDateCreated(ev:MatDatepickerInputEvent<Date>){}
}
