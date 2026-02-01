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
import {  URL_USERS } from '../../../../shared/constants/endpoints';
import { OptionsChatBubble } from '../../../../shared/interfaces/options-chat-bubble';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';


import { AuthService } from '../../../../shared/services/auth.service';
import { ACTIONS_GRID_MAIN_ADMIN } from '../../../../shared/constants/actions-menu';
import { UsersFiltersDialogComponent } from '../users-filters-dialog/users-filters-dialog.component';


@Component({
    selector: 'app-users-grid-main',
    standalone: true,
    templateUrl: './users-grid-main.component.html',
    styleUrl: './users-grid-main.component.scss',
    imports: [HeaderComponent, SearchInputTextComponent, NgIcon, ChatBubbleComponent, NgClass,
      DialogModule,
      FormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      viewProviders: [ provideIcons({ matSearchOutline, matFilterAltOutline, matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline,
        matDeleteOutline, matEditOutline, bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight }) ]

})
export default class UsersGridMainComponent extends BaseForm implements OnInit {

  form: FormGroup;
  actionsGrid:  OptionsChatBubble[] = ACTIONS_GRID_MAIN_ADMIN;
  users: any[] = [];

  constructor(
      private crud: CrudService,
      private toast: ToastService,
      private router: Router,
      public dialog: Dialog,
      public auth: AuthService,
      private bpo: BreakpointObserver){
        super(crud, toast, auth, bpo);
        this.sortConfig.sortBy = 'name';
        this.sortConfig.sortOrder = 'asc';
        this.crud.baseUrl = URL_USERS;
        this.form = new FormGroup({
          id: new FormControl(),
          name: new FormControl(),
          email: new FormControl(),

        });
  }

  ngOnInit(): void {
    this.crud.getUsers().then((response: any) => {

      this.ItemsList = response.map((user: any) => ({ ...user, id: user.id_users }));
    }, (error: any) => {
      console.error('Error al obtener los usuarios:', error);
    });

  }


  async openDialog() {
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(UsersFiltersDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark') ?
                  ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                  ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      data: {
        title: 'Filtros de usuarios'
      },
      });

      await firstValueFrom(dialogRef.closed)
        .then((result: {name: string, id: number, email: string}) => {
          if(result){
            if(result.name || result.id || result.email){
              this.filter(result.name, result.id, result.email);
            }
          }
        })
        .catch((error: any) => {
          this.toast.error(error.message);
          // console.log('err', error);
        });
  }

  initPage(){
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, 1, 10);
    this.form.reset();
  }

  selectOption(option: OptionsChatBubble){
    if(option.action === 'delete'){
      this.deleteUser(option.id);
    }
    if(option.action === 'edit'){
      this.edit(option.id);
    }
  }

  edit(id: number){
    this.router.navigate([`/dashboard/users/detail/edit/${id}`]);
  }

  add(){
    this.router.navigate([`/dashboard/users/detail/new`]);
  }

  introSearch(){
    const name: any = this.form.controls['name'].value;
    if(name && name !== ''){
      this.filter(name);
    }

  }

  filter(name?: string, id?: number,email?: string){

    let filter = '';
    if(id){
      filter = filter.concat(`&id=${id}`)
    }
    if(name){
      filter = filter.concat(`&name=${name}`);
    }
    if(email){
      filter = filter.concat(`&email=${email}`);
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
}
