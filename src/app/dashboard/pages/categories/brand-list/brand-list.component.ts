import { Component, OnInit } from '@angular/core';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matArrowBackOutline } from '@ng-icons/material-icons/outline';
import BaseForm from '../../../../shared/classes/base-form';
import { FormControl, FormGroup,Validators} from '@angular/forms';
import { Brand } from '../../../../shared/interfaces/brand';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../../../../shared/services/auth.service';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { URL_BRANDS } from '../../../../shared/constants/endpoints';
import { REGUX_AFL } from '../../../../shared/constants/reguex';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-brand-list',
  standalone: true,
  imports: [HeaderComponent,NgIconComponent , InputComponent,ToggleComponent],
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.scss',
  viewProviders: [provideIcons({matArrowBackOutline})]
})
export default class BrandListComponent extends BaseForm implements OnInit {

  form: FormGroup;
  brand: Brand;

  constructor(
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
  this.crud.baseUrl = URL_BRANDS;
 this.form = new FormGroup({
  name: new FormControl('', [Validators.required, Validators.pattern(REGUX_AFL)]),
  brandDesc: new FormControl('', [Validators.required]),
  active: new FormControl(true)
 });

  if(this.mode === 'edit'){
        this.load = true;
        firstValueFrom(this.crud.getId(this.id))
        .then((brand: Brand) => {
          this.form.controls['name'].setValue(brand.brandName);
          this.form.controls['brandDesc'].setValue(brand.brandDesc);
          this.form.controls['active'].setValue(brand.active);
        })
        .catch((error: any) => {
          console.log('error id: ', error);
        })
        .finally(() => {
          this.load = false;
        });
      }
 }

  ngOnInit(): void  {}
  isDirty(): boolean {
    return this.form.dirty;
  }

  back(){
    this.router.navigate(['/dashboard/categories/brands']);
  }

    changeBrandActive($event){
    const value: boolean = $event.target.checked;
  }

  async submit(){
   this.load = true;
   this.isSaving = true;
   const brand: Brand = {
   id: (this.id) ? this.id : null,
   brandName: this.form.controls['name'].value,
   brandDesc: this.form.controls['brandDesc'].value,
   active: this.form.controls['active'].value
   }
   if(this.mode === 'edit'){
      await firstValueFrom(this.crud.updateId(this.id, brand))
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
              this.router.navigate(['dashboard/categories/brands']);
            });
    }else if(this.mode === 'new'){
      await firstValueFrom(this.crud.save(brand))
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
              this.router.navigate(['dashboard/categories/brands']);
            });
    }else{
      this.toast.info('Estas en modo vista');
      this.router.navigate(['dashboard/categories/brands']);
    }
}
}
