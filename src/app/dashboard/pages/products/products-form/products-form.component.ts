import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  matCheckCircleOutline,
  matPercentOutline,
  matLightbulbOutline,
  matInventoryOutline,
  matAddOutline,
  matTrendingUpOutline,
} from '@ng-icons/material-icons/outline';

// Constants & Interfaces
import { URL_PRODUCTS } from '../../../../shared/constants/endpoints';
import { REGUEX_DECIMAL_INT, REGUX_AFL } from '../../../../shared/constants/reguex';
import { Product, ProductVariant, ProductSupplierPrice } from '../../../../shared/interfaces/product';
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
    FormsModule,
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
    matProductionQuantityLimitsOutline,
    matCheckCircleOutline,
    matPercentOutline,
    matLightbulbOutline,
    matInventoryOutline,
    matAddOutline,
    matTrendingUpOutline,
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

  // ⭐ NUEVA PROPIEDAD: Precios por proveedor
  supplierPrices: ProductSupplierPrice[] = [];

  // ==================== OPTIONS ====================
  categoryOptions: InputOptionsSelect[] = [];
  brandOptions: InputOptionsSelect[] = [];
  supplierOptions: InputOptionsSelect[] = [];

  // ==================== UI STATE ====================
  activeTab: 'general' | 'variants' = 'general';
  productType: 'simple' | 'variant' = 'simple';
  suggestedSalePrice: number = 0;
  private hasBeenSaved: boolean = false;

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
      baseProductName: ['', [Validators.required, Validators.pattern(REGUX_AFL), Validators.maxLength(100)]],
      productDesc: ['', [Validators.maxLength(255)]],
      categoryId: ['', Validators.required],
      brandRef: ['', Validators.required],
      active: [true]
    });

    this.stockForm = this.fb.group({
      sku: ['', [Validators.required, Validators.maxLength(50)]],
      desiredMargin: [''],
      salePrice: ['', [Validators.required, Validators.pattern(REGUEX_DECIMAL_INT), Validators.min(0)]],
      currentStock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
      maxStock: [100, [Validators.required, Validators.min(1)]]
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

      this.productForm.markAsPristine();
      this.stockForm.markAsPristine();

    } catch (error) {
      console.error('Error cargando opciones:', error);
      this.toast.error('Error al cargar las opciones');
    }
  }

  async loadProduct(): Promise<void> {
    this.load = true;
    try {
      const product: Product = await firstValueFrom(this.crud.getId(this.id));

      const baseProductName = this.extractBaseProductName(product.productName, product.brandRef);

      this.productForm.patchValue({
        baseProductName: baseProductName,
        productDesc: product.productDesc,
        categoryId: product.categoryId?.toString(),
        brandRef: product.brandRef?.toString(),
        active: product.active
      });

      this.productType = product.hasVariants ? 'variant' : 'simple';

      if (this.productType === 'simple') {
        // ⭐ CARGAR PRECIOS POR PROVEEDOR si existen
        if (product.supplierPrices && product.supplierPrices.length > 0) {
          this.supplierPrices = product.supplierPrices.map(sp => ({
            ...sp,
            supplierName: this.supplierOptions.find(opt => opt.value === sp.supplierId.toString())?.label
          }));
        } else if (product.costPrice && product.supplierId && product.supplierId.length > 0) {
          // LEGACY: Convertir formato antiguo a nuevo
          this.supplierPrices = product.supplierId.map((supplierId) => ({
            supplierId,
            supplierName: this.supplierOptions.find(opt => opt.value === supplierId.toString())?.label,
            costPrice: product.costPrice || 0
          }));
        }

        const bestCostPrice = this.getBestCostPrice();
        const desiredMargin = product.desiredMargin || this.calculateMarginFromPrices(
          bestCostPrice,
          Number(product.salePrice)
        );

        this.stockForm.patchValue({
          sku: product.sku,
          desiredMargin: desiredMargin.toFixed(2),
          salePrice: Number(product.salePrice).toFixed(2),
          currentStock: product.currentStock,
          minStock: product.minStock,
          maxStock: product.maxStock
        });

        this.calculateSuggestedPrice();
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

  // ==================== PRODUCT NAME GENERATION ====================

  getFullProductName(): string {
    const baseName = this.productForm.get('baseProductName')?.value?.trim() || '';
    const brandId = this.productForm.get('brandRef')?.value;

    if (!baseName) return '';

    if (brandId) {
      const brand = this.brandOptions.find(b => b.value === brandId);
      if (brand) {
        return `${baseName} ${brand.label}`.toUpperCase();
      }
    }

    return baseName.toUpperCase();
  }

  updateProductName(): void {
    // El nombre completo se genera automáticamente
  }

  private extractBaseProductName(fullProductName: string, brandId: number): string {
    if (!fullProductName) return '';

    const brand = this.brandOptions.find(b => b.value === brandId.toString());
    if (brand) {
      const brandName = brand.label.toUpperCase();
      if (fullProductName.toUpperCase().endsWith(brandName)) {
        return fullProductName.substring(0, fullProductName.length - brandName.length).trim();
      }
    }

    return fullProductName;
  }

  // ==================== SUPPLIER PRICES MANAGEMENT ====================

  addSupplierPrice() {
    // Verificar si ya hay un proveedor sin seleccionar o sin precio
    const hasIncomplete = this.supplierPrices.some(sp =>
      sp.supplierId === 0 || sp.costPrice === 0
    );

    if (hasIncomplete) {
      this.toast.error('Por favor completa el proveedor actual (selecciona proveedor Y agrega precio) antes de agregar otro');
      return;
    }

    // Agregar nuevo proveedor vacío
    this.supplierPrices.push({
      supplierId: 0,
      costPrice: 0,
      isPreferred: false
    });
  }

  removeSupplierPrice(supplierPrice: ProductSupplierPrice) {
    const index = this.supplierPrices.indexOf(supplierPrice);
    if (index > -1) {
      this.supplierPrices.splice(index, 1);
      this.calculateSuggestedPrice();
    }
  }

  onSupplierChange(supplierPrice: ProductSupplierPrice) {
    const supplier = this.supplierOptions.find(s => s.value === supplierPrice.supplierId.toString());
    if (supplier) {
      supplierPrice.supplierName = supplier.label;
    }

    // Validar duplicados
    const duplicates = this.supplierPrices.filter(sp =>
      sp.supplierId === supplierPrice.supplierId && sp.supplierId > 0
    );

    if (duplicates.length > 1) {
      this.toast.error('Este proveedor ya está agregado. Por favor selecciona otro.');
      supplierPrice.supplierId = 0;
      supplierPrice.supplierName = undefined;
    }

    this.calculateSuggestedPrice();
  }

  getBestSupplierPrice(): ProductSupplierPrice | null {
    if (this.supplierPrices.length === 0) return null;

    // Filtrar solo proveedores válidos (con ID y precio > 0)
    const validSuppliers = this.supplierPrices.filter(sp =>
      sp.supplierId > 0 && sp.costPrice > 0
    );

    if (validSuppliers.length === 0) return null;

    // Retornar el de MENOR precio (mejor para compra)
    return validSuppliers.reduce((best, current) =>
      current.costPrice < best.costPrice ? current : best
    );
  }

  getBestCostPrice(): number {
    const best = this.getBestSupplierPrice();
    return best?.costPrice || 0;
  }

  // ==================== PRICE CALCULATION ====================

  calculateSuggestedPrice(): void {
    const bestCostPrice = this.getBestCostPrice();
    const desiredMargin = parseFloat(this.stockForm.get('desiredMargin')?.value) || 0;

    if (bestCostPrice > 0 && desiredMargin >= 0) {
      this.suggestedSalePrice = bestCostPrice * (1 + desiredMargin / 100);
    } else {
      this.suggestedSalePrice = 0;
    }
  }

  calculateCurrentMargin(): string {
    const bestCostPrice = this.getBestCostPrice();
    const salePrice = parseFloat(this.stockForm.get('salePrice')?.value) || 0;

    if (bestCostPrice === 0 || salePrice === 0) return '0.00';

    const margin = ((salePrice - bestCostPrice) / bestCostPrice) * 100;
    return margin.toFixed(2);
  }

  calculateProfit(): number {
    const bestCostPrice = this.getBestCostPrice();
    const salePrice = parseFloat(this.stockForm.get('salePrice')?.value) || 0;

    return salePrice - bestCostPrice;
  }

  private calculateMarginFromPrices(costPrice: number, salePrice: number): number {
    if (costPrice === 0) return 0;
    return ((salePrice - costPrice) / costPrice) * 100;
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
async generateSKU() {
  try {
    // ✅ CORRECCIÓN: Usar baseProductName en lugar de productName
    const productName = this.productForm.value.baseProductName || '';
    const namePrefix = productName.substring(0, 3).toUpperCase().replace(/\s/g, '');

    // Obtener las primeras 3 letras de la marca
    const brand = this.brandOptions.find(b => b.value === this.productForm.value.brandRef)?.label || 'UNK';
    const brandPrefix = brand.substring(0, 3).toUpperCase().replace(/\s/g, '');

    let productId = 0;

    // Si estamos editando, usar el ID actual
    if (this.mode === 'edit' && this.id) {
      productId = this.id;
    }
    // Si estamos creando, obtener el siguiente ID
    else if (this.mode === 'new') {
      const currentBaseUrl = this.crud.baseUrl;
      this.crud.baseUrl = URL_PRODUCTS;

      try {
        const response: any = await this.crud.getAll('');
        const maxId = response && response.length > 0
          ? Math.max(...response.map((p: any) => p.id || 0))
          : 0;
        productId = maxId + 1;
      } finally {
        this.crud.baseUrl = currentBaseUrl;
      }
    }

    // Generar SKU con formato: NOM-MAR-0001
    const correlativo = productId.toString().padStart(4, '0');
    const sku = `${namePrefix}-${brandPrefix}-${correlativo}`;

    console.log('✅ SKU generado:', {
      baseProductName: productName,  // ← Cambiado para claridad
      namePrefix,
      brand,
      brandPrefix,
      id: productId,
      sku
    });

    this.stockForm.patchValue({ sku });

  } catch (error) {
    console.error('❌ Error al generar SKU:', error);
    const timestamp = Date.now().toString().slice(-6);
    this.stockForm.patchValue({ sku: `ERR-UNK-${timestamp}` });
  }
}
  // ==================== HELPERS ====================

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
    console.log('🔍 Validación canSubmit()');
    console.log('productForm.invalid:', this.productForm.invalid);
    console.log('stockForm.invalid:', this.stockForm.invalid);
    console.log('productType:', this.productType);
    console.log('supplierPrices:', this.supplierPrices);

    if (this.productForm.invalid) {
      console.log('❌ productForm inválido');
      return false;
    }

    if (this.productType === 'simple') {
      // Validar campos básicos del stock
      const skuValid = this.stockForm.get('sku')?.valid;
      const salePriceValid = this.stockForm.get('salePrice')?.valid;
      const currentStockValid = this.stockForm.get('currentStock')?.valid;
      const minStockValid = this.stockForm.get('minStock')?.valid;
      const maxStockValid = this.stockForm.get('maxStock')?.valid;

      console.log('✅ SKU válido:', skuValid);
      console.log('✅ Precio venta válido:', salePriceValid);
      console.log('✅ Stock actual válido:', currentStockValid);
      console.log('✅ Stock mín válido:', minStockValid);
      console.log('✅ Stock máx válido:', maxStockValid);

      if (!skuValid || !salePriceValid || !currentStockValid || !minStockValid || !maxStockValid) {
        console.log('❌ Campos de stock inválidos');
        return false;
      }

      // Validar que haya al menos un proveedor con precio válido
      const validSuppliers = this.supplierPrices.filter(sp => {
        const isValid = Number(sp.supplierId) > 0 && Number(sp.costPrice) > 0;
        console.log(`Proveedor ${sp.supplierId}: costPrice=${sp.costPrice}, válido=${isValid}`);
        return isValid;
      });

      console.log('✅ Proveedores válidos:', validSuppliers.length);
      console.log('✅ Lista de proveedores válidos:', validSuppliers);

      // Debe tener AL MENOS un proveedor válido
      return validSuppliers.length > 0;
    } else {
      const hasVariants = this.variants.length > 0;
      console.log('✅ Tiene variantes:', hasVariants);
      return hasVariants;
    }
  }

  async submit() {
    console.log('🚀 Iniciando submit...');

    // Validación detallada
    if (this.productForm.invalid) {
      const invalidFields = [];
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        if (control?.invalid) {
          invalidFields.push(key);
        }
      });
      this.toast.error(`Campos inválidos en información general: ${invalidFields.join(', ')}`);
      return;
    }

    if (this.productType === 'simple') {
      // Validar stock form
      if (this.stockForm.invalid) {
        const invalidFields = [];
        Object.keys(this.stockForm.controls).forEach(key => {
          const control = this.stockForm.get(key);
          if (control?.invalid) {
            invalidFields.push(key);
          }
        });
        this.toast.error(`Campos inválidos en stock: ${invalidFields.join(', ')}`);
        return;
      }

      // Validar proveedores
      if (this.supplierPrices.length === 0) {
        this.toast.error('⚠️ Debes agregar al menos un proveedor con precio');
        return;
      }

      const validSupplierPrices = this.supplierPrices.filter(sp =>
        Number(sp.supplierId) > 0 && Number(sp.costPrice) > 0
      );

      if (validSupplierPrices.length === 0) {
        this.toast.error('⚠️ Debes configurar al menos un proveedor con precio válido (mayor a 0)');
        return;
      }

      console.log('✅ Validación exitosa, proveedores válidos:', validSupplierPrices);
    } else {
      if (!this.variants || this.variants.length === 0) {
        this.toast.error('Debes agregar al menos una variante');
        return;
      }
    }

    this.load = true;
    this.isSaving = true;

    try {
      let product: Product;
      const fullProductName = this.getFullProductName();

      if (this.productType === 'simple') {
        const validSupplierPrices = this.supplierPrices.filter(sp =>
          Number(sp.supplierId) > 0 && Number(sp.costPrice) > 0
        );

        // Obtener el mejor precio de costo para compatibilidad con backend legacy
        const bestCostPrice = this.getBestCostPrice();

        product = {
          id: this.id || null,
          productName: fullProductName,
          baseProductName: this.productForm.value.baseProductName.trim(),
          productDesc: this.productForm.value.productDesc?.trim() || '',
          categoryId: Number(this.productForm.value.categoryId),
          brandRef: Number(this.productForm.value.brandRef),
          hasVariants: false,
          sku: this.stockForm.value.sku.trim(),

          // ⭐ COMPATIBILIDAD: Enviar tanto el formato nuevo como el legacy
          supplierPrices: validSupplierPrices.map(sp => ({
            supplierId: Number(sp.supplierId),
            costPrice: Number(sp.costPrice)
          })),

          // Legacy: Enviar costPrice y supplierId para compatibilidad
          costPrice: bestCostPrice,
          supplierId: validSupplierPrices.map(sp => Number(sp.supplierId)),

          salePrice: Number(this.stockForm.value.salePrice),
          desiredMargin: Number(this.calculateCurrentMargin()),
          currentStock: Number(this.stockForm.value.currentStock),
          minStock: Number(this.stockForm.value.minStock),
          maxStock: Number(this.stockForm.value.maxStock),
          active: this.productForm.value.active
        };
      } else {
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
          productName: fullProductName,
          baseProductName: this.productForm.value.baseProductName.trim(),
          productDesc: this.productForm.value.productDesc?.trim() || '',
          categoryId: Number(this.productForm.value.categoryId),
          brandRef: Number(this.productForm.value.brandRef),
          hasVariants: true,
          active: this.productForm.value.active,
          variants: validatedVariants
        };
      }

      console.log('📦 Producto a enviar:', JSON.stringify(product, null, 2));

      if (this.mode === 'edit') {
        const response: any = await firstValueFrom(this.crud.updateId(this.id, product));
        this.toast.success(response.message || 'Producto actualizado correctamente');
      } else {
        const response: any = await firstValueFrom(this.crud.save(product));
        this.toast.success(response.message || 'Producto creado correctamente');
      }

      // Marcar formularios como pristine
      this.productForm.markAsPristine();
      this.stockForm.markAsPristine();
      this.hasBeenSaved = true;

      // Pequeña espera antes de navegar para asegurar que los guards detecten pristine
      await new Promise(resolve => setTimeout(resolve, 100));

      this.router.navigate(['dashboard/products']);

    } catch (error: any) {
      console.error('❌ Error completo:', error);

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
    // Si ya se guardó exitosamente, no hay cambios pendientes
    if (this.hasBeenSaved) {
      return false;
    }

    // Si estamos guardando, no hay cambios pendientes
    if (this.isSaving) {
      return false;
    }

    // Para productos con variantes
    if (this.productType === 'variant') {
      // Si ya tiene variantes guardadas, no hay cambios pendientes
      if (this.variantComponent?.hasVariants()) {
        return false;
      }
      // Si está editando una variante nueva sin guardar
      const hasUnsavedVariantChanges = this.variantComponent?.hasUnsavedChanges();
      return !!hasUnsavedVariantChanges;
    }

    // Para productos simples
    // Solo considerar dirty si los forms están dirty
    const formsAreDirty = this.productForm.dirty || this.stockForm.dirty;

    return formsAreDirty;
  }

  // ==================== TEMPLATE HELPERS ====================

  getCategoryIdAsNumber(): number | null {
    const categoryId = this.productForm.get('categoryId')?.value;
    return categoryId ? Number(categoryId) : null;
  }

  isSupplierSelected(supplierId: string | number, currentSupplierPrice: ProductSupplierPrice): boolean {
    const supplierIdNum = Number(supplierId);
    if (supplierIdNum === 0) return false;

    return this.supplierPrices.some(sp =>
      Number(sp.supplierId) === supplierIdNum &&
      sp !== currentSupplierPrice
    );
  }
}
