import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../../../shared/components/header/header.component";
import { SearchInputTextComponent } from '../../../../shared/components/search-input-text/search-input-text.component';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { NgClass } from '@angular/common';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ChatBubbleComponent } from '../../../../shared/components/chat-bubble/chat-bubble.component';
import { bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight } from '@ng-icons/bootstrap-icons';
import { matSearchOutline, matFilterAltOutline, matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline, matDeleteOutline, matEditOutline } from '@ng-icons/material-icons/outline';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import BaseForm from '../../../../shared/classes/base-form';
import { URL_CLIENTS, URL_PRODUCTS } from '../../../../shared/constants/endpoints';
import { OptionsChatBubble } from '../../../../shared/interfaces/options-chat-bubble';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ClientsFiltersDialogComponent } from '../clients-filters-dialog/clients-filters-dialog.component';
import { Client } from '../../../../shared/interfaces/client';
import { AuthService } from '../../../../shared/services/auth.service';
import { ACTIONS_GRID_MAIN_ADMIN } from '../../../../shared/constants/actions-menu';
import { ProductsFiltersDialogComponent } from '../../products/products-filters-dialog/products-filters-dialog.component';

@Component({
    selector: 'app-clients-grid-main',
    standalone: true,
    templateUrl: './clients-grid-main.component.html',
    styleUrl: './clients-grid-main.component.scss',
    imports: [HeaderComponent, SearchInputTextComponent, NgIcon, ChatBubbleComponent, NgClass,
      DialogModule,
      FormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      viewProviders: [ provideIcons({ matSearchOutline, matFilterAltOutline, matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline,
        matDeleteOutline, matEditOutline, bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight }) ]

})
export default class ClientsGridMainComponent extends BaseForm implements OnInit {

  form: FormGroup;
  users: { label: string, value: number }[] = [];
  actionsGrid:  OptionsChatBubble[] = ACTIONS_GRID_MAIN_ADMIN;
  daysOfWeek = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' }
  ];

  constructor(
      private crud: CrudService,
      private toast: ToastService,
      private router: Router,
      public dialog: Dialog,
      private auth: AuthService,
      private bpo: BreakpointObserver){
        super(crud, toast, auth, bpo);
        this.sortConfig.sortBy = 'name';
        this.sortConfig.sortOrder = 'asc';
        this.crud.baseUrl = URL_CLIENTS;
        this.form = new FormGroup({
          id: new FormControl(),
          name: new FormControl(),
          offerDay: new FormControl(),

        });
        if(this.isAdmin()){
          this.getUsers();
        }
  }

  ngOnInit(): void {
    this.load = true;
    if(!this.isAdmin()){
      this.filters = `&idUser=${this.getUserId()}`;
    }
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, this.filters);
  }

  async openDialog() {
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(ClientsFiltersDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark') ?
                  ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                  ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      data: {
        title: 'Filtros de clientes'
      },
      });

      await firstValueFrom(dialogRef.closed)
        .then((result: {name: string, id: number, offerDay: string, idUser: number}) => {
          if(result){
            if(result.name || result.id || result.offerDay || result.idUser){
              if(!this.isAdmin()){
                result.idUser = this.getUserId();
              }
              this.filter(result.name, result.id, result.offerDay, result.idUser);
            }
          }
        })
        .catch((error: any) => {
          this.toast.error(error.message);
        });
  }

  initPage(){
    let idUser: string = '';
    if(!this.isAdmin()){
      idUser = `&idUser=${this.getUserId()}`;
    }
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, 1, 10, idUser);
    this.form.reset();
  }

  selectOption(option: OptionsChatBubble){
    if(option.action === 'delete'){
      this.deleteId(option.id);
    }
    if(option.action === 'edit'){
      this.edit(option.id);
    }
  }

  edit(id: number){
    this.router.navigate([`/dashboard/clients/detail/edit/${id}`]);
  }

  add(){
    this.router.navigate([`/dashboard/clients/detail/new`]);
  }

  introSearch(){
    const name: any = this.form.controls['name'].value;
    let idUser: number;

    if(!this.isAdmin()){
      idUser = this.getUserId();
    }else{
      idUser = null;
    }

    if(name && name !== ''){
      this.filter(name, null, null, idUser);
    }

  }

  filter(name?: string, id?: number,offerDay?: string, idUser?: number){
    console.log('se filtro')
    let filter = '';
    if(id){
      filter = filter.concat(`&id=${id}`)
    }
    if(name){
      filter = filter.concat(`&name=${name}`);
    }
    if(offerDay){
      filter = filter.concat(`&offerDay=${offerDay}`);
    }

    if(idUser){
      filter = filter.concat(`&idUser=${idUser}`);
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

  translateDaysOfWeek(value: string): string {

    let day: string = '';

    switch (value) {
      case 'MONDAY':
        day = 'Lunes';
        break;
      case 'TUESDAY':
        day = 'Martes';
        break;
      case 'WEDNESDAY':
        day = 'Miércoles';
        break;
      case 'THURSDAY':
        day = 'Jueves';
        break;
      case 'FRIDAY':
        day = 'Viernes';
        break;
      case 'SATURDAY':
        day = 'Sábado';
        break;
      case 'SUNDAY':
        day = 'Domingo';
        break;
      default:
        day = 'Error al obtener día'
        break;

    }
    return day;
  }

  isAdmin(): boolean {
    if(this.auth?.getUserData()?.role === 'ROLE_ADMIN'){
      return true;
    }
    return false;
  }

  getUsers(){
    this.crud
    .getUsersForClients()
    .then((users: any[]) => {
      if(users.length > 0){
        users.forEach((user: { email: string, id_users: number, name: string, role: string}) => {
          const record = {
            label: user.name,
            // label: user.name + ' - ' + user.email,
            value: user.id_users
          }
          this.users.push(record);
        });
      }

    }).catch((error: any) => {
      this.toast.error(error.error.message);
    });
  }

  getUserClientTable(id: number): string {
    if(this.users.length > 0){
      return this.users.find((user) => user.value === id).label;
    }
    return 'cargando...';
  }

  getUserId(): number{
    return this.auth?.getUserData()?.id;
  }
}
