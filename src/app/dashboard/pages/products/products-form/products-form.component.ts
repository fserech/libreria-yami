import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

// Services
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';

// Components
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { CheckboxComponent } from '../../../../shared/components/checkbox/checkbox.component';
import { ToggleComponent } from '../../../../shared/components/toggle/toggle.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matArrowBackOutline,
  matSaveOutline,
  matInfoOutline,
  matInventory2Outline,
  matDriveFileRenameOutlineOutline,
  matDescriptionOutline,
  matAttachMoneyOutline,
  matQrCodeOutline,
  matHelpOutline,
  matArrowForwardOutline,
  matCategoryOutline,
  matFilterBAndWOutline,
  matStackedBarChartOutline,
  matProductionQuantityLimitsOutline,
} from '@ng-icons/material-icons/outline';

// Constants & Interfaces
import { URL_PRODUCTS } from '../../../../shared/constants/endpoints';
import { REGUEX_DECIMAL_INT, REGUX_AFL } from '../../../../shared/constants/reguex';
import { Product, ProductVariant } from '../../../../shared/interfaces/product';
import { InputOptionsSelect } from '../../../../shared/interfaces/input';
import { environment } from '../../../../../environments/environment';
import BaseForm from '../../../../shared/classes/base-form';
import { FormComponent } from '../../../../shared/guards/pending-changes.guard';
import { ProductVariantComponent } from '../Components/product-variant/product-variant.component';

@Component({
  selector: 'app-products-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    ToggleComponent,
    NgIconComponent,
    ProductVariantComponent
  ],
  templateUrl: './products-form.component.html',
  styleUrl: './products-form.component.scss',
  viewProviders: [provideIcons({
    matArrowBackOutline,
    matSaveOutline,
    matInfoOutline,
    matInventory2Outline,
    matDriveFileRenameOutlineOutline,
    matDescriptionOutline,
    matAttachMoneyOutline,
    matQrCodeOutline,
    matHelpOutline,
    matArrowForwardOutline,
    matCategoryOutline,
    matFilterBAndWOutline,
    matStackedBarChartOutline,
    matProductionQuantityLimitsOutline
  })]
})
export default class ProductsFormComponent extends BaseForm implements OnInit, FormComponent {

  @ViewChild(ProductVariantComponent) variantComponent!: ProductVariantComponent;

  // ==================== FORMS ====================
  productForm: FormGroup;
  stockForm: FormGroup;

  // ==================== DATA ====================
  product: Product;
  variants: ProductVariant[] = [];

  // ==================== OPTIONS ====================
  categoryOptions: InputOptionsSelect[] = [];
  brandOptions: InputOptionsSelect[] = [];
  supplierOptions: InputOptionsSelect[] = [];

  // ==================== UI STATE ====================
  activeTab: 'general' | 'variants' = 'general';
  productType: 'simple' | 'variant' = 'simple';

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
  ) {
    super(crud, toast, auth, bpo);
    this.mode = this.setMode(this.route.snapshot.paramMap.get('mode'));
    if (this.mode !== 'new') this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.crud.baseUrl = URL_PRODUCTS;
    this.initForms();
  }

  // ==================== INITIALIZATION ====================

  initForms() {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.pattern(REGUX_AFL), Validators.maxLength(100)]],
      productDesc: ['', [Validators.required, Validators.maxLength(255)]],
      categoryId: ['', Validators.required],
      brandRef: ['', Validators.required],
      active: [true]
    });

    this.stockForm = this.fb.group({
      sku: ['', [Validators.required, Validators.maxLength(50)]],
      costPrice: ['', [Validators.required, Validators.pattern(REGUEX_DECIMAL_INT)]],
      salePrice: ['', [Validators.required, Validators.pattern(REGUEX_DECIMAL_INT)]],
      currentStock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
      maxStock: [100, [Validators.required, Validators.min(1)]],
      supplierId: this.fb.array([])
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadSelectOptions();

    if (this.mode === 'edit') {
      await this.loadProduct();
    }
  }

  // ==================== DATA LOADING ====================

  async loadSelectOptions(): Promise<void> {
    try {
      const [categories, brands, suppliersResponse] = await Promise.all([
        firstValueFrom(this.crud.http.get<any[]>(`${environment.apiUrl}/api/v1/categories`)),
        firstValueFrom(this.crud.http.get<any[]>(`${environment.apiUrl}/api/v1/categories/brands`)),
        firstValueFrom(this.crud.http.get<any>(`${environment.apiUrl}/api/v1/suppliers`))
      ]);

      this.categoryOptions = categories.map(cat => ({
        value: cat.id.toString(),
        label: cat.categoryName
      }));

      this.brandOptions = brands.map(brand => ({
        value: brand.id.toString(),
        label: brand.brandName
      }));

      const suppliersList = Array.isArray(suppliersResponse)
        ? suppliersResponse
        : (suppliersResponse.content || []);

      this.supplierOptions = suppliersList.map(supplier => ({
        value: supplier.id.toString(),
        label: supplier.supplierName
      }));

      this.initSupplierFormArrays(suppliersList.length);

      this.productForm.markAsPristine();
      this.stockForm.markAsPristine();

    } catch (error) {
      console.error('Error cargando opciones:', error);
      this.toast.error('Error al cargar las opciones');
    }
  }

  initSupplierFormArrays(count: number) {
    const stockSuppliers = this.stockForm.get('supplierId') as FormArray;
    stockSuppliers.clear();

    for (let i = 0; i < count; i++) {
      stockSuppliers.push(new FormControl(false));
    }
  }

  async loadProduct(): Promise<void> {
    this.load = true;
    try {
      const product: Product = await firstValueFrom(this.crud.getId(this.id));

      this.productForm.patchValue({
        productName: product.productName,
        productDesc: product.productDesc,
        categoryId: product.categoryId?.toString(),
        brandRef: product.brandRef?.toString(),
        active: product.active
      });

      this.productType = product.hasVariants ? 'variant' : 'simple';

      if (this.productType === 'simple') {
        this.stockForm.patchValue({
          sku: product.sku,
          costPrice: Number(product.costPrice).toFixed(2),
          salePrice: Number(product.salePrice).toFixed(2),
          currentStock: product.currentStock,
          minStock: product.minStock,
          maxStock: product.maxStock
        });

        if (product.supplierId) {
          this.setSuppliers(this.stockForm, product.supplierId);
        }
      } else {
        if (product.variants && product.variants.length > 0) {
          this.variants = product.variants;
        }
      }

      this.productForm.markAsPristine();
      this.stockForm.markAsPristine();

    } catch (error) {
      console.error('Error al cargar producto:', error);
      this.toast.error('Error al cargar el producto');
    } finally {
      this.load = false;
    }
  }

  // ==================== PRODUCT TYPE MANAGEMENT ====================

  changeProductType(type: 'simple' | 'variant') {
    if (this.variants.length > 0 && type === 'simple') {
      if (!confirm('¿Estás seguro? Se perderán todas las variantes creadas.')) {
        return;
      }
      this.variants = [];
    }

    this.productType = type;
  }

  onCategoryChange() {
    // El componente hijo manejará la carga de atributos
  }

  onVariantsChange(variants: ProductVariant[]) {
    this.variants = variants;
  }

  // ==================== SKU GENERATION ====================

  generateSKU() {
    const brand = this.brandOptions.find(b => b.value === this.productForm.value.brandRef)?.label || 'UNK';
    const category = this.categoryOptions.find(c => c.value === this.productForm.value.categoryId)?.label || 'UNK';
    const timestamp = Date.now().toString().slice(-6);

    const sku = `${brand.substring(0, 3).toUpperCase()}-${category.substring(0, 3).toUpperCase()}-${timestamp}`;
    this.stockForm.patchValue({ sku });
  }

  // ==================== HELPERS ====================

  setSuppliers(form: FormGroup, supplierId: number[]) {
    const supplierFormArray = form.get('supplierId') as FormArray;
    this.supplierOptions.forEach((option, index) => {
      const isSelected = supplierId.includes(Number(option.value));
      supplierFormArray.at(index).setValue(isSelected);
    });
  }

  validateStockMinMax() {
    const maxControl = this.stockForm.get('maxStock');
    const minControl = this.stockForm.get('minStock');

    if (maxControl?.value && minControl?.value) {
      const max = parseFloat(maxControl.value);
      const min = parseFloat(minControl.value);

      if (max <= min) {
        maxControl.setErrors({ stockMaxLessThanMin: true });
        minControl.setErrors({ stockMinGreaterThanMax: true });
      } else {
        if (maxControl.hasError('stockMaxLessThanMin')) {
          maxControl.setErrors(null);
        }
        if (minControl.hasError('stockMinGreaterThanMax')) {
          minControl.setErrors(null);
        }
      }
    }
  }

  // ==================== FORM SUBMISSION ====================

  canSubmit(): boolean {
    if (this.productForm.invalid) return false;

    if (this.productType === 'simple') {
      return this.stockForm.valid;
    } else {
      return this.variants.length > 0;
    }
  }

  async submit() {
    if (!this.canSubmit()) {
      this.toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.load = true;
    this.isSaving = true;

    try {
      let product: Product;

      if (this.productType === 'simple') {
        const supplierFormArray = this.stockForm.get('supplierId') as FormArray;
        const selectedSuppliers = this.supplierOptions
          .filter((_, index) => supplierFormArray.at(index).value)
          .map(option => Number(option.value));

        product = {
          id: this.id || null,
          productName: this.productForm.value.productName.trim(),
          productDesc: this.productForm.value.productDesc.trim(),
          categoryId: Number(this.productForm.value.categoryId),
          brandRef: Number(this.productForm.value.brandRef),
          hasVariants: false,
          sku: this.stockForm.value.sku.trim(),
          costPrice: Number(this.stockForm.value.costPrice),
          salePrice: Number(this.stockForm.value.salePrice),
          currentStock: Number(this.stockForm.value.currentStock),
          minStock: Number(this.stockForm.value.minStock),
          maxStock: Number(this.stockForm.value.maxStock),
          supplierId: selectedSuppliers,
          active: this.productForm.value.active
        };
      } else {
        if (!this.variants || this.variants.length === 0) {
          this.toast.error('Debes agregar al menos una variante');
          this.load = false;
          this.isSaving = false;
          return;
        }

        const validatedVariants = this.variants.map(variant => ({
          id: variant.id || null,
          sku: variant.sku.trim(),
          variantName: variant.variantName.trim(),
          costPrice: Number(variant.costPrice),
          salePrice: Number(variant.salePrice),
          currentStock: Number(variant.currentStock),
          minStock: Number(variant.minStock),
          maxStock: Number(variant.maxStock),
          attributes: variant.attributes || {},
          supplierId: variant.supplierId || [],
          active: variant.active !== undefined ? variant.active : true
        }));

        product = {
          id: this.id || null,
          productName: this.productForm.value.productName.trim(),
          productDesc: this.productForm.value.productDesc.trim(),
          categoryId: Number(this.productForm.value.categoryId),
          brandRef: Number(this.productForm.value.brandRef),
          hasVariants: true,
          active: this.productForm.value.active,
          variants: validatedVariants
        };
      }

      console.log('Producto a enviar:', JSON.stringify(product, null, 2));

      if (this.mode === 'edit') {
        const response: any = await firstValueFrom(this.crud.updateId(this.id, product));
        this.toast.success(response.message || 'Producto actualizado correctamente');
      } else {
        const response: any = await firstValueFrom(this.crud.save(product));
        this.toast.success(response.message || 'Producto creado correctamente');
      }

      this.productForm.markAsPristine();
      this.stockForm.markAsPristine();

      this.router.navigate(['dashboard/products']);

    } catch (error: any) {
      console.error('Error completo:', error);

      let errorMessage = 'Error al guardar el producto';

      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.toast.error(errorMessage);
    } finally {
      this.load = false;
      this.isSaving = false;
    }
  }

  // ==================== NAVIGATION ====================

  switchTab(tab: 'general' | 'variants') {
    if (tab === 'variants' && !this.productForm.get('categoryId')?.value) {
      this.toast.error('Primero debes seleccionar una categoría');
      return;
    }
    this.activeTab = tab;
  }

  back() {
    this.router.navigate(['dashboard/products']);
  }

  // ==================== CAMBIOS SIN GUARDAR ====================

  isDirty(): boolean {
    // Si ya hay variantes creadas, NO mostrar mensaje de cambios sin guardar
    if (this.productType === 'variant' && this.variantComponent?.hasVariants()) {
      return false;
    }

    // Para productos simples o variantes sin crear, verificar formularios dirty
    const formsAreDirty = this.productForm.dirty || this.stockForm.dirty;

    // Para productos con variantes, verificar si hay cambios en el formulario de variantes
    const hasUnsavedVariantChanges = this.productType === 'variant'
      && this.variantComponent?.hasUnsavedChanges();

    return formsAreDirty || !!hasUnsavedVariantChanges;
  }

  // ==================== TEMPLATE HELPERS ====================

  getCategoryIdAsNumber(): number | null {
    const categoryId = this.productForm.get('categoryId')?.value;
    return categoryId ? Number(categoryId) : null;
  }
}
