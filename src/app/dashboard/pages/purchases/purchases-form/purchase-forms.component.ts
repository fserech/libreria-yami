// purchases-form.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';

// Services
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../shared/services/auth.service';

// Components
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent } from '@angular/cdk/stepper';

// Icons
import {
  matArrowBackOutline,
  matSaveOutline,
  matStoreOutline,
  matCalendarTodayOutline,
  matDescriptionOutline,
  matArrowForwardOutline
} from '@ng-icons/material-icons/outline';

// Constants & Interfaces
import { URL_PURCHASES } from '../../../../shared/constants/endpoints';
import { Purchase, PurchaseProductSelect } from '../../../../shared/interfaces/purchase';
import { InputOptionsSelect } from '../../../../shared/interfaces/input';
import { environment } from '../../../../../environments/environment';
import BaseForm from '../../../../shared/classes/base-form';
import { FormComponent } from '../../../../shared/guards/pending-changes.guard';
import { PurchasesProductsSelectComponent } from '../components/purchases-products-select/purchases-products-select.component';
import { PurchasesConfirmComponent } from '../components/purchases-confirm/purchases-confirm.component';

// Componentes de compras (debes crearlos)


@Component({
  selector: 'app-purchases-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    InputComponent,
    SelectComponent,
    NgIconComponent,
    MatStepperModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    PurchasesProductsSelectComponent,
    PurchasesConfirmComponent
  ],
 templateUrl: './purchase-forms.component.html',
  styleUrl: './purchase-forms.component.scss',
  viewProviders: [
    provideIcons({
      matArrowBackOutline,
      matSaveOutline,
      matStoreOutline,
      matCalendarTodayOutline,
      matDescriptionOutline,
      matArrowForwardOutline
    })
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ]
})


export default class PurchaseFormsComponent extends BaseForm implements OnInit, AfterViewInit, FormComponent{
   @ViewChild(PurchasesProductsSelectComponent) selectProducts: PurchasesProductsSelectComponent;
  @ViewChild(PurchasesConfirmComponent) confirmPurchase: PurchasesConfirmComponent;
  @ViewChild('stepper') stepper!: MatStepper;

  // ==================== FORMS ====================
  supplierForm: FormGroup;
  productsForm: FormGroup;

  // ==================== DATA ====================
  supplier: { id: number; name: string };
  products: PurchaseProductSelect[] = [];
  purchaseDate: string;
  observation: string;
  totalAmount: number = 0;

  // ==================== OPTIONS ====================
  supplierOptions: InputOptionsSelect[] = [];

  constructor(
    private fb: FormBuilder,
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private bpo: BreakpointObserver
  ) {
    super(crud, toast, auth, bpo);
    this.mode = this.setMode(this.route.snapshot.paramMap.get('mode'));

    if (this.mode !== 'new') this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.crud.baseUrl = URL_PURCHASES;
    this.initForms();
  }

  // ==================== INITIALIZATION ====================

  initForms() {
    this.supplierForm = this.fb.group({
      supplierId: ['', Validators.required],
      purchaseDate: [this.getTodayDate(), Validators.required],
      observation: ['', Validators.maxLength(255)]
    });

    this.productsForm = this.fb.group({
      products: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();

    if (this.mode === 'edit') {
      this.loadPurchase();
    }
  }

  ngAfterViewInit(): void {
    // Configuraciones adicionales si son necesarias
  }

  // ==================== DATA LOADING ====================

  async loadSuppliers(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.crud.http.get<any>(`${environment.apiUrl}/api/v1/suppliers`)
      );

      const suppliersList = Array.isArray(response)
        ? response
        : (response.content || []);

      this.supplierOptions = suppliersList.map(supplier => ({
        value: supplier.id.toString(),
        label: supplier.supplierName
      }));

    } catch (error) {
      console.error('Error cargando proveedores:', error);
      this.toast.error('Error al cargar proveedores');
    }
  }

  async loadPurchase(): Promise<void> {
    this.load = true;
    try {
      const purchase: Purchase = await firstValueFrom(this.crud.getId(this.id));

      this.supplierForm.patchValue({
        supplierId: purchase.supplierId?.toString(),
        purchaseDate: purchase.purchaseDate,
        observation: purchase.observation
      });

      if (purchase.items && purchase.items.length > 0) {
        this.products = purchase.items;
        this.calculateTotal();
      }

      this.supplierForm.markAsPristine();
      this.productsForm.markAsPristine();

    } catch (error) {
      console.error('Error al cargar compra:', error);
      this.toast.error('Error al cargar la compra');
    } finally {
      this.load = false;
    }
  }

  // ==================== STEPPER NAVIGATION ====================

  onStepChange(event: StepperSelectionEvent): void {
    // Lógica adicional al cambiar de paso si es necesaria
  }

  goToNextStep(): void {
    if (this.stepper.selectedIndex === 0 && this.supplierForm.valid) {
      const supplierId = this.supplierForm.get('supplierId')?.value;
      const supplierName = this.supplierOptions.find(
        opt => opt.value === supplierId
      )?.label || '';

      this.supplier = {
        id: Number(supplierId),
        name: supplierName
      };

      this.purchaseDate = this.supplierForm.get('purchaseDate')?.value;
      this.observation = this.supplierForm.get('observation')?.value;
    }

    this.stepper.next();
  }

  goToPreviousStep(): void {
    this.stepper.previous();
  }

  goToStep(index: number): void {
    this.stepper.selectedIndex = index;
  }

  backStep(ev: boolean): void {
    if (ev) {
      this.stepper.selectedIndex = 1;
    }
  }

  // ==================== PRODUCT SELECTION ====================

  productsSelect(products: PurchaseProductSelect[]): void {
    this.products = products;
    this.calculateTotal();
  }

  async finalizedSelectProducts(ev: boolean): Promise<void> {
    if (ev && this.products.length > 0) {
      this.calculateTotal();
      this.goToNextStep();
    } else {
      this.toast.info('Selecciona al menos 1 producto.');
    }
  }

  calculateTotal(): void {
    this.totalAmount = this.products.reduce(
      (sum, item) => sum + (item.subtotal || 0),
      0
    );
  }

  // ==================== FORM SUBMISSION ====================

  async submit(purchase: Purchase): Promise<void> {
    this.load = true;
    this.isSaving = true;

    try {
      if (this.mode === 'edit') {
        const response: any = await firstValueFrom(
          this.crud.updateId(this.id, purchase)
        );
        this.toast.success(response.message || 'Compra actualizada correctamente');
      } else {
        const response: any = await firstValueFrom(this.crud.save(purchase));
        this.toast.success(response.message || 'Compra registrada correctamente');
      }

      this.supplierForm.markAsPristine();
      this.productsForm.markAsPristine();

      this.router.navigate(['dashboard/purchases']);

    } catch (error: any) {
      console.error('Error al guardar compra:', error);

      let errorMessage = 'Error al guardar la compra';
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.toast.error(errorMessage);
    } finally {
      this.load = false;
      this.isSaving = false;
    }
  }

  // ==================== HELPERS ====================

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  isDirty(): boolean {
    return this.supplierForm.dirty || this.productsForm.dirty;
  }

  back(): void {
    this.router.navigate(['dashboard/purchases']);
  }
}
