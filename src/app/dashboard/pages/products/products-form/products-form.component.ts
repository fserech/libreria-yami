import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import BaseForm from '../../../../shared/classes/base-form';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { URL_PRODUCTS } from '../../../../shared/constants/endpoints';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Product } from '../../../../shared/interfaces/product';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matArrowBackOutline } from '@ng-icons/material-icons/outline';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';
import { firstValueFrom } from 'rxjs';
import { REGUEX_DECIMAL_INT, REGUX_AFL } from '../../../../shared/constants/reguex';
import { AuthService } from '../../../../shared/services/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SelectComponent } from "../../../../shared/components/select/select.component";
import { Supplier } from '../../../../shared/interfaces/supplier';
import { Brand } from '../../../../shared/interfaces/brand';
import { Category } from '../../../../shared/interfaces/category';
import { InputOptionsSelect } from '../../../../shared/interfaces/input';
import { environment } from '../../../../../environments/environment';
import { CheckboxComponent } from "../../../../shared/components/checkbox/checkbox.component";

@Component({
  selector: 'app-products-form',
  standalone: true,
  imports: [HeaderComponent, InputComponent, NgIconComponent, ToggleComponent, SelectComponent, CheckboxComponent],
  templateUrl: './products-form.component.html',
  styleUrl: './products-form.component.scss',
  viewProviders: [ provideIcons({ matArrowBackOutline })]
})
export default class ProductsFormComponent extends BaseForm implements OnInit{

  form: FormGroup;
  product: Product;
  brandRef: Brand;
  supplierId: Supplier;
  categoryId: Category;
  categoryOptions: InputOptionsSelect[] = [];
brandOptions: InputOptionsSelect[] = [];
supplierOptions: InputOptionsSelect[] = [];

  get brandLabels(): string[] {
    return this.brandOptions.map(opt => opt.label);
  }

  get supplierLabels(): string[] {
    return this.supplierOptions.map(opt => opt.label);
  }

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private bpo: BreakpointObserver,
     private fb: FormBuilder
    ){
      super(crud, toast, auth, bpo);
      this.mode = this.setMode(this.route.snapshot.paramMap.get('mode'));
      if(this.mode !== 'new') this.id = Number(this.route.snapshot.paramMap.get('id'));

      this.crud.baseUrl = URL_PRODUCTS;
      this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.pattern(REGUX_AFL)]),
      productDesc: new FormControl('', [Validators.required]),
      costPrice: new FormControl('', [Validators.required, Validators.pattern(REGUEX_DECIMAL_INT)]),
      salePrice: new FormControl('', [Validators.required, Validators.pattern(REGUEX_DECIMAL_INT)]),
      categoryId: new FormControl('', [Validators.required]),
      brandRef: this.fb.array([]),
      supplierId: this.fb.array([]),
      minStock: new FormControl('', [Validators.required, Validators.pattern(REGUEX_DECIMAL_INT)]),
      maxStock: new FormControl('', [Validators.required, Validators.pattern(REGUEX_DECIMAL_INT)]),
      active: new FormControl(true)
    });

      if(this.mode === 'edit'){
      this.load = true;
      firstValueFrom(this.crud.getId(this.id))
      .then(async (product: Product) => {
        // Esperar a que se carguen las opciones
        await this.loadSelectOptions();
        this.form.controls['name'].setValue(product.productName);
        this.form.controls['productDesc'].setValue(product.productDesc);
        this.form.controls['costPrice'].setValue(Number(product.costPrice).toFixed(2));
        this.form.controls['salePrice'].setValue(Number(product.salePrice).toFixed(2));
        this.form.controls['categoryId'].setValue(product.categoryId);
            // Marcar las marcas seleccionadas
        const brandFormArray = this.form.get('brandRef') as FormArray;
        const selectedBrands = Array.isArray(product.brandRef) ? product.brandRef : [product.brandRef];
        this.brandOptions.forEach((option, index) => {
          const isSelected = selectedBrands.includes(Number(option.value));
          brandFormArray.at(index).setValue(isSelected);
        });
      // Marcar los proveedores seleccionados
      const supplierFormArray = this.form.get('supplierId') as FormArray;
      const selectedSuppliers = Array.isArray(product.supplierId) ? product.supplierId : [product.supplierId];
      this.supplierOptions.forEach((option, index) => {
        const isSelected = selectedSuppliers.includes(Number(option.value));
        supplierFormArray.at(index).setValue(isSelected);
      });
        this.form.controls['minStock'].setValue(product.minStock);
        this.form.controls['maxStock'].setValue(product.maxStock);
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

  async ngOnInit(): Promise<void> {
    await this.loadSelectOptions();
  }

  async loadSelectOptions(): Promise<void> {
  try {
    // Cargar categorías
    const categoriesUrl = `${environment.apiUrl}/api/v1/categories`;
    const categories = await firstValueFrom(this.crud.http.get<Category[]>(categoriesUrl));
    this.categoryOptions = categories.map((cat: Category) => ({
      value: cat.id.toString(),
      label: cat.categoryName
    }));

    // Cargar marcas
    const brandsUrl = `${environment.apiUrl}/api/v1/categories/brands`;
    const brands = await firstValueFrom(this.crud.http.get<Brand[]>(brandsUrl));
    this.brandOptions = brands.map((brand: Brand) => ({
      value: brand.id.toString(),
      label: brand.brandName
    }));

    // Inicializar FormArray de marcas
    const brandFormArray = this.form.get('brandRef') as FormArray;
    brands.forEach(() => brandFormArray.push(new FormControl(false)));

    // Cargar proveedores
    const suppliersUrl = `${environment.apiUrl}/api/v1/suppliers`;
    const suppliers = await firstValueFrom(this.crud.http.get<Supplier[]>(suppliersUrl));
    this.supplierOptions = suppliers.map((supplier: Supplier) => ({
      value: supplier.id.toString(),
      label: supplier.supplierName
    }));

    // Inicializar FormArray de proveedores
    const supplierFormArray = this.form.get('supplierId') as FormArray;
    suppliers.forEach(() => supplierFormArray.push(new FormControl(false)));

  } catch (error) {
    console.error('Error cargando opciones de selects:', error);
    this.toast.error('Error al cargar las opciones');
  }
}

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
    // Obtener IDs de marcas seleccionadas
    const brandFormArray = this.form.get('brandRef') as FormArray;
    const selectedBrands = this.brandOptions
      .filter((_, index) => brandFormArray.at(index).value)
      .map(option => Number(option.value));
    // Obtener IDs de proveedores seleccionados
    const supplierFormArray = this.form.get('supplierId') as FormArray;
    const selectedSuppliers = this.supplierOptions
      .filter((_, index) => supplierFormArray.at(index).value)
      .map(option => Number(option.value));
    const product: Product = {
  id: (this.id) ? this.id : null,
  productName: this.form.controls['name'].value,
  productDesc: this.form.controls['productDesc'].value,
  costPrice: this.form.controls['costPrice'].value,
  salePrice: this.form.controls['salePrice'].value,
  categoryId: this.form.controls['categoryId'].value,
  brandRef: this.form.controls['brandRef'].value,
  supplierId: this.form.controls['supplierId'].value,
  minStock: this.form.controls['minStock'].value,
  maxStock: this.form.controls['maxStock'].value,
  active: this.form.controls['active'].value,
   isSelected: this.form.controls['active'].value,

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

   validateStockMinMax() {
    const stockMaxControl = this.form.get('maxStock');
    const stockMinControl = this.form.get('minStock');

    if (stockMaxControl.value && stockMinControl.value) {
      const stockMax = parseFloat(stockMaxControl.value);
      const stockMin = parseFloat(stockMinControl.value);

      if (stockMax <= stockMin) {
        stockMaxControl.setErrors({ 'stockMaxLessThanMin': true });
        stockMinControl.setErrors({ 'stockMinGreaterThanMax': true });
      } else {
        stockMaxControl.setErrors(null);
        stockMinControl.setErrors(null);
      }
    }
  }
}
