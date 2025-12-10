import { Component, OnInit } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matArrowBackOutline } from '@ng-icons/material-icons/outline';
import { FormControl, FormGroup,Validators} from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';
import BaseForm from '../../../../shared/classes/base-form';
import { Category } from '../../../../shared/interfaces/category';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { URL_CATEGORIES } from '../../../../shared/constants/endpoints';
import { REGUX_AFL } from '../../../../shared/constants/reguex';

@Component({
  selector: 'app-brand-forms',
  standalone: true,
  imports: [HeaderComponent,NgIconComponent , InputComponent,ToggleComponent],
  templateUrl: './category-forms.component.html',
  styleUrl: './category-forms.component.scss',
  viewProviders: [provideIcons({matArrowBackOutline})]
})
export default class CategoryFormsComponent extends BaseForm implements OnInit {

  form: FormGroup;
  category: Category;

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

      this.crud.baseUrl = URL_CATEGORIES;
      this.form = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.pattern(REGUX_AFL)]),
        categoryDesc: new FormControl('', [Validators.required]),
        //price: new FormControl('', [Validators.required, Validators.pattern(REGUEX_DECIMAL_INT)]),
        active: new FormControl(true)
      });

      if(this.mode === 'edit'){
        this.load = true;
        firstValueFrom(this.crud.getId(this.id))
        .then((category: Category) => {
          this.form.controls['name'].setValue(category.categoryName);
          this.form.controls['categoryDesc'].setValue(category.categoryDesc);
          //this.form.controls['price'].setValue(Number(product.price).toFixed(2));
          this.form.controls['active'].setValue(category.active);
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
    this.router.navigate(['dashboard/categories']);
  }

  changeCategoryActive($event){
    const value: boolean = $event.target.checked;
  }

  async submit(){
    this.load = true;
    this.isSaving = true;
    const category: Category = {
      id: (this.id) ? this.id : null,
      categoryName: this.form.controls['name'].value,
      categoryDesc: this.form.controls['categoryDesc'].value,
      //price: this.form.controls['price'].value,
      active: this.form.controls['active'].value
    }

    if(this.mode === 'edit'){
      await firstValueFrom(this.crud.updateId(this.id, category))
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
              this.router.navigate(['dashboard/categories']);
            });
    }else if(this.mode === 'new'){
      await firstValueFrom(this.crud.save(category))
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
              this.router.navigate(['dashboard/categories']);
            });
    }else{
      this.toast.info('Estas en modo vista');
      this.router.navigate(['dashboard/categories']);
    }
  }
}

