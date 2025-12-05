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
import { URL_CLIENTS, URL_ORDERS, URL_PRODUCTS } from '../../../../shared/constants/endpoints';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SearchInputTextComponent } from '../../../../shared/components/search-input-text/search-input-text.component';
import { ChatBubbleComponent } from '../../../../shared/components/chat-bubble/chat-bubble.component';
import { NgClass } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { OrdersClientSelectComponent } from '../components/orders-client-select/orders-client-select.component';
import { allowedDays, Client, OfferDay } from '../../../../shared/interfaces/client';
import {MatIconModule} from '@angular/material/icon';
import {STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent} from '@angular/cdk/stepper';
import { OrdersProductsSelectComponent } from '../components/orders-products-select/orders-products-select.component';
import { Product } from '../../../../shared/interfaces/product';
import { Order, ProductOrderSelect } from '../../../../shared/interfaces/order';
import { DataOrderDialogComponent } from '../components/data-order-dialog/data-order-dialog.component';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { OrdersConfirmComponent } from '../components/orders-confirm/orders-confirm.component';
import { Panel } from '../../../../shared/interfaces/panel';
@Component({
  selector: 'app-orders-form',
  standalone: true,
  imports: [HeaderComponent, InputComponent, NgIconComponent, ToggleComponent, MatStepperModule,
    FormsModule, MatFormFieldModule, ReactiveFormsModule, MatButtonModule, MatInputModule,
    SearchInputTextComponent, NgIcon, ChatBubbleComponent, NgClass, OrdersClientSelectComponent,
    DialogModule, MatIconModule, OrdersProductsSelectComponent, OrdersConfirmComponent],
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
    id: [0, Validators.required],
    name: ['', Validators.required],
    offerDay: ['', Validators.required],
    address: [''],
    telephone: ['']
  });
  stepTwoForm = this._formBuilder.group({
    panel: ['', Validators.required],
    observation: ['']
  });

  client: Client;
  products: ProductOrderSelect[] = [];
  panel: Panel;
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

  ngAfterViewInit(): void {
  }

  onStepChange(event: StepperSelectionEvent): void {
    // if(event.previouslySelectedIndex === 2 && event.selectedIndex === 1){
    // }
  }

  ngOnInit(): void {}

  isDirty(): boolean {
    return this.clientForm.valid;
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

  filter(name?: string, id?: number,offerDay?: string){

    let filter = '';
    if(id){
      filter = filter.concat(`&id=${id}`)
    }
    if(name){
      filter = filter.concat(`&name=${name}`);
    }
    if(offerDay){
      filter = filter.concat(`&offerDay=${offerDay}`);
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
    this.clientForm.controls.offerDay.setValue(ev.offerDay);
    this.clientForm.controls.address.setValue(ev.address);
    this.clientForm.controls.telephone.setValue(ev.telephone);
    // this.clientForm.dirty = true;
    console.log('cfd', this.clientForm.valid);
    this.goToNextStep();
  }

  productsSelect(products: ProductOrderSelect[]){
    this.products = [];
    this.products = products;
  }

  async finalizedSelectProducts(ev: boolean){
    if(ev && this.products.length > 0){
      const darkmode = localStorage.getItem('theme');
      const dialogRef = this.dialog.open(DataOrderDialogComponent, {
        backdropClass: ['bg-black/60', 'dark:bg-white'],
        panelClass: (darkmode === 'dark') ? ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
                    ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
        width: this.getDialogWidth(),
        closeOnDestroy: true,
        disableClose: true,
        data: {
          title: 'Datos adicionales',
        },
        });

        await firstValueFrom(dialogRef.closed)
        .then(async (data: { panel: string, observation: string }) => {
          this.stepTwoForm.controls.panel.setValue(data.panel);
          this.stepTwoForm.controls.observation.setValue(data.observation);

          const offerDayValue = this.clientForm.controls.offerDay.value;

          this.client = {
            id: Number(this.clientForm.controls.id.value),
            name: this.clientForm.controls.name.value,
            address: this.clientForm.controls.address.value,
            telephone: this.clientForm.controls.telephone.value,
            offerDay: offerDayValue as 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY',
            idUser: this.getUserId()
          };
          this.panel =  { key: this.stepTwoForm.controls.panel.value as 'P1' | 'P2',
                          label: (this.stepTwoForm.controls.panel.value) === 'P1' ? 'Panel 1' : ' Panel 2'};
          this.observation =  this.stepTwoForm.controls.observation.value;
          this.goToNextStep();
        })
        .catch((error: any) => {
          this.toast.error(error.message);
        });
      // this.goToNextStep();
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
