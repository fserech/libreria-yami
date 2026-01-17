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

  // ✅ MODIFICADO: Hacer el formulario de cliente opcional
  clientForm = this._formBuilder.group({
    id: [0], // Ya no es requerido
    name: [''], // Ya no es requerido
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

      if(this.mode !== 'new') this.id = Number(this.route.snapshot.paramMap.get('id'));
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

  ngAfterViewInit(): void {}

  onStepChange(event: StepperSelectionEvent): void {
    const newStepIndex = event.selectedIndex;

    console.log('📍 Cambio de paso:', {
      anterior: event.previouslySelectedIndex,
      nuevo: newStepIndex,
      productosSeleccionados: this.products.length
    });

    if (newStepIndex === 2) {
      if (this.products.length === 0) {
        this.toast.error('Debe seleccionar al menos un producto');
        setTimeout(() => {
          this.stepper.selectedIndex = event.previouslySelectedIndex;
        }, 0);
        return;
      }

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

        // ✅ MODIFICADO: Manejar cliente anónimo
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

  ngOnInit(): void {}

  // ✅ MODIFICADO: Permitir avanzar sin cliente
  isDirty(): boolean {
    return true; // Siempre permite avanzar
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

  getUserId(){
    return this.auth.getUserData().id;
  }
}
