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
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SearchInputTextComponent } from '../../../../shared/components/search-input-text/search-input-text.component';
import { ChatBubbleComponent } from '../../../../shared/components/chat-bubble/chat-bubble.component';
import { NgClass } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { PurchasesSupplierSelectComponent } from '../components/purchases-supplier-select/purchases-supplier-select.component';
import { Supplier } from '../../../../shared/interfaces/supplier';
import {MatIconModule} from '@angular/material/icon';
import {STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent} from '@angular/cdk/stepper';
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
  imports: [HeaderComponent, InputComponent, NgIconComponent, ToggleComponent, MatStepperModule,
    FormsModule, MatFormFieldModule, ReactiveFormsModule, MatButtonModule, MatInputModule,
    SearchInputTextComponent, NgIcon, ChatBubbleComponent, NgClass, PurchasesSupplierSelectComponent,
    DialogModule, MatIconModule, PurchasesProductsSelectComponent, PurchasesConfirmComponent],
  templateUrl: './purchase-forms.component.html',
  styleUrl: './purchase-forms.component.scss',
  viewProviders: [ provideIcons({ matArrowBackOutline, matSearchOutline })],
  providers:[
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {displayDefaultIndicatorType: false},
    },
  ]
})
export default class PurchasesFormComponent extends BaseForm implements OnInit, AfterViewInit {

  @ViewChild(PurchasesProductsSelectComponent) selectProducts: PurchasesProductsSelectComponent;
  @ViewChild(PurchasesConfirmComponent) confirmPurchase: PurchasesConfirmComponent;
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
    idBranch: [0, Validators.required],
    branchName: ['', Validators.required],
    observation: [''],
    deliveryDate: ['']
  });

  supplier: Supplier;
  products: ProductPurchaseSelect[] = [];
  branch: Branch | null = null;
  observation: string;
  deliveryDate: string = '';

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
      this.crud.baseUrl = URL_PURCHASES;

      this.form = new FormGroup({
        name: new FormControl('', [Validators.required]),
        productDesc: new FormControl(),
        active: new FormControl(true)
      });

      if(this.mode === 'edit'){
        this.load = true;
      }
  }

  ngAfterViewInit(): void {
  }

  onStepChange(event: StepperSelectionEvent): void {
    // Lógica adicional si es necesaria
  }

  ngOnInit(): void {}

  isDirty(): boolean {
    return this.supplierForm.valid;
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
    this.router.navigate(['dashboard/purchases']);
  }

  supplierSelect(ev: Supplier){
    this.supplierForm.controls.id.setValue(ev.id);
    this.supplierForm.controls.supplierName.setValue(ev.supplierName);
    this.supplierForm.controls.email.setValue(ev.email);
    this.supplierForm.controls.phone.setValue(ev.phone);
    this.supplierForm.controls.address.setValue(ev.address || '');

    console.log('Proveedor seleccionado', this.supplierForm.valid);
    this.goToNextStep();
  }

  productsSelect(products: ProductPurchaseSelect[]){
    this.products = [];
    this.products = products;
  }

  async finalizedSelectProducts(ev: boolean){
    if(ev && this.products.length > 0){
      const darkmode = localStorage.getItem('theme');
      const dialogRef = this.dialog.open(DataPurchaseDialogComponent, {
        backdropClass: ['bg-black/60', 'dark:bg-white'],
        panelClass: (darkmode === 'dark') ? ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                    ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
        width: this.getDialogWidth(),
        closeOnDestroy: true,
        disableClose: true,
        data: {
          title: 'Datos adicionales de la compra',
        },
      });

      await firstValueFrom(dialogRef.closed)
        .then(async (data: { idBranch: number, branchName: string, observation: string, deliveryDate: Date }) => {
          this.stepTwoForm.controls.idBranch.setValue(data.idBranch);
          this.stepTwoForm.controls.branchName.setValue(data.branchName);
          this.stepTwoForm.controls.observation.setValue(data.observation);
          this.stepTwoForm.controls.deliveryDate.setValue(data.deliveryDate ? data.deliveryDate.toString() : '');

          this.supplier = {
            id: Number(this.supplierForm.controls.id.value),
            supplierName: this.supplierForm.controls.supplierName.value,
            supplierDesc: '',
            email: this.supplierForm.controls.email.value,
            phone: this.supplierForm.controls.phone.value,
            address: this.supplierForm.controls.address.value,
            active: true
          };

          // Buscar la sucursal completa desde el backend si es necesario
          // O crear un objeto Branch simplificado con la info disponible
          this.branch = {
            id: this.stepTwoForm.controls.idBranch.value,
            name: this.stepTwoForm.controls.branchName.value,
            address: '', // Se puede obtener del backend si es necesario
            telephone: '', // Se puede obtener del backend si es necesario
            idUser: this.getUserId(),
            active: true
          };

          this.observation = this.stepTwoForm.controls.observation.value;
          // Convertir Date a string ISO
          this.deliveryDate = data.deliveryDate ? new Date(data.deliveryDate).toISOString() : '';
          this.goToNextStep();
        })
        .catch((error: any) => {
          this.toast.error(error.message);
        });
    }else{
      this.toast.info('Selecciona al menos 1 producto.');
    }
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

  async submit(purchase: Purchase){
    this.load = true;
    this.isSaving = true;
    this.crud.baseUrl = URL_PURCHASES;

    await firstValueFrom(this.crud.save(purchase))
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
        this.router.navigate(['dashboard/purchases']);
      });
  }

  getUserId(){
    return this.auth.getUserData().id;
  }
}
