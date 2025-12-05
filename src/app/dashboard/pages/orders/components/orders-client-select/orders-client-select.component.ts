import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../shared/services/auth.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { URL_CLIENTS } from '../../../../../shared/constants/endpoints';
import { Client } from '../../../../../shared/interfaces/client';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline } from '@ng-icons/material-icons/outline';
import { SearchInputTextComponent } from '../../../../../shared/components/search-input-text/search-input-text.component';
import { NgClass } from '@angular/common';
import { ChatBubbleComponent } from '../../../../../shared/components/chat-bubble/chat-bubble.component';
import { bootstrapChevronBarLeft, bootstrapChevronBarRight, bootstrapChevronLeft, bootstrapChevronRight } from '@ng-icons/bootstrap-icons';
import {MatRadioModule} from '@angular/material/radio';
import { Dialog } from '@angular/cdk/dialog';
import { OrdersClientNewDialogComponent } from '../orders-client-new-dialog/orders-client-new-dialog.component';
import { firstValueFrom } from 'rxjs';
import BaseFormClients from '../../../../../shared/classes/base-form-clients';
import { CrudClientsService } from '../../../../../shared/services/crud-clients.service';

@Component({
  selector: 'app-orders-client-select',
  standalone: true,
  imports: [HeaderComponent, NgIcon, SearchInputTextComponent, NgClass, ChatBubbleComponent,
            MatRadioModule, FormsModule, ReactiveFormsModule],
  templateUrl: './orders-client-select.component.html',
  styleUrl: './orders-client-select.component.scss',
  viewProviders: [ provideIcons({ matAddOutline, bootstrapChevronBarLeft, bootstrapChevronLeft,
    bootstrapChevronRight, bootstrapChevronBarRight, matArrowUpwardOutline,
    matArrowDownwardOutline
   }) ]
})
export class OrdersClientSelectComponent extends BaseFormClients implements OnInit {

  form: FormGroup;
  client: Client;
  displayedColumns: string[] = ['name'];
  dataSource;
  selectedIdControl = new FormControl(null);
  @Output() changes = new EventEmitter<Client>();

  constructor(
    private _formBuilder: FormBuilder,
    private crud: CrudClientsService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: Dialog,
    private auth: AuthService,
    private bpo: BreakpointObserver
    ){
      super(crud, toast, auth, bpo);
      this.mode = this.setMode(this.route.snapshot.paramMap.get('mode'));
      this.sortConfig.sortBy = 'name';
      this.sortConfig.sortOrder = 'asc';
      this.pageSize = 10;
      this.crud.baseUrl = URL_CLIENTS;

      if(this.mode !== 'new') this.id = Number(this.route.snapshot.paramMap.get('id'));
      this.form = new FormGroup({
        name: new FormControl('', []),
      });
  }

  ngOnInit(): void {
    this.filter();
    // this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize);
  }

  initPage(){
    let filter = '';
    filter = filter.concat(`&offerDay=${encodeURIComponent(this.getToday())}&idUser=${this.getUserId()}`);
    this.filters = filter;
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, 1, 10, this.filters);
    this.form.reset();
  }

  introSearch(){
    const name: any = this.form.controls['name'].value;
    if(name && name !== ''){
      this.filter(name);
    }

  }

  filter(name?: string, id?: number){

    let filter = '';
    if(id){
      filter = filter.concat(`&id=${id}`)
    }
    if(name){
      filter = filter.concat(`&name=${name}`);
    }

    filter = filter.concat(`&offerDay=${this.getToday()}&idUser=${this.getUserId()}`);
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

  back(){
    this.router.navigate(['dashboard/orders']);
  }

  getDay(value: string): string {
    let dayName = '';

    switch (value) {
        case 'MONDAY':
            dayName = 'Lunes';
            break;
        case 'TUESDAY':
            dayName = 'Martes';
            break;
        case 'WEDNESDAY':
            dayName = 'Miércoles';
            break;
        case 'THURSDAY':
            dayName = 'Jueves';
            break;
        case 'FRIDAY':
            dayName = 'Viernes';
            break;
        case 'SATURDAY':
            dayName = 'Sábado';
            break;
        case 'SUNDAY':
            dayName = 'Domingo';
            break;
        default:
            dayName = 'Día desconocido';
            break;
    }
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
  }

  getToday(): string {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const dayOfWeekIndex = today.getDay();
    const dayOfWeek = daysOfWeek[dayOfWeekIndex];
    return dayOfWeek.toUpperCase();
  }

  toggleSelection(client: Client) {
    const currentValue = this.selectedIdControl.value;
    this.selectedIdControl.setValue(currentValue === client.id ? null : client.id);
    this.changes.emit(client);
  }

  async add() {
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(OrdersClientNewDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark') ? ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                  ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      disableClose: true,
      data: {
        title: 'Nuevo cliente'
      },
      });

      let clientSelect: Client = null;
      await firstValueFrom(dialogRef.closed)
      .then(async (client: Client) => {
        if(client){
          await firstValueFrom(this.crud.save(client))
            .then((response: any) => {
              this.load = false;
              this.toast.success(response.message);
              clientSelect = response.register;
            })
            .catch((error: any) => {
              this.load = false;
              this.toast.error(error.message);
            })
            .finally(() => {
              this.load = false;
              this.changes.emit(clientSelect);
            });
        }
      })
      .catch((error: any) => {
        this.toast.error(error.message);
      });
  }

  getUserId(){
    return this.auth?.getUserData()?.id;
  }

}
