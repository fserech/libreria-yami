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
import { URL_SUPPLIERS, URL_PURCHASES, URL_PRODUCTS, URL_BRANCHES } from '../../../../shared/constants/endpoints';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SearchInputTextComponent } from '../../../../shared/components/search-input-text/search-input-text.component';
import { ChatBubbleComponent } from '../../../../shared/components/chat-bubble/chat-bubble.component';
import { NgClass } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { PurchasesSupplierSelectComponent } from '../components/purchases-supplier-select/purchases-supplier-select.component';
import { Supplier } from '../../../../shared/interfaces/supplier';
import { MatIconModule } from '@angular/material/icon';
import { STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent } from '@angular/cdk/stepper';
import { PurchasesProductsSelectComponent } from '../components/purchases-products-select/purchases-products-select.component';
import { Product } from '../../../../shared/interfaces/product';
import { Purchase, ProductPurchaseSelect } from '../../../../shared/interfaces/purchase';
import { DataPurchaseDialogComponent } from '../components/data-purchase-dialog/data-purchase-dialog.component';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { PurchasesConfirmComponent } from '../components/purchases-confirm/purchases-confirm.component';
import { Branch } from '../../../../shared/interfaces/branch';

@Component({
  selector: 'app-purchases-form',
  standalone: true,
  imports: [
    HeaderComponent,
    InputComponent,
    NgIconComponent,
    ToggleComponent,
    MatStepperModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    SearchInputTextComponent,
    NgIcon,
    ChatBubbleComponent,
    NgClass,
    PurchasesSupplierSelectComponent,
    DialogModule,
    MatIconModule,
    PurchasesProductsSelectComponent,
    PurchasesConfirmComponent
  ],
  templateUrl: './purchase-forms.component.html',
  styleUrl: './purchase-forms.component.scss',
  viewProviders: [provideIcons({ matArrowBackOutline, matSearchOutline })],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ]
})
export default class PurchasesFormComponent extends BaseForm implements OnInit, AfterViewInit {

  @ViewChild(PurchasesProductsSelectComponent) selectProducts!: PurchasesProductsSelectComponent;
  @ViewChild(PurchasesConfirmComponent) confirmPurchase!: PurchasesConfirmComponent;
  @ViewChild('stepper') stepper!: MatStepper;

  form: FormGroup;

  supplierForm = this._formBuilder.group({
    id: [0, Validators.required],
    supplierName: ['', Validators.required],
    email: [''],
    phone: [''],
    address: ['']
  });

  stepTwoForm = this._formBuilder.group({
    productsSelected: [false, Validators.requiredTrue]
  });

  stepThreeForm = this._formBuilder.group({
    idBranch: [0, Validators.required],
    branchName: ['', Validators.required],
    observation: [''],
    deliveryDate: ['']
  });

  // ⭐ Inicialización del supplier con valores por defecto
  supplier: Supplier = {
    id: 0,
    supplierName: '',
    supplierDesc: '',
    email: '',
    phone: '',
    address: '',
    active: true
  };

  products: ProductPurchaseSelect[] = [];
  branch: Branch | null = null;
  observation: string = '';
  deliveryDate: string = '';

  // Variable para controlar el flujo de guardado
  private isSavingPurchase: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private bpo: BreakpointObserver,
    public dialog: Dialog,
  ) {
    super(crud, toast, auth, bpo);
    this.mode = this.setMode(this.route.snapshot.paramMap.get('mode'));

    if (this.mode !== 'new') this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.crud.baseUrl = URL_PURCHASES;

    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      productDesc: new FormControl(),
      active: new FormControl(true)
    });

    if (this.mode === 'edit') {
      this.load = true;
    }
  }

  ngAfterViewInit(): void {
    // Lógica adicional después de la inicialización de la vista
  }

  onStepChange(event: StepperSelectionEvent): void {
   
  }

  ngOnInit(): void {
    // Inicialización del componente
  }

  /**
   * Método para detectar cambios sin guardar
   */
  isDirty(): boolean {
    if (this.load || this.isSaving || this.isSavingPurchase) {
      return false;
    }

    if (this.stepper && this.stepper.selectedIndex > 0) {
      return false;
    }

    const hasSelectedSupplier = this.supplier && this.supplier.id > 0;
    return hasSelectedSupplier;
  }

  get selectedProducts(): ProductPurchaseSelect[] {
    return this.products;
  }

  introSearch(): void {
    const name: any = this.form.controls['name'].value;
    if (name && name !== '') {
      this.filter(name);
    }
  }

  initPage(): void {
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, 1, 10);
    this.form.reset();
  }

  filter(name?: string, id?: number): void {
    let filter = '';
    if (id) {
      filter = filter.concat(`&id=${id}`);
    }
    if (name) {
      filter = filter.concat(`&name=${name}`);
    }

    this.filters = filter;
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, filter);
  }

  back(): void {
    this.router.navigate(['dashboard/purchases']);
  }

  /**
   * ⭐ Método llamado cuando se selecciona un proveedor
   */
  supplierSelect(supplier: Supplier): void {
   

    // Actualizar el formulario del proveedor
    this.supplierForm.controls.id.setValue(supplier.id ?? 0);
    this.supplierForm.controls.supplierName.setValue(supplier.supplierName ?? '');
    this.supplierForm.controls.email.setValue(supplier.email ?? '');
    this.supplierForm.controls.phone.setValue(supplier.phone ?? '');
    this.supplierForm.controls.address.setValue(supplier.address ?? '');

    // ⭐ CRÍTICO: Construir el objeto Supplier completo
    this.supplier = {
      id: supplier.id ?? 0,
      supplierName: supplier.supplierName ?? '',
      supplierDesc: supplier.supplierDesc ?? '',
      email: supplier.email ?? '',
      phone: supplier.phone ?? '',
      address: supplier.address ?? '',
      active: supplier.active ?? true
    };

    

    // ⚠️ Limpiar productos si había alguno seleccionado
    if (this.products.length > 0) {
      
      this.products = [];
      this.stepTwoForm.controls.productsSelected.setValue(false);
    }

    this.goToNextStep();
  }

  /**
   * ⭐ Método llamado cuando se actualizan los productos seleccionados
   */
  productsSelect(products: ProductPurchaseSelect[]): void {
    this.products = products;
    

    // Actualizar validación del step 2
    if (this.products.length > 0) {
      this.stepTwoForm.controls.productsSelected.setValue(true);
    } else {
      this.stepTwoForm.controls.productsSelected.setValue(false);
    }
  }

  /**
   * Método llamado cuando se finaliza la selección de productos
   */
  async finalizedSelectProducts(confirmed: boolean): Promise<void> {
    if (confirmed && this.products.length > 0) {
      this.stepTwoForm.controls.productsSelected.setValue(true);
      this.goToNextStep();
    } else {
      this.toast.info('Selecciona al menos 1 producto.');
    }
  }

  /**
   * Método llamado desde el componente de confirmación
   * cuando el usuario presiona "Finalizar compra"
   */
  async confirmPurchaseWithDialog(): Promise<void> {
    // Validar que tenemos un proveedor válido
    if (!this.supplier || !this.supplier.id) {
      this.toast.error('Error: No se ha seleccionado un proveedor válido');
      return;
    }

    // Validar que tenemos productos
    if (!this.products || this.products.length === 0) {
      this.toast.error('Error: No hay productos seleccionados');
      return;
    }

    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(DataPurchaseDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark')
        ? ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4']
        : ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      disableClose: true,
      data: {
        title: 'Datos adicionales de la compra',
      },
    });

    await firstValueFrom(dialogRef.closed)
      .then(async (data: { idBranch: number, branchName: string, observation: string, deliveryDate?: Date }) => {
        if (data) {
          this.stepThreeForm.controls.idBranch.setValue(data.idBranch);
          this.stepThreeForm.controls.branchName.setValue(data.branchName);
          this.stepThreeForm.controls.observation.setValue(data.observation ?? '');
          this.stepThreeForm.controls.deliveryDate.setValue(data.deliveryDate ? data.deliveryDate.toString() : '');

          this.branch = {
            id: data.idBranch,
            name: data.branchName,
            address: '',
            telephone: '',
            idUser: this.getUserId(),
            active: true
          };

          this.observation = data.observation ?? '';
          this.deliveryDate = data.deliveryDate ? new Date(data.deliveryDate).toISOString() : '';

          await this.buildAndSubmitPurchase();
        }
      })
      .catch((error: any) => {
        if (error?.message) {
          this.toast.error(error.message);
        }
      });
  }

  /**
   * ⭐ Construye y envía la compra al servidor
   */
  private async buildAndSubmitPurchase(): Promise<void> {
    if (!this.branch || !this.branch.id) {
      this.toast.error('Debe seleccionar una sucursal');
      return;
    }

    if (!this.supplier || !this.supplier.id) {
      this.toast.error('Error: Proveedor no válido');
      return;
    }

    if (!this.products || this.products.length === 0) {
      this.toast.error('Error: No hay productos en la compra');
      return;
    }

    const userId = this.auth.getUserData().id;
    const name: string = this.auth.getUserData().sub;
    const email: string = this.auth.getUserData().email;

    // ⭐ Construir purchase con los precios específicos del proveedor
    const purchase: Purchase = {
      supplierId: this.supplier.id,
      userId: userId,
      user: name,
      emailUser: email,
      idBranch: this.branch.id,
      branchName: this.branch.name,
      purchaseDate: new Date().toISOString().split('T')[0],
      deliveryDate: null,
      observation: this.observation || '',
      status: 'PENDING',
      products: this.products.map(product => ({
        productId: product.product.id,
        variantId: product.variantId || null,
        priceCost: product.product.costPrice, // ⭐ Ya tiene el precio del proveedor correcto
        quantity: product.quantity,
        subtotal: parseFloat((product.product.costPrice * product.quantity).toFixed(2))
      }))
    };

    
    await this.submit(purchase);
  }

  /**
   * Navegación del stepper
   */
  goToNextStep(): void {
    this.stepper.next();
  }

  goToPreviousStep(): void {
    this.stepper.previous();
  }

  goToStep(index: number): void {
    this.stepper.selectedIndex = index;
  }

  /**
   * Método para regresar del paso de confirmación al paso de productos
   */
  backStep(shouldGoBack: boolean): void {
    if (shouldGoBack) {
      this.stepper.selectedIndex = 1;
    }
  }

  /**
   * Envía la compra al servidor
   */
  async submit(purchase: Purchase): Promise<void> {
    this.load = true;
    this.isSaving = true;
    this.isSavingPurchase = true;
    this.crud.baseUrl = URL_PURCHASES;

    await firstValueFrom(this.crud.save(purchase))
      .then((response: any) => {
        this.toast.success(response.message || 'Compra registrada exitosamente');
        this.load = false;
      })
      .catch((error: any) => {
        console.error('❌ Error al guardar compra:', error);
        const errorMessage = error?.error?.message || error?.message || 'Error al registrar la compra';
        this.toast.error(errorMessage);
        this.load = false;
        this.isSavingPurchase = false;
      })
      .finally(() => {
        this.load = false;
        this.isSaving = false;
        this.router.navigate(['dashboard/purchases']);
      });
  }

  getUserId(): number {
    return this.auth.getUserData().id;
  }
}
