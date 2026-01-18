import { BreakpointObserver } from '@angular/cdk/layout';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import BaseForm from '../../../../shared/classes/base-form';
import { AuthService } from '../../../../shared/services/auth.service';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { NgIcon, NgIconComponent, provideIcons } from '@ng-icons/core';
import { matArrowBackOutline, matSearchOutline } from '@ng-icons/material-icons/outline';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';
import { URL_CLIENTS, URL_ORDERS, URL_PRODUCTS, URL_BRANCHES } from '../../../../shared/constants/endpoints';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SearchInputTextComponent } from '../../../../shared/components/search-input-text/search-input-text.component';
import { ChatBubbleComponent } from '../../../../shared/components/chat-bubble/chat-bubble.component';
import { NgClass } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { OrdersClientSelectComponent } from '../components/orders-client-select/orders-client-select.component';
import { Client } from '../../../../shared/interfaces/client';
import {MatIconModule} from '@angular/material/icon';
import {STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent} from '@angular/cdk/stepper';
import { OrdersProductsSelectComponent } from '../components/orders-products-select/orders-products-select.component';
import { Product } from '../../../../shared/interfaces/product';
import { Order, ProductOrderSelect } from '../../../../shared/interfaces/order';
import { DataOrderDialogComponent } from '../components/data-order-dialog/data-order-dialog.component';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { OrdersConfirmComponent } from '../components/orders-confirm/orders-confirm.component';
import { Branch } from '../../../../shared/interfaces/branch';

@Component({
  selector: 'app-orders-form',
  standalone: true,
  imports: [HeaderComponent, InputComponent, NgIconComponent, ToggleComponent, MatStepperModule,
    FormsModule, MatFormFieldModule, ReactiveFormsModule, MatButtonModule, MatInputModule,
    SearchInputTextComponent, NgIcon, ChatBubbleComponent, NgClass, OrdersClientSelectComponent,
    DialogModule, MatIconModule, OrdersProductsSelectComponent, OrdersConfirmComponent,FormsModule ],
  templateUrl: './orders-form.component.html',
  styleUrl: './orders-form.component.scss',
  viewProviders: [ provideIcons({ matArrowBackOutline, matSearchOutline })],
  providers:[
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {displayDefaultIndicatorType: false},
    },
  ]
})
export default class OrdersFormComponent extends BaseForm implements OnInit, AfterViewInit {

  @ViewChild(OrdersProductsSelectComponent) selectProducts: OrdersProductsSelectComponent;
  @ViewChild(OrdersConfirmComponent) confirmOrder: OrdersConfirmComponent;
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild(OrdersClientSelectComponent) clientSelectComponent: OrdersClientSelectComponent;

  form: FormGroup;

  clientForm = this._formBuilder.group({
    id: [0],
    name: [''],
    address: [''],
    telephone: ['']
  });

  stepTwoForm = this._formBuilder.group({
    idBranch: [0],
    branchName: [''],
    observation: ['']
  });

  client: Client | null = null;
  products: ProductOrderSelect[] = [];
  branch: Branch | null = null;
  observation: string = '';
  isEditMode: boolean = false;
  isLoadingData: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private bpo: BreakpointObserver,
    public dialog: Dialog,
    ){
      super(crud, toast, auth, bpo);
      this.mode = this.setMode(this.route.snapshot.paramMap.get('mode'));

      if(this.mode !== 'new') {
        this.id = Number(this.route.snapshot.paramMap.get('id'));
        this.isEditMode = true;
        this.isLoadingData = true;

        console.log('🔧 Constructor - Modo edición:', {
          id: this.id,
          isEditMode: this.isEditMode,
          mode: this.mode
        });
      }

      this.crud.baseUrl = URL_ORDERS;

      this.form = new FormGroup({
        name: new FormControl('', [Validators.required]),
        productDesc: new FormControl(),
        active: new FormControl(true)
      });

      if(this.mode === 'edit'){
        this.load = true;
      }
  }

  ngOnInit(): void {
    console.log('🔄 ngOnInit:', {
      isEditMode: this.isEditMode,
      id: this.id
    });

    if (this.isEditMode && this.id) {
      this.loadOrderData();
    }
  }

  ngAfterViewInit(): void {
    // Ya no navegamos automáticamente al paso 3 aquí
    // Dejamos que el stepper maneje la navegación natural
  }

  goToConfirmationStep(): void {
    if (this.stepper && this.products.length > 0) {
      console.log('🚀 Navegando al paso de confirmación (paso 3)');
      this.stepper.selectedIndex = 2;
    }
  }

  async loadOrderData() {
    console.log('🔄 Iniciando carga de orden ID:', this.id);
    this.load = true;

    try {
      const response: any = await firstValueFrom(this.crud.getId(this.id));
      const order = response;

      console.log('📦 Orden recibida:', order);

      // ✅ Cargar cliente
      if (order.client) {
        this.clientForm.patchValue({
          id: order.client.id || 0,
          name: order.client.name || 'Cliente Anónimo',
          address: order.client.address || '',
          telephone: order.client.telephone || ''
        });

        this.client = {
          id: order.client.id || 0,
          name: order.client.name || 'Cliente Anónimo',
          address: order.client.address || '',
          telephone: order.client.telephone || '',
          idUser: this.getUserId()
        };

        console.log('✅ Cliente cargado:', this.client);
      }

      // ✅ Cargar sucursal
      if (order.idBranch) {
        this.stepTwoForm.patchValue({
          idBranch: order.idBranch,
          branchName: order.branchName || '',
          observation: order.description || ''
        });

        this.branch = {
          id: order.idBranch,
          name: order.branchName || '',
          address: '',
          telephone: '',
          idUser: this.getUserId(),
          active: true
        };

        this.observation = order.description || '';
        console.log('✅ Sucursal cargada:', this.branch);
      }

      // ✅ Cargar productos
      if (order.products && order.products.length > 0) {
        this.products = order.products.map((po: any) => ({
          product: po.product,
          quantity: po.quantity,
          variantId: po.variantId || null
        }));

        console.log('✅ Productos transformados:', this.products);
      }

      this.load = false;
      this.isLoadingData = false;

      console.log('✅ Datos de orden cargados completamente');

    } catch (error: any) {
      console.error('❌ Error al cargar orden:', error);
      this.toast.error('Error al cargar la orden');
      this.load = false;
      this.isLoadingData = false;
      this.router.navigate(['dashboard/orders']);
    }
  }

  onStepChange(event: StepperSelectionEvent): void {
    const newStepIndex = event.selectedIndex;

    console.log('📍 Cambio de paso:', {
      anterior: event.previouslySelectedIndex,
      nuevo: newStepIndex,
      productosSeleccionados: this.products.length,
      modoEdicion: this.isEditMode,
      cargandoDatos: this.isLoadingData
    });

    // ✅ Permitir navegación mientras se cargan datos
    if (this.isLoadingData) {
      console.log('⏩ Navegación permitida - Cargando datos');
      return;
    }

    // ✅ En modo edición, permitir acceso directo a pasos 2 y 3
    if (this.isEditMode) {
      // Si vamos al paso 2 (confirmación) y ya tenemos sucursal, permitir
      if (newStepIndex === 2 && this.branch && this.branch.id > 0) {
        console.log('✅ Modo edición: Ya hay sucursal, permitiendo paso 3');
        return;
      }

      // Si vamos al paso 2 y no hay sucursal, abrir diálogo
      if (newStepIndex === 2 && (!this.branch || !this.branch.id)) {
        console.log('⚠️ Modo edición: Falta sucursal, abriendo diálogo');
        this.openBranchDialog();
        return;
      }

      // Permitir navegación libre en otros casos
      if (newStepIndex === 1) {
        console.log('✅ Modo edición: Navegación libre permitida');
        return;
      }
    }

    // Validación para paso 2 (Confirmación) en modo creación
    if (newStepIndex === 2) {
      // Verificar que haya productos
      if (this.products.length === 0) {
        this.toast.error('Debe seleccionar al menos un producto');
        setTimeout(() => {
          this.stepper.selectedIndex = event.previouslySelectedIndex;
        }, 0);
        return;
      }

      // Si ya tenemos sucursal, permitir navegación
      if (this.stepTwoForm.controls.idBranch.value && this.stepTwoForm.controls.idBranch.value > 0) {
        console.log('✅ Sucursal ya seleccionada, mostrando confirmación');
        return;
      }

      // Abrir diálogo de sucursal si no existe
      this.openBranchDialog();
    }
  }

  async openBranchDialog() {
    const darkmode = localStorage.getItem('theme');

    // ✅ Preparar datos preexistentes para el diálogo
    const dialogData: any = {
      title: 'Datos adicionales de la venta',
    };

    // Si estamos en modo edición y ya hay sucursal/observación, pasarlas al diálogo
    if (this.isEditMode && this.branch) {
      dialogData.existingBranchId = this.branch.id;
      console.log('📦 Pasando sucursal existente al diálogo:', this.branch.id);
    }

    if (this.isEditMode && this.observation) {
      dialogData.existingObservation = this.observation;
      console.log('📦 Pasando observación existente al diálogo:', this.observation);
    }

    const dialogRef = this.dialog.open(DataOrderDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark') ? ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                  ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      disableClose: true,
      data: dialogData,
    });

    await firstValueFrom(dialogRef.closed)
      .then(async (data: { idBranch: number, branchName: string, observation: string }) => {
        if (!data) {
          this.stepper.selectedIndex = 1;
          return;
        }

        this.stepTwoForm.controls.idBranch.setValue(data.idBranch);
        this.stepTwoForm.controls.branchName.setValue(data.branchName);
        this.stepTwoForm.controls.observation.setValue(data.observation);

        this.client = {
          id: Number(this.clientForm.controls.id.value) || 0,
          name: this.clientForm.controls.name.value || 'Cliente Anónimo',
          address: this.clientForm.controls.address.value || '',
          telephone: this.clientForm.controls.telephone.value || '',
          idUser: this.getUserId()
        };

        this.branch = {
          id: this.stepTwoForm.controls.idBranch.value!,
          name: this.stepTwoForm.controls.branchName.value!,
          address: '',
          telephone: '',
          idUser: this.getUserId(),
          active: true
        };

        this.observation = this.stepTwoForm.controls.observation.value!;
        console.log('✅ Datos de sucursal guardados correctamente');
      })
      .catch((error: any) => {
        console.error('Error en diálogo:', error);
        this.stepper.selectedIndex = 1;
      });
  }

  isDirty(): boolean {
    if (this.isLoadingData) {
      return false;
    }
    return true;
  }

  introSearch(){
    const name: any = this.form.controls['name'].value;
    if(name && name !== ''){
      this.filter(name);
    }
  }

  initPage(){
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, 1, 10);
    this.form.reset();
  }

  filter(name?: string, id?: number){
    let filter = '';
    if(id){
      filter = filter.concat(`&id=${id}`)
    }
    if(name){
      filter = filter.concat(`&name=${name}`);
    }
    this.filters = filter;
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, filter);
  }

  back() {
    this.router.navigate(['dashboard/orders']);
  }

  clientSelect(ev: Client){
    this.clientForm.controls.id.setValue(ev.id);
    this.clientForm.controls.name.setValue(ev.name);
    this.clientForm.controls.address.setValue(ev.address);
    this.clientForm.controls.telephone.setValue(ev.telephone);

    this.client = ev;

    console.log('✅ Cliente seleccionado:', ev.id === 0 ? 'Anónimo' : ev.name);
    this.goToNextStep();
  }

  productsSelect(products: ProductOrderSelect[]){
    this.products = products;
    console.log('✅ Productos seleccionados actualizados:', this.products.length);
  }

  get selectedProducts(): ProductOrderSelect[] {
    return this.products;
  }

  goToNextStep(): void {
    this.stepper.next();
  }

  goToPreviousStep(): void {
    this.stepper.previous();
  }

  goToStep(index: number): void {
    this.stepper.selectedIndex = index;
  }

  backStep(ev: boolean){
    this.stepper.selectedIndex = 1;
  }

  async submit(order: Order){
    console.log('📨 submit() recibió orden:', {
      id: order.id,
      isEditMode: this.isEditMode,
      formId: this.id,
      clientId: order.clientId,
      branchId: order.idBranch,
      productsCount: order.products?.length
    });

    this.load = true;
    this.isSaving = true;
    this.crud.baseUrl = URL_ORDERS;

    if (this.isEditMode && this.id) {
      console.log('✏️ Actualizando orden ID:', this.id);

      await firstValueFrom(this.crud.updateId(this.id, order))
        .then((response: any) => {
          console.log('✅ Respuesta exitosa:', response);
          this.toast.success('Venta actualizada correctamente');
          this.load = false;
        })
        .catch((error: any) => {
          console.error('❌ Error al actualizar:', error);
          this.toast.error(error.message);
          this.load = false;
        })
        .finally(() => {
          this.load = false;
          this.router.navigate(['dashboard/orders']);
        });
    } else {
      console.log('🆕 Creando nueva orden');

      await firstValueFrom(this.crud.save(order))
        .then((response: any) => {
          console.log('✅ Respuesta exitosa:', response);
          this.toast.success(response.message);
          this.load = false;
        })
        .catch((error: any) => {
          console.error('❌ Error al crear:', error);
          this.toast.error(error.message);
          this.load = false;
        })
        .finally(() => {
          this.load = false;
          this.router.navigate(['dashboard/orders']);
        });
    }
  }

  getUserId(){
    return this.auth.getUserData().id;
  }
}
