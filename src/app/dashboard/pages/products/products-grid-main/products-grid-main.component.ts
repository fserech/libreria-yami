import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import BaseForm from '../../../../shared/classes/base-form';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matAddOutline, matSearchOutline, matFilterAltOutline, matArrowDownwardOutline, matArrowUpwardOutline, matDeleteOutline, matEditOutline } from '@ng-icons/material-icons/outline';
import { SearchInputTextComponent } from '../../../../shared/components/search-input-text/search-input-text.component';
import { bootstrapChevronBarLeft, bootstrapChevronBarRight, bootstrapChevronLeft, bootstrapChevronRight, bootstrapSortDown, bootstrapSortUp } from '@ng-icons/bootstrap-icons';
import { ChatBubbleComponent } from '../../../../shared/components/chat-bubble/chat-bubble.component';
import { OptionsChatBubble } from '../../../../shared/interfaces/options-chat-bubble';
import { Product } from '../../../../shared/interfaces/product';
import { NgClass } from '@angular/common';
import { URL_PRODUCTS } from '../../../../shared/constants/endpoints';
import { Router } from '@angular/router';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { ProductsFiltersDialogComponent } from '../products-filters-dialog/products-filters-dialog.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../../shared/services/auth.service';
import { ACTIONS_GRID_MAIN_ADMIN } from '../../../../shared/constants/actions-menu';
@Component({
  selector: 'app-products-grid-main',
  standalone: true,
  imports: [HeaderComponent, SearchInputTextComponent, NgIcon, ChatBubbleComponent, NgClass,
     DialogModule,
     FormsModule],
  templateUrl: './products-grid-main.component.html',
  styleUrl: './products-grid-main.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  viewProviders: [ provideIcons({ matSearchOutline, matFilterAltOutline, matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline,
    matDeleteOutline, matEditOutline, bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight }) ]
})
export default class ProductsGridMainComponent extends BaseForm implements OnInit {

  form: FormGroup;
  actionsGrid:  OptionsChatBubble[] = ACTIONS_GRID_MAIN_ADMIN;

  constructor(
      private crud: CrudService,
      private toast: ToastService,
      private router: Router,
      public dialog: Dialog,
      private auth: AuthService,
      private bpo: BreakpointObserver){
        super(crud, toast, auth, bpo);
        this.sortConfig.sortBy = 'productName';
        this.sortConfig.sortOrder = 'asc';
        this.crud.baseUrl = URL_PRODUCTS;
        this.form = new FormGroup({
          id: new FormControl(),
          name: new FormControl(),
          price: new FormControl(),
          active: new FormControl()
        });
  }

  ngOnInit(): void {
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize);
  }

  async openDialog() {
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(ProductsFiltersDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark') ?
                  ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                  ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      data: {
        title: 'Filtros de productos'
      },
      });

      await firstValueFrom(dialogRef.closed)
      .then((result: {name: string, id: number, initPrice: number, endPrice: number, active: boolean}) => {
        if(result){
          if(result.name || result.id || result.initPrice || result.endPrice || result.active){
            this.filter(result.name, result.id, result.initPrice, result.endPrice, result.active);
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
      this.deleteId(option.id);
    }
    if(option.action === 'edit'){
      this.edit(option.id);
    }
  }

  edit(id: number){
    this.router.navigate([`/dashboard/products/detail/edit/${id}`]);
  }

  add(){
    this.router.navigate([`/dashboard/products/detail/new`]);
  }

  introSearch(){
    const name: any = this.form.controls['name'].value;
    if(name && name !== ''){
      this.filter(name);
    }

  }

  filter(name?: string, id?: number, initPrice?: number, endPrice?: number, active?: boolean){

    let filter = '';
    if(id){
      filter = filter.concat(`&id=${id}`)
    }
    if(name){
      filter = filter.concat(`&productName=${name}`);
    }
    if(initPrice && endPrice){
      filter = filter.concat(`&initPrice=${initPrice}&endPrice=${endPrice}`);
    }
    if(active){
      filter = filter.concat(`&active=${active}`);
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
