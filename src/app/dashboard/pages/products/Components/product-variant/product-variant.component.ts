import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// Services
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matAddCircleOutline,
  matEditOutline,
  matDeleteOutline,
  matDriveFileRenameOutlineOutline,
  matAttachMoneyOutline,
  matSellOutline,
  matQrCodeOutline,
  matTuneOutline,
  matInventoryOutline,
  matInventory2Outline,
  matAddOutline,
  matCheckCircleOutline,
  matTrendingUpOutline,
  matLockOutline,
} from '@ng-icons/material-icons/outline';
import { environment } from '../../../../../../environments/environment';
import { CheckboxComponent } from '../../../../../shared/components/checkbox/checkbox.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ToggleComponent } from '../../../../../shared/components/toggle/toggle.component';
import { REGUEX_DECIMAL_INT } from '../../../../../shared/constants/reguex';
import { URL_PRODUCTS } from '../../../../../shared/constants/endpoints';
import { InputOptionsSelect } from '../../../../../shared/interfaces/input';
import { ProductVariant, ProductSupplierPrice } from '../../../../../shared/interfaces/product';
import { CrudService } from '../../../../../shared/services/crud.service';
import { ToastService } from '../../../../../shared/services/toast.service';

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
  selector: 'app-product-variant',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputComponent,
    CheckboxComponent,
    ToggleComponent,
    NgIconComponent
  ],
  templateUrl: './product-variant.component.html',
  styleUrl: './product-variant.component.scss',
  viewProviders: [provideIcons({
    matAddCircleOutline,
    matEditOutline,
    matDeleteOutline,
    matDriveFileRenameOutlineOutline,
    matAttachMoneyOutline,
    matSellOutline,
    matQrCodeOutline,
    matTuneOutline,
    matInventoryOutline,
    matInventory2Outline,
    matAddOutline,
    matCheckCircleOutline,
    matTrendingUpOutline,
    matLockOutline,
  })]
})
export class ProductVariantComponent implements OnInit, OnChanges {

  // ==================== INPUTS ====================
  @Input() categoryId: number | null = null;
  @Input() brandValue: string = '';
  @Input() brandOptions: InputOptionsSelect[] = [];
  @Input() supplierOptions: InputOptionsSelect[] = [];
  @Input() initialVariants: ProductVariant[] = [];
  @Input() load: boolean = false;
  @Input() productName: string = '';

  // ==================== OUTPUTS ====================
  @Output() variantsChange = new EventEmitter<ProductVariant[]>();

  // ==================== FORMS ====================
  variantForm: FormGroup;

  // ==================== DATA ====================
  variants: ProductVariant[] = [];
  manualAttributes: ManualAttribute[] = [];
  availableAttributes: VariantAttribute[] = [];
  selectedAttributeValues: string[] = [];
  variantSupplierPrices: ProductSupplierPrice[] = [];

  // ==================== UI STATE ====================
  editingVariantIndex: number = -1;
  showCustomAttrInput: boolean = false;
  showCustomValueInput: boolean = false;
  variantSkuLocked: boolean = false;

  // ==================== FORM CONTROLS ====================
  attrKeyControl = new FormControl('');
  attrValueControl = new FormControl('');
  customAttrKeyControl = new FormControl('');
  customAttrValueControl = new FormControl('');

  get supplierLabels(): string[] {
    return this.supplierOptions.map(opt => opt.label);
  }

  constructor(
    private fb: FormBuilder,
    private crud: CrudService,
    private toast: ToastService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    if (this.initialVariants && this.initialVariants.length > 0) {
      this.variants = [...this.initialVariants];
    }
    if (this.categoryId && this.variants.length === 0) {
      this.loadCategoryAttributes(this.categoryId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] && !changes['categoryId'].firstChange) {
      const newCategoryId = changes['categoryId'].currentValue;
      if (newCategoryId && this.variants.length === 0) {
        this.loadCategoryAttributes(newCategoryId);
      }
    }

    if (changes['brandValue'] && !changes['brandValue'].firstChange) {
      this.handleExternalBrandChange();
    }
  }

  // ==================== PENDING CHANGES METHODS (FOR PARENT) ====================

  /**
   * Determina si hay cambios sin guardar en el formulario de edición de variante actual.
   * Usado por el Guard 'PendingChanges'.
   */
  hasUnsavedChanges(): boolean {
    // Si el formulario está sucio (dirty), hay cambios pendientes.
    return this.variantForm.dirty || this.manualAttributes.length > 0 || this.variantSupplierPrices.length > 0;
  }

  /**
   * Indica si ya existen variantes en la lista.
   */
  hasVariants(): boolean {
    return this.variants && this.variants.length > 0;
  }

  // ==================== LOGIC FOR DYNAMIC SKU ====================

  private handleExternalBrandChange() {
    if (this.variants.length > 0) {
      let updatedCount = 0;
      this.variants = this.variants.map((v, index) => {
        if (!v.id) {
          updatedCount++;
          return { ...v, sku: this.calculateSkuValue(index) };
        }
        return v;
      });

      if (updatedCount > 0) {
        this.emitVariants();
        this.toast.info(`Se actualizaron ${updatedCount} SKUs por cambio de marca`);
      }
    }

    if (this.editingVariantIndex !== -1 && !this.variants[this.editingVariantIndex]?.id) {
       const newSku = this.calculateSkuValue(this.editingVariantIndex);
       this.variantForm.patchValue({ sku: newSku });
    }
  }

  private calculateSkuValue(index: number): string {
    const brand = this.brandOptions.find(b => b.value === this.brandValue);
    const brandLabel = brand?.label || 'UNK';
    let baseName = this.productName || 'PROD';

    if (brand) {
      const brandUpper = brandLabel.toUpperCase();
      if (baseName.toUpperCase().endsWith(brandUpper)) {
        baseName = baseName.substring(0, baseName.length - brandUpper.length).trim();
      }
    }

    const namePrefix = baseName.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const brandPrefix = brandLabel.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const correlativo = (index + 1).toString().padStart(4, '0');

    return `${namePrefix}-${brandPrefix}-${correlativo}`;
  }

  // ==================== INITIALIZATION ====================

  initForm() {
    this.variantForm = this.fb.group({
      sku: ['', [Validators.required, Validators.maxLength(50)]],
      variantName: ['', [Validators.required, Validators.maxLength(100)]],
      salePrice: ['', [Validators.required, Validators.pattern(REGUEX_DECIMAL_INT), Validators.min(0)]],
      currentStock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
      maxStock: [100, [Validators.required, Validators.min(1)]],
      active: [true],
      attrKey: [''],
      attrValue: ['']
    });
  }

  async loadCategoryAttributes(categoryId: number): Promise<void> {
    try {
      const attributes = await firstValueFrom(
        this.crud.http.get<VariantAttribute[]>(
          `${environment.apiUrl}/api/v1/categories/${categoryId}/attributes`
        )
      );
      this.availableAttributes = attributes || [];
    } catch (error: any) {
      this.availableAttributes = [];
    }
  }

  // ==================== SUPPLIER PRICES MANAGEMENT ====================

  addSupplierPrice() {
    this.variantSupplierPrices.push({
      supplierId: 0,
      costPrice: 0,
      isPreferred: this.variantSupplierPrices.length === 0
    });
    this.variantForm.markAsDirty(); // Notificar cambio al padre
  }

  removeSupplierPrice(supplierPrice: ProductSupplierPrice) {
    const index = this.variantSupplierPrices.indexOf(supplierPrice);
    if (index > -1) {
      this.variantSupplierPrices.splice(index, 1);
      if (supplierPrice.isPreferred && this.variantSupplierPrices.length > 0) {
        this.variantSupplierPrices[0].isPreferred = true;
      }
      this.variantForm.markAsDirty();
    }
  }

  setPreferredSupplier(supplierPrice: ProductSupplierPrice) {
    this.variantSupplierPrices.forEach(sp => sp.isPreferred = false);
    supplierPrice.isPreferred = true;
    this.variantForm.markAsDirty();
  }

  onSupplierChange(supplierPrice: ProductSupplierPrice) {
    const supplier = this.supplierOptions.find(s => s.value === supplierPrice.supplierId.toString());
    if (supplier) {
      supplierPrice.supplierName = supplier.label;
    }
    this.variantForm.markAsDirty();
  }

  getBestSupplierPrice(): ProductSupplierPrice | null {
    if (this.variantSupplierPrices.length === 0) return null;
    const preferred = this.variantSupplierPrices.find(sp => sp.isPreferred && sp.supplierId > 0);
    if (preferred && preferred.costPrice > 0) return preferred;
    return this.variantSupplierPrices
      .filter(sp => sp.costPrice > 0 && sp.supplierId > 0)
      .reduce((best, current) => (!best || current.costPrice < best.costPrice) ? current : best, null as ProductSupplierPrice | null);
  }

  getBestCostPrice(): number {
    const best = this.getBestSupplierPrice();
    return best?.costPrice || 0;
  }

  calculateCurrentMargin(): string {
    const bestCostPrice = this.getBestCostPrice();
    const salePrice = parseFloat(this.variantForm.get('salePrice')?.value) || 0;
    if (bestCostPrice === 0 || salePrice === 0) return '0.00';
    const margin = ((salePrice - bestCostPrice) / bestCostPrice) * 100;
    return margin.toFixed(2);
  }

  calculateProfit(): number {
    const bestCostPrice = this.getBestCostPrice();
    const salePrice = parseFloat(this.variantForm.get('salePrice')?.value) || 0;
    return salePrice - bestCostPrice;
  }

  // ==================== ATTRIBUTE MANAGEMENT ====================

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
      const attribute = this.availableAttributes.find(attr => attr.attributeName === value);
      this.selectedAttributeValues = attribute ? attribute.attributeValues : [];
      this.attrValueControl.setValue('');
    } else {
      this.showCustomAttrInput = false;
      this.showCustomValueInput = false;
      this.selectedAttributeValues = [];
    }
  }

  onAttributeValueChange(event: any) {
    const value = event.target.value;
    this.showCustomValueInput = value === '__custom__';
    if (this.showCustomValueInput) this.customAttrValueControl.setValue('');
  }

  addManualAttribute() {
    let key = this.showCustomAttrInput ? this.customAttrKeyControl.value?.trim() : (this.availableAttributes.length > 0 ? this.attrKeyControl.value?.trim() : this.variantForm.get('attrKey')?.value?.trim());
    let value = this.showCustomValueInput ? this.customAttrValueControl.value?.trim() : (this.selectedAttributeValues.length > 0 ? (this.attrValueControl.value !== '__custom__' ? this.attrValueControl.value?.trim() : '') : this.variantForm.get('attrValue')?.value?.trim());

    if (!key || !value) {
      this.toast.error('Ingresa tanto el nombre como el valor del atributo');
      return;
    }

    if (this.manualAttributes.some(attr => attr.key.toLowerCase() === key!.toLowerCase())) {
      this.toast.error('Ya existe un atributo con ese nombre');
      return;
    }

    this.manualAttributes.push({ key: key!, value: value! });
    this.resetAttributeInputs();
    this.autoGenerateVariantName();
    this.variantForm.markAsDirty();
    this.toast.success('Atributo agregado');
  }

  private resetAttributeInputs() {
    this.attrKeyControl.setValue('');
    this.attrValueControl.setValue('');
    this.customAttrKeyControl.setValue('');
    this.customAttrValueControl.setValue('');
    this.variantForm.patchValue({ attrKey: '', attrValue: '' });
    this.selectedAttributeValues = [];
    this.showCustomAttrInput = false;
    this.showCustomValueInput = false;
  }

  removeManualAttribute(index: number) {
    this.manualAttributes.splice(index, 1);
    this.autoGenerateVariantName();
    this.variantForm.markAsDirty();
  }

  autoGenerateVariantName() {
    if (this.manualAttributes.length === 0) {
      this.variantForm.patchValue({ variantName: '' });
      return;
    }
    const baseName = this.productName || 'Producto';
    const attrValues = this.manualAttributes.map(attr => attr.value).join(' - ');
    this.variantForm.patchValue({ variantName: `${baseName} - ${attrValues}` });
  }

  // ==================== SKU GENERATION ====================

  async generateVariantSKU() {
    if (this.editingVariantIndex !== -1 && this.variants[this.editingVariantIndex].id) {
       this.toast.error('No se puede modificar el SKU de una variante ya guardada');
       return;
    }

    if (!this.productName) {
      this.toast.error('El nombre del producto no está disponible');
      return;
    }

    if (!this.brandValue) {
      this.toast.error('Selecciona la marca en la información general primero');
      return;
    }

    const index = this.editingVariantIndex >= 0 ? this.editingVariantIndex : this.variants.length;
    const sku = this.calculateSkuValue(index);

    this.variantForm.patchValue({ sku });
    this.variantSkuLocked = true;
    this.variantForm.get('sku')?.disable();
    this.variantForm.markAsDirty();
    this.toast.success(`SKU generado: ${sku}`);
  }

  // ==================== VARIANT MANAGEMENT ====================

  addOrUpdateVariant() {
    const skuValue = this.variantForm.get('sku')?.value;
    const baseFieldsValid = skuValue && this.variantForm.get('variantName')?.valid && this.variantForm.get('salePrice')?.valid;

    if (!baseFieldsValid || !this.variantSkuLocked) {
      this.toast.error('Completa los campos y genera el SKU');
      return;
    }

    if (this.manualAttributes.length === 0) {
      this.toast.error('Agrega al menos un atributo');
      return;
    }

    const validSupplierPrices = this.variantSupplierPrices.filter(sp => Number(sp.supplierId) > 0 && Number(sp.costPrice) > 0);
    if (validSupplierPrices.length === 0) {
      this.toast.error('Agrega un proveedor válido');
      return;
    }

    const attributes: { [key: string]: string } = {};
    this.manualAttributes.forEach(attr => attributes[attr.key] = attr.value);

    const variant: ProductVariant = {
      id: this.editingVariantIndex >= 0 ? this.variants[this.editingVariantIndex].id : null,
      sku: skuValue.trim(),
      variantName: this.variantForm.value.variantName.trim(),
      supplierPrices: validSupplierPrices,
      costPrice: this.getBestCostPrice(),
      supplierId: [Number(this.getBestSupplierPrice()?.supplierId)],
      salePrice: Number(this.variantForm.value.salePrice),
      currentStock: Number(this.variantForm.value.currentStock),
      minStock: Number(this.variantForm.value.minStock),
      maxStock: Number(this.variantForm.value.maxStock),
      attributes: attributes,
      active: this.variantForm.value.active
    };

    if (this.editingVariantIndex >= 0) {
      this.variants[this.editingVariantIndex] = variant;
      this.editingVariantIndex = -1;
    } else {
      this.variants.push(variant);
    }

    this.resetVariantForm();
    this.emitVariants();
  }

  editVariant(index: number) {
    const variant = this.variants[index];
    this.editingVariantIndex = index;
    this.variantForm.patchValue({ ...variant });

    this.variantSkuLocked = !!variant.sku;
    if (this.variantSkuLocked) this.variantForm.get('sku')?.disable();

    this.manualAttributes = Object.entries(variant.attributes || {}).map(([key, value]) => ({ key, value }));
    this.variantSupplierPrices = [...(variant.supplierPrices || [])];

    // Al empezar a editar, marcamos como pristine hasta que el usuario toque algo
    this.variantForm.markAsPristine();
  }

deleteVariant(index: number) {
  this.variants.splice(index, 1);
  this.emitVariants();
  this.toast.success('Variante eliminada correctamente');
}



  cancelEditVariant() {
    this.editingVariantIndex = -1;
    this.resetVariantForm();
  }

  resetVariantForm() {
    this.variantForm.reset({
      currentStock: 0, minStock: 0, maxStock: 100, active: true
    });
    this.manualAttributes = [];
    this.variantSupplierPrices = [];
    this.variantSkuLocked = false;
    this.variantForm.get('sku')?.enable();
    this.resetAttributeInputs();

    // Importante: Marcar como pristine después del reset para que isDirty() sea correcto
    this.variantForm.markAsPristine();
  }

  emitVariants() { this.variantsChange.emit([...this.variants]); }
  getVariants() { return [...this.variants]; }

  getVariantAttributesDisplay(variant: ProductVariant): string {
    return Object.entries(variant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Sin atributos';
  }

  getStockStatusClass(v: ProductVariant) {
    if (v.currentStock === 0) return 'text-red-600 font-bold';
    return v.currentStock <= v.minStock ? 'text-orange-600 font-semibold' : 'text-green-600';
  }

  getStockStatusText(v: ProductVariant) {
    if (v.currentStock === 0) return 'AGOTADO';
    return v.currentStock <= v.minStock ? 'BAJO STOCK' : 'DISPONIBLE';
  }
}
