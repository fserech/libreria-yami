import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import BaseForm from '../../../../shared/classes/base-form';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { URL_PRODUCTS } from '../../../../shared/constants/endpoints';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Product } from '../../../../shared/interfaces/product';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matArrowBackOutline } from '@ng-icons/material-icons/outline';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';
import { firstValueFrom } from 'rxjs';
import { REGUEX_DECIMAL_INT, REGUX_AFL } from '../../../../shared/constants/reguex';
import { AuthService } from '../../../../shared/services/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-products-form',
  standalone: true,
  imports: [HeaderComponent, InputComponent, NgIconComponent, ToggleComponent],
  templateUrl: './products-form.component.html',
  styleUrl: './products-form.component.scss',
  viewProviders: [ provideIcons({ matArrowBackOutline })]
})
export default class ProductsFormComponent extends BaseForm implements OnInit{

  form: FormGroup;
  product: Product;

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private bpo: BreakpointObserver
    ){
      super(crud, toast, auth, bpo);
      this.mode = this.setMode(this.route.snapshot.paramMap.get('mode'));
      if(this.mode !== 'new') this.id = Number(this.route.snapshot.paramMap.get('id'));

      this.crud.baseUrl = URL_PRODUCTS;
      this.form = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.pattern(REGUX_AFL)]),
        productDesc: new FormControl('', [Validators.required]),
        price: new FormControl('', [Validators.required, Validators.pattern(REGUEX_DECIMAL_INT)]),
        active: new FormControl(true)
      });

      if(this.mode === 'edit'){
        this.load = true;
        firstValueFrom(this.crud.getId(this.id))
        .then((product: Product) => {
          this.form.controls['name'].setValue(product.productName);
          this.form.controls['productDesc'].setValue(product.productDesc);
          this.form.controls['price'].setValue(Number(product.price).toFixed(2));
          this.form.controls['active'].setValue(product.active);
        })
        .catch((error: any) => {
          console.log('error id: ', error);
        })
        .finally(() => {
          this.load = false;
        });
      }
  }

  ngOnInit(): void {}

  isDirty(): boolean {
    return this.form.dirty;
  }

  back() {
    this.router.navigate(['dashboard/products']);
  }

  changeProductActive($event){
    const value: boolean = $event.target.checked;
  }

  async submit(){
    this.load = true;
    this.isSaving = true;
    const product: Product = {
      id: (this.id) ? this.id : null,
      productName: this.form.controls['name'].value,
      productDesc: this.form.controls['productDesc'].value,
      price: this.form.controls['price'].value,
      active: this.form.controls['active'].value
    }

    if(this.mode === 'edit'){
      await firstValueFrom(this.crud.updateId(this.id, product))
            .then((response: any) => {
              this.toast.success(response.message);
              this.load = false;
            })
            .catch((error: any) => {
              this.toast.error(error.message);
              this.load = false;
            })
            .finally(() => {
              this.load = false;
              this.router.navigate(['dashboard/products']);
            });
    }else if(this.mode === 'new'){
      await firstValueFrom(this.crud.save(product))
            .then((response: any) => {
              this.load = false;
              this.toast.success(response.message);
            })
            .catch((error: any) => {
              this.load = false;
              this.toast.error(error.message);
            })
            .finally(() => {
              this.load = false;
              this.router.navigate(['dashboard/products']);
            });
    }else{
      this.toast.info('Estas en modo vista');
      this.router.navigate(['dashboard/products']);
    }
  }
}
