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

  client: Client;
  products: ProductOrderSelect[] = [];
  branch: Branch | null = null;
  observation: string;

  // ✅ CRÍTICO: Inicializar ANTES del constructor
  isEditMode: boolean = false;
  isLoadingData: boolean = false; // ✅ Flag para controlar carga inicial

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
        this.isLoadingData = true; // ✅ CRÍTICO: Marcar ANTES de iniciar carga
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
    if (this.isEditMode && this.id) {
      this.loadOrderData();
    }
  }

  ngAfterViewInit(): void {
    // Si ya se cargaron los datos antes de que el stepper se inicializara,
    // intentar navegar ahora
    if (this.isEditMode && this.products.length > 0 && this.stepper) {
      setTimeout(() => {
        if (this.stepper.selectedIndex === 0) { // Solo si aún está en paso 0
          console.log('🔄 AfterViewInit: Navegando al paso 3');
          this.stepper.selectedIndex = 2;
          setTimeout(() => {
            this.isLoadingData = false;
          }, 200);
        }
      }, 150);
    }
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
    // isLoadingData ya está en true desde el constructor

    try {
      const response: any = await firstValueFrom(this.crud.getId(this.id));
      const order = response.register;

      console.log('📦 Orden recibida:', order);
      console.log('👤 Cliente:', order.client);
      console.log('🏪 Sucursal:', order.branch);
      console.log('📦 ProductOrders:', order.productOrders);

      // Cargar datos del cliente
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
      }

      // Cargar datos de sucursal y observación
      if (order.branch) {
        this.stepTwoForm.patchValue({
          idBranch: order.branch.id,
          branchName: order.branch.name,
          observation: order.description || ''
        });

        this.branch = {
          id: order.branch.id,
          name: order.branch.name,
          address: order.branch.address || '',
          telephone: order.branch.telephone || '',
          idUser: this.getUserId(),
          active: true
        };

        this.observation = order.description || '';
      }

      // Cargar productos con sus variantes
      if (order.productOrders && order.productOrders.length > 0) {
        this.products = order.productOrders.map((po: any) => ({
          product: po.product,
          quantity: po.quantity,
          variantId: po.variantId || null,
          variant: po.variant || null
        }));
      }

      console.log('✅ Datos asignados. Cliente:', this.client);
      console.log('✅ Productos:', this.products);
      console.log('✅ Sucursal:', this.branch);

      this.load = false;

      // Navegar al paso 3 después de cargar los datos
      setTimeout(() => {
        console.log('🚀 Intentando navegar. Stepper existe:', !!this.stepper);
        console.log('🚀 Productos.length:', this.products.length);
        if (this.stepper && this.products.length > 0) {
          this.stepper.selectedIndex = 2;
          console.log('✅ Navegación completada al paso:', this.stepper.selectedIndex);

          // ✅ Desmarcar carga después de navegar
          setTimeout(() => {
            this.isLoadingData = false;
          }, 200);
        }
      }, 100);

    } catch (error: any) {
      console.error('❌ Error al cargar orden:', error);
      this.toast.error('Error al cargar la orden');
      this.load = false;
      this.isLoadingData = false; // ✅ Desmarcar en caso de error
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

    // ✅ CRÍTICO: Si estamos cargando datos, permitir cualquier navegación
    if (this.isLoadingData) {
      console.log('⏩ Navegación permitida - Cargando datos');
      return;
    }

    // Si estamos en modo edición, permitir navegación libre entre pasos
    if (this.isEditMode) {
      // Si va al paso 2, permitir sin restricciones
      if (newStepIndex === 1) {
        return;
      }

      // Si va al paso 3 y ya tenemos los datos cargados, permitir
      if (newStepIndex === 2 && this.branch && this.branch.id > 0) {
        return;
      }
    }

    if (newStepIndex === 2) {
      if (this.products.length === 0) {
        this.toast.error('Debe seleccionar al menos un producto');
        setTimeout(() => {
          this.stepper.selectedIndex = event.previouslySelectedIndex;
        }, 0);
        return;
      }

      // Si ya tenemos sucursal (modo edición), no abrir diálogo
      if (this.stepTwoForm.controls.idBranch.value && this.stepTwoForm.controls.idBranch.value > 0) {
        console.log('✅ Sucursal ya seleccionada, mostrando confirmación');
        return;
      }

      this.openBranchDialog();
    }
  }

  async openBranchDialog() {
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(DataOrderDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark') ? ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                  ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      disableClose: true,
      data: {
        title: 'Datos adicionales de la venta',
      },
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
        console.log('Datos de sucursal guardados correctamente');
      })
      .catch((error: any) => {
        console.error('Error en diálogo:', error);
        this.stepper.selectedIndex = 1;
      });
  }

  isDirty(): boolean {
    // ✅ Si estamos cargando datos iniciales, no hay cambios
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

    console.log('Cliente seleccionado:', ev.id === 0 ? 'Anónimo' : ev.name);
    this.goToNextStep();
  }

  productsSelect(products: ProductOrderSelect[]){
    this.products = products;
    console.log('Productos seleccionados:', this.products);
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
    this.load = true;
    this.isSaving = true;
    this.crud.baseUrl = URL_ORDERS;

    // Si estamos en modo edición, usar updateId
    if (this.isEditMode && this.id) {
      await firstValueFrom(this.crud.updateId(this.id, order))
        .then((response: any) => {
          this.toast.success('Venta actualizada correctamente');
          this.load = false;
        })
        .catch((error: any) => {
          console.log('err: ', error);
          this.toast.error(error.message);
          this.load = false;
        })
        .finally(() => {
          this.load = false;
          this.router.navigate(['dashboard/orders']);
        });
    } else {
      // Modo creación normal
      await firstValueFrom(this.crud.save(order))
        .then((response: any) => {
          this.toast.success(response.message);
          this.load = false;
        })
        .catch((error: any) => {
          console.log('err: ', error);
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
