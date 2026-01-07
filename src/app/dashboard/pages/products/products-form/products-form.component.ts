import { Component, OnInit } from '@angular/core';
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
  matAddCircleOutline,
  matEditOutline,
  matDeleteOutline,
  matDriveFileRenameOutlineOutline,
  matDescriptionOutline,
  matAttachMoneyOutline,
  matSellOutline,
  matQrCodeOutline,
  matHelpOutline,
  matTuneOutline,
  matInventoryOutline,
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


interface VariantAttribute {
  id: number;
  attributeName: string;
  attributeValues: string[];
  required: boolean;
}

interface ManualAttribute {
  key: string;
  value: string;
}

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
    SelectComponent
  ],
  templateUrl: './products-form.component.html',
  styleUrl: './products-form.component.scss',
  viewProviders: [provideIcons({
    matArrowBackOutline,
    matSaveOutline,
    matInfoOutline,
    matInventory2Outline,
    matAddCircleOutline,
    matEditOutline,
    matDeleteOutline,
    matDriveFileRenameOutlineOutline,
    matDescriptionOutline,
    matAttachMoneyOutline,
    matSellOutline,
    matQrCodeOutline,
    matHelpOutline,
    matTuneOutline,
    matInventoryOutline,
    matArrowForwardOutline,
    matCategoryOutline,
    matFilterBAndWOutline,
    matStackedBarChartOutline,
    matProductionQuantityLimitsOutline
  })]
})
export default class ProductsFormComponent extends BaseForm implements OnInit, FormComponent {

  // ==================== FORMS ====================
  productForm: FormGroup;
  stockForm: FormGroup;
  variantForm: FormGroup;

  // ==================== DATA ====================
  product: Product;
  variants: ProductVariant[] = [];
  manualAttributes: ManualAttribute[] = [];

  // ==================== OPTIONS ====================
  categoryOptions: InputOptionsSelect[] = [];
  brandOptions: InputOptionsSelect[] = [];
  supplierOptions: InputOptionsSelect[] = [];
  availableAttributes: VariantAttribute[] = [];
  selectedAttributeValues: string[] = [];

  // ==================== UI STATE ====================
  activeTab: 'general' | 'variants' = 'general';
  productType: 'simple' | 'variant' = 'simple';
  editingVariantIndex: number = -1;
  showCustomAttrInput: boolean = false;
  showCustomValueInput: boolean = false;

  // ==================== FORM CONTROLS ====================
  attrKeyControl = new FormControl('');
  attrValueControl = new FormControl('');
  customAttrKeyControl = new FormControl('');
  customAttrValueControl = new FormControl('');

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

    this.variantForm = this.fb.group({
      sku: ['', [Validators.required, Validators.maxLength(50)]],
      variantName: ['', [Validators.required, Validators.maxLength(100)]],
      costPrice: ['', [Validators.required, Validators.pattern(REGUEX_DECIMAL_INT)]],
      salePrice: ['', [Validators.required, Validators.pattern(REGUEX_DECIMAL_INT)]],
      currentStock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
      maxStock: [100, [Validators.required, Validators.min(1)]],
      supplierId: this.fb.array([]),
      active: [true],
      // Campos para agregar atributos manualmente
      attrKey: [''],
      attrValue: ['']
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
      this.variantForm.markAsPristine();

    } catch (error) {
      console.error('Error cargando opciones:', error);
      this.toast.error('Error al cargar las opciones');
    }
  }

  initSupplierFormArrays(count: number) {
    const stockSuppliers = this.stockForm.get('supplierId') as FormArray;
    const variantSuppliers = this.variantForm.get('supplierId') as FormArray;

    stockSuppliers.clear();
    variantSuppliers.clear();

    for (let i = 0; i < count; i++) {
      stockSuppliers.push(new FormControl(false));
      variantSuppliers.push(new FormControl(false));
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

        await this.loadCategoryAttributes(product.categoryId);
      }

      this.productForm.markAsPristine();
      this.stockForm.markAsPristine();
      this.variantForm.markAsPristine();

    } catch (error) {
      console.error('Error al cargar producto:', error);
      this.toast.error('Error al cargar el producto');
    } finally {
      this.load = false;
    }
  }

  async loadCategoryAttributes(categoryId: number): Promise<void> {
    try {
      const attributes = await firstValueFrom(
        this.crud.http.get<VariantAttribute[]>(
          `${environment.apiUrl}/api/v1/categories/${categoryId}/attributes`
        )
      );

      this.availableAttributes = attributes || [];

    } catch (error) {
            this.availableAttributes = [];
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

    if (type === 'variant' && this.productForm.get('categoryId')?.value) {
      this.loadCategoryAttributes(Number(this.productForm.get('categoryId')?.value));
    }
  }

  async onCategoryChange() {
    const categoryId = this.productForm.get('categoryId')?.value;

    if (this.productType === 'variant' && categoryId) {
      await this.loadCategoryAttributes(Number(categoryId));
    }
  }

  // ==================== MANUAL ATTRIBUTES ====================

  onAttributeKeyChange(event: any) {
    const value = event.target.value;

    if (value === '__custom__') {
      this.showCustomAttrInput = true;
      this.showCustomValueInput = false;
      this.selectedAttributeValues = [];
      this.attrValueControl.setValue('');
      this.customAttrKeyControl.setValue('');
    } else if (value) {
      this.showCustomAttrInput = false;
      this.showCustomValueInput = false;
      this.customAttrValueControl.setValue('');

      // Buscar los valores disponibles para este atributo
      const attribute = this.availableAttributes.find(attr => attr.attributeName === value);
      if (attribute) {
        this.selectedAttributeValues = attribute.attributeValues;
      } else {
        this.selectedAttributeValues = [];
      }

      this.attrValueControl.setValue('');
    } else {
      this.showCustomAttrInput = false;
      this.showCustomValueInput = false;
      this.selectedAttributeValues = [];
    }
  }

  onAttributeValueChange(event: any) {
    const value = event.target.value;

    if (value === '__custom__') {
      this.showCustomValueInput = true;
      this.customAttrValueControl.setValue('');
    } else {
      this.showCustomValueInput = false;
    }
  }

  addManualAttribute() {
    let key = '';
    let value = '';

    // Determinar el key
    if (this.showCustomAttrInput) {
      key = this.customAttrKeyControl.value?.trim() || '';
    } else if (this.availableAttributes.length > 0) {
      key = this.attrKeyControl.value?.trim() || '';
    } else {
      key = this.variantForm.get('attrKey')?.value?.trim() || '';
    }

    // Determinar el value
    if (this.showCustomValueInput) {
      value = this.customAttrValueControl.value?.trim() || '';
    } else if (this.selectedAttributeValues.length > 0) {
      const selectedValue = this.attrValueControl.value;
      value = selectedValue && selectedValue !== '__custom__' ? selectedValue.trim() : '';
    } else {
      value = this.variantForm.get('attrValue')?.value?.trim() || '';
    }

    if (!key || !value) {
      this.toast.error('Ingresa tanto el nombre como el valor del atributo');
      return;
    }

    const exists = this.manualAttributes.some(attr => attr.key.toLowerCase() === key.toLowerCase());
    if (exists) {
      this.toast.error('Ya existe un atributo con ese nombre');
      return;
    }

    this.manualAttributes.push({ key, value });

    // Resetear controles
    this.attrKeyControl.setValue('');
    this.attrValueControl.setValue('');
    this.customAttrKeyControl.setValue('');
    this.customAttrValueControl.setValue('');
    this.variantForm.patchValue({ attrKey: '', attrValue: '' });
    this.selectedAttributeValues = [];
    this.showCustomAttrInput = false;
    this.showCustomValueInput = false;

    this.toast.success('Atributo agregado');
  }

  removeManualAttribute(index: number) {
    this.manualAttributes.splice(index, 1);
  }

  // ==================== SKU GENERATION ====================

  generateSKU() {
    const brand = this.brandOptions.find(b => b.value === this.productForm.value.brandRef)?.label || 'UNK';
    const category = this.categoryOptions.find(c => c.value === this.productForm.value.categoryId)?.label || 'UNK';
    const timestamp = Date.now().toString().slice(-6);

    const sku = `${brand.substring(0, 3).toUpperCase()}-${category.substring(0, 3).toUpperCase()}-${timestamp}`;
    this.stockForm.patchValue({ sku });
  }

  generateVariantSKU() {
    const brand = this.brandOptions.find(b => b.value === this.productForm.value.brandRef)?.label || 'UNK';
    const timestamp = Date.now().toString().slice(-6);

    const attrValues = this.manualAttributes
      .map(attr => attr.value.substring(0, 3).toUpperCase())
      .join('-');

    const sku = `${brand.substring(0, 3).toUpperCase()}-${attrValues || 'VAR'}-${timestamp}`;
    this.variantForm.patchValue({ sku });
  }

  // ==================== VARIANT MANAGEMENT ====================

  addOrUpdateVariant() {
    const baseFieldsValid =
      this.variantForm.get('sku')?.valid &&
      this.variantForm.get('variantName')?.valid &&
      this.variantForm.get('costPrice')?.valid &&
      this.variantForm.get('salePrice')?.valid &&
      this.variantForm.get('currentStock')?.valid &&
      this.variantForm.get('minStock')?.valid &&
      this.variantForm.get('maxStock')?.valid;

    if (!baseFieldsValid) {
      this.toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const supplierFormArray = this.variantForm.get('supplierId') as FormArray;
    const selectedSuppliers = this.supplierOptions
      .filter((_, index) => supplierFormArray.at(index).value)
      .map(option => Number(option.value));

    if (selectedSuppliers.length === 0) {
      this.toast.error('Debes seleccionar al menos un proveedor');
      return;
    }

    // Construir objeto de atributos desde manualAttributes
    const attributes: { [key: string]: string } = {};
    this.manualAttributes.forEach(attr => {
      attributes[attr.key] = attr.value;
    });

    const variant: ProductVariant = {
      id: this.editingVariantIndex >= 0 ? this.variants[this.editingVariantIndex].id : null,
      sku: this.variantForm.value.sku.trim(),
      variantName: this.variantForm.value.variantName.trim(),
      costPrice: Number(this.variantForm.value.costPrice),
      salePrice: Number(this.variantForm.value.salePrice),
      currentStock: Number(this.variantForm.value.currentStock),
      minStock: Number(this.variantForm.value.minStock),
      maxStock: Number(this.variantForm.value.maxStock),
      attributes: attributes,
      supplierId: selectedSuppliers,
      active: this.variantForm.value.active
    };

    console.log('Variante a agregar:', variant);

    const isDuplicate = this.variants.some((v, idx) =>
      v.sku === variant.sku && idx !== this.editingVariantIndex
    );

    if (isDuplicate) {
      this.toast.error('El SKU ya existe en otra variante');
      return;
    }

    if (this.editingVariantIndex >= 0) {
      this.variants[this.editingVariantIndex] = variant;
      this.toast.success('Variante actualizada');
      this.editingVariantIndex = -1;
    } else {
      this.variants.push(variant);
      this.toast.success('Variante agregada');
    }

    this.resetVariantForm();
  }

  editVariant(index: number) {
    const variant = this.variants[index];
    this.editingVariantIndex = index;

    this.variantForm.patchValue({
      sku: variant.sku,
      variantName: variant.variantName,
      costPrice: variant.costPrice,
      salePrice: variant.salePrice,
      currentStock: variant.currentStock,
      minStock: variant.minStock,
      maxStock: variant.maxStock,
      active: variant.active
    });

    // Cargar atributos manuales
    this.manualAttributes = [];
    if (variant.attributes) {
      Object.keys(variant.attributes).forEach(key => {
        this.manualAttributes.push({
          key: key,
          value: variant.attributes[key]
        });
      });
    }

    this.setSuppliers(this.variantForm, variant.supplierId);
  }

  deleteVariant(index: number) {
    if (confirm('¿Estás seguro de eliminar esta variante?')) {
      this.variants.splice(index, 1);
      this.toast.success('Variante eliminada');
    }
  }

  cancelEditVariant() {
    this.editingVariantIndex = -1;
    this.resetVariantForm();
  }

  resetVariantForm() {
    this.variantForm.patchValue({
      sku: '',
      variantName: '',
      costPrice: '',
      salePrice: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 100,
      active: true,
      attrKey: '',
      attrValue: ''
    });

    this.manualAttributes = [];

    // Resetear controles de atributos
    this.attrKeyControl.setValue('');
    this.attrValueControl.setValue('');
    this.customAttrKeyControl.setValue('');
    this.customAttrValueControl.setValue('');
    this.selectedAttributeValues = [];
    this.showCustomAttrInput = false;
    this.showCustomValueInput = false;

    const supplierFormArray = this.variantForm.get('supplierId') as FormArray;
    supplierFormArray.controls.forEach(control => control.setValue(false));
  }

  // ==================== HELPERS ====================

  setSuppliers(form: FormGroup, supplierId: number[]) {
    const supplierFormArray = form.get('supplierId') as FormArray;
    this.supplierOptions.forEach((option, index) => {
      const isSelected = supplierId.includes(Number(option.value));
      supplierFormArray.at(index).setValue(isSelected);
    });
  }

  getAttributeOptions(attr: VariantAttribute): InputOptionsSelect[] {
    return attr.attributeValues.map(value => ({
      value: value,
      label: value
    }));
  }

  validateStockMinMax() {
    const form = this.productType === 'simple' ? this.stockForm : this.variantForm;
    const maxControl = form.get('maxStock');
    const minControl = form.get('minStock');

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

  hasAttributes(): boolean {
    return this.availableAttributes && this.availableAttributes.length > 0;
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
      this.variantForm.markAsPristine();

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

  isDirty(): boolean {
    const formsAreDirty = this.productForm.dirty || this.stockForm.dirty || this.variantForm.dirty;
    const hasUnsavedVariants = this.productType === 'variant' && this.editingVariantIndex >= 0;

    return formsAreDirty || hasUnsavedVariants;
  }
}
