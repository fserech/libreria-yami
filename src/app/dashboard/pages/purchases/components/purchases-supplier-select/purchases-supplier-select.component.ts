import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../shared/services/auth.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { URL_SUPPLIERS } from '../../../../../shared/constants/endpoints';
import { Supplier } from '../../../../../shared/interfaces/supplier';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline } from '@ng-icons/material-icons/outline';
import { SearchInputTextComponent } from '../../../../../shared/components/search-input-text/search-input-text.component';
import { NgClass } from '@angular/common';
import { ChatBubbleComponent } from '../../../../../shared/components/chat-bubble/chat-bubble.component';
import { bootstrapChevronBarLeft, bootstrapChevronBarRight, bootstrapChevronLeft, bootstrapChevronRight } from '@ng-icons/bootstrap-icons';
import { MatRadioModule } from '@angular/material/radio';
import { Dialog } from '@angular/cdk/dialog';
import { PurchasesSupplierNewDialogComponent } from '../purchases-supplier-new-dialog/purchases-supplier-new-dialog.component';
import { firstValueFrom } from 'rxjs';
import BaseForm from '../../../../../shared/classes/base-form';
import { CrudService } from '../../../../../shared/services/crud.service';

@Component({
  selector: 'app-purchases-supplier-select',
  standalone: true,
  imports: [HeaderComponent, NgIcon, SearchInputTextComponent, NgClass, ChatBubbleComponent,
            MatRadioModule, FormsModule, ReactiveFormsModule],
  templateUrl: './purchases-supplier-select.component.html',
  styleUrl: './purchases-supplier-select.component.scss',
  viewProviders: [ provideIcons({ matAddOutline, bootstrapChevronBarLeft, bootstrapChevronLeft,
    bootstrapChevronRight, bootstrapChevronBarRight, matArrowUpwardOutline,
    matArrowDownwardOutline
   }) ]
})
export class PurchasesSupplierSelectComponent extends BaseForm implements OnInit {

  form: FormGroup;
  supplier: Supplier;
  displayedColumns: string[] = ['supplierName'];
  dataSource;
  selectedIdControl = new FormControl(null);
  @Output() changes = new EventEmitter<Supplier>();

  constructor(
    private _formBuilder: FormBuilder,
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: Dialog,
    private auth: AuthService,
    private bpo: BreakpointObserver
    ){
      super(crud, toast, auth, bpo);

      // ✅ CRÍTICO: Configurar baseUrl DESPUÉS de super() y ANTES de cualquier operación
      this.crud.baseUrl = URL_SUPPLIERS;

      this.mode = this.setMode(this.route.snapshot.paramMap.get('mode'));
      this.sortConfig.sortBy = 'supplierName';
      this.sortConfig.sortOrder = 'asc';
      this.pageSize = 10;

      if(this.mode !== 'new') this.id = Number(this.route.snapshot.paramMap.get('id'));
      this.form = new FormGroup({
        name: new FormControl('', []),
      });

  }

  ngOnInit(): void {
    // ✅ CRÍTICO: Forzar baseUrl antes de cargar datos
    this.crud.baseUrl = URL_SUPPLIERS;
    this.loadInitialData();
  }

  // ✅ NUEVO: Método para cargar datos iniciales
  loadInitialData() {
    // ✅ CRÍTICO: Verificar baseUrl antes de cada carga
    this.crud.baseUrl = URL_SUPPLIERS;

    this.load = true;
    // Cargar sin filtros para mostrar todos los proveedores
    this.getPageItems(this.sortConfig.sortOrder as 'asc' | 'desc', this.sortConfig.sortBy, 1, this.pageSize, '');
  }

  initPage(){
    this.filters = '';
    this.page = 1; // ✅ Resetear a página 1
    this.form.reset();
    this.getPageItems(this.sortConfig.sortOrder as 'asc' | 'desc', this.sortConfig.sortBy, 1, this.pageSize, '');
  }

  introSearch(){
    const name: any = this.form.controls['name'].value;
    if(name && name !== ''){
      this.filter(name);
    } else {
      // Si está vacío, cargar todos
      this.loadInitialData();
    }
  }

  filter(name?: string, id?: number){
    let filter = '';

    if(id){
      filter = filter.concat(`&id=${id}`)
    }

    if(name){
      filter = filter.concat(`&supplierName=${name}`);
    }

   

    this.filters = filter;
    this.page = 1; // ✅ Resetear a página 1 al filtrar
    this.getPageItems(this.sortConfig.sortOrder as 'asc' | 'desc', this.sortConfig.sortBy, this.page, this.pageSize, filter);
  }

  changeSortOrderBy(field: string){
    if(field !== 'supplierName') {
      console.warn('⚠️ Campo de ordenamiento no válido:', field);
      return;
    }

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

    this.getPageItems(this.sortConfig.sortOrder as 'asc' | 'desc', this.sortConfig.sortBy, this.page, this.pageSize, this.filters);
  }

  back(){
    this.router.navigate(['dashboard/purchases']);
  }

  toggleSelection(supplier: Supplier) {
      const currentValue = this.selectedIdControl.value;

    if (currentValue === supplier.id) {
      // Si ya está seleccionado, deseleccionar
      this.selectedIdControl.setValue(null);
      this.changes.emit(null);
    } else {
      // Seleccionar nuevo proveedor
      this.selectedIdControl.setValue(supplier.id);
      this.changes.emit(supplier);
    }
  }

  async add() {
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(PurchasesSupplierNewDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark') ?
                  ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                  ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      disableClose: true,
      data: {
        title: 'Nuevo proveedor'
      },
    });

    let supplierSelect: Supplier = null;

    await firstValueFrom(dialogRef.closed)
      .then(async (supplier: Supplier) => {
        if(supplier){
          this.load = true;
          await firstValueFrom(this.crud.save(supplier))
            .then((response: any) => {
              this.toast.success(response.message);
              supplierSelect = response.register;

              // ✅ Recargar la lista para mostrar el nuevo proveedor
              this.loadInitialData();

              // ✅ Seleccionar automáticamente el nuevo proveedor
              if(supplierSelect?.id) {
                this.selectedIdControl.setValue(supplierSelect.id);
              }
            })
            .catch((error: any) => {
              this.toast.error(error.message);
            })
            .finally(() => {
              this.load = false;
              this.changes.emit(supplierSelect);
            });
        }
      })
      .catch((error: any) => {
        console.error('Error al crear proveedor:', error);
        this.toast.error(error.message);
      });
  }

  getUserId(){
    return this.auth?.getUserData()?.id;
  }

  override getPageItems(sortOrder: 'asc' | 'desc', sortBy: string, page: number, pageSize: number, filters?: string) {
    this.crud.baseUrl = URL_SUPPLIERS;
    if (sortBy === 'productName' || sortBy === 'product') {
      sortBy = 'supplierName';
      this.sortConfig.sortBy = 'supplierName';
    }

    super.getPageItems(sortOrder, sortBy, page, pageSize, filters);
  }
}
