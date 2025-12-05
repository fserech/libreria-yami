import { HostBinding, HostListener, Injectable } from "@angular/core";
import { CrudService } from "../services/crud.service";
import { ToastService } from "../services/toast.service";
import { UserProfile } from "../interfaces/user-profile";
import { AuthService } from "../services/auth.service";
import { BreakpointObserver } from "@angular/cdk/layout";

@Injectable({
  providedIn: 'root'
})
export default class BaseForm {

  snackbarComponentRef: any;
  // form: FormGroup;
  id: number;
  item: any;
  mode: 'new' | 'edit' | 'view' = 'view';
  url: string = '';
  load: boolean = false;
  user: UserProfile = null;
  isSaving: boolean = false;
  sortConfig: { sortBy: string, sortOrder: 'asc' | 'desc' } = {
    sortBy: 'id',
    sortOrder: 'asc'
  }
  page: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;
  startIndex: number;
  endIndex: number;
  filters: string = null;
  ItemsList: any[] = [];

  constructor(private crudService: CrudService, private toastService: ToastService,
              private authService: AuthService, private breakpointObserver: BreakpointObserver){
                this.user = this.authService.getUserData();
              }

  getPageItems(sortOrder: 'asc' | 'desc', sortBy: string, page: number, pageSize: number, filters?: string){
    this.crudService
    .getPage(sortOrder, sortBy, pageSize, page, (filters) ? filters : null)
    .then((response: any) => {
        this.ItemsList = [];
        this.ItemsList = response.content;
        this.totalPages = response.totalPages;
        this.totalItems = response.totalItems;
        this.page = response.currentPage;
        this.sortConfig.sortBy = sortBy;
        this.sortConfig.sortOrder = sortOrder;
    })
    .catch((error: any) => {
      this.toastService.error('No se econtraron registros')
      this.load = false;
    })
    .finally(() => {
      this.updateIndexes();
      this.load = false;
    })
  }

 async getPageUser(ItemsList: number) {
    this.crudService.getUsers(ItemsList)
      .then((response: any) => {
        this.ItemsList = response.map((user: any) => ({ ...user, id: user.id_users }));
      })
      .catch((error: any) => {
        this.toastService.error('No se encontraron registros');
        this.load = false;
      })
      .finally(() => {
        this.updateIndexes();
        this.load = false;
      });
  }

  nextPage(){
    this.load = true;
    const nextPage = this.page + 1;
    if(nextPage > this.totalPages){
      this.toastService.info("Estas en la última página");
      this.load = false;
    }else{
      this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, nextPage, this.pageSize, this.filters);
    }
  }

  previousPage(){
    this.load = true;
    const previousPage = this.page - 1;
    if(previousPage === 0){
      this.toastService.info("Estas en la primera página");
      this.load = false;
    }else{
      this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, previousPage, this.pageSize, this.filters);
    }
  }

  firstPage(){
    this.load = true;
    if(this.page === 1){
      this.toastService.info("Estas en la primera página");
      this.load = false;
    }else{
      this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, 1, this.pageSize, this.filters);
    }
  }

  lastPage(){
    this.load = true;
    if(this.page === this.totalPages){
      this.toastService.info("Estas en la última página");
      this.load = false;
    }else{
      this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.totalPages, this.pageSize, this.filters);
    }
  }

  updateIndexes(): void {
    this.startIndex = (this.page - 1) * this.pageSize + 1;
    this.endIndex = Math.min(this.page * this.pageSize, this.totalItems);
  }

  deleteId(id: number){
    this.load = true;
    this.toastService.confirm('¿Seguro que desea eliminar el registro?', null, null, 'El registro se eliminará de forma permanente.')
    .then((result) => {
      if (result.isConfirmed) {
        this.crudService.deleteId(id)
          .then((response: any) => {
            this.toastService.success('Se eliminó el registro');
            this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, 1, this.pageSize);
          })
          .catch((error: any) => {
            this.toastService.error(error.error.message);
            this.load = false;
          });
      }else{
        this.load = false;
      }
    });
  }

  deleteUser(id: number){
    this.load = true;
    this.toastService.confirm('¿Seguro que desea eliminar el registro?', null, null, 'El registro se eliminará de forma permanente.').then((result) => {
      if (result.isConfirmed) {
        this.crudService.deleteId(id)
          .then((response: any) => {
            this.toastService.success('Se eliminó el registro');
            this.getPageUser(this.pageSize);
            this.load = false;
          })
          .catch((error: any) => {
            this.toastService.error('Ocurrio un error del servidor!');
            this.load = false;
          });
      }
    });
  }

  setMode(mode: string): 'view' | 'new' | 'edit' | null {
    if (mode === 'edit') {
      return 'edit';
    } else if (mode === 'new') {
      return 'new';
    } else if (mode === 'view'){
      return 'view';
    } else {
      throw null;
    }
  }

  getDialogWidth(): string {
    if (this.breakpointObserver.isMatched('(min-width: 1024px)')) {
      return '40%';
    } else if (this.breakpointObserver.isMatched('(min-width: 768px)')) {
      return '70%';
    } else if (this.breakpointObserver.isMatched('(min-width: 640px)')) {
      return '60%';
    } else {
      return '90%';
    }
  }

}
