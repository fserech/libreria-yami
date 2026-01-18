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
} from '@ng-icons/material-icons/outline';
import { environment } from '../../../../../../environments/environment';
import { CheckboxComponent } from '../../../../../shared/components/checkbox/checkbox.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ToggleComponent } from '../../../../../shared/components/toggle/toggle.component';
import { REGUEX_DECIMAL_INT } from '../../../../../shared/constants/reguex';
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

  // ⭐ NUEVA PROPIEDAD: Precios por proveedor para la variante actual
  variantSupplierPrices: ProductSupplierPrice[] = [];

  // ==================== UI STATE ====================
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

    if (this.categoryId) {
      this.loadCategoryAttributes(this.categoryId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] && !changes['categoryId'].firstChange) {
      const newCategoryId = changes['categoryId'].currentValue;
      if (newCategoryId) {
        this.loadCategoryAttributes(newCategoryId);
      }
    }
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

  // ==================== DATA LOADING ====================

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

  // ==================== SUPPLIER PRICES MANAGEMENT ====================

  addSupplierPrice() {
    this.variantSupplierPrices.push({
      supplierId: 0,
      costPrice: 0,
      isPreferred: this.variantSupplierPrices.length === 0
    });
  }

  removeSupplierPrice(supplierPrice: ProductSupplierPrice) {
    const index = this.variantSupplierPrices.indexOf(supplierPrice);
    if (index > -1) {
      this.variantSupplierPrices.splice(index, 1);

      if (supplierPrice.isPreferred && this.variantSupplierPrices.length > 0) {
        this.variantSupplierPrices[0].isPreferred = true;
      }
    }
  }

  setPreferredSupplier(supplierPrice: ProductSupplierPrice) {
    this.variantSupplierPrices.forEach(sp => sp.isPreferred = false);
    supplierPrice.isPreferred = true;
  }

  onSupplierChange(supplierPrice: ProductSupplierPrice) {
    const supplier = this.supplierOptions.find(s => s.value === supplierPrice.supplierId.toString());
    if (supplier) {
      supplierPrice.supplierName = supplier.label;
    }
  }

  getBestSupplierPrice(): ProductSupplierPrice | null {
    if (this.variantSupplierPrices.length === 0) return null;

    const preferred = this.variantSupplierPrices.find(sp => sp.isPreferred && sp.supplierId > 0);
    if (preferred && preferred.costPrice > 0) return preferred;

    return this.variantSupplierPrices
      .filter(sp => sp.costPrice > 0 && sp.supplierId > 0)
      .reduce((best, current) =>
        (!best || current.costPrice < best.costPrice) ? current : best
      , null as ProductSupplierPrice | null);
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

    if (this.showCustomAttrInput) {
      key = this.customAttrKeyControl.value?.trim() || '';
    } else if (this.availableAttributes.length > 0) {
      key = this.attrKeyControl.value?.trim() || '';
    } else {
      key = this.variantForm.get('attrKey')?.value?.trim() || '';
    }

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

    this.attrKeyControl.setValue('');
    this.attrValueControl.setValue('');
    this.customAttrKeyControl.setValue('');
    this.customAttrValueControl.setValue('');
    this.variantForm.patchValue({ attrKey: '', attrValue: '' });
    this.selectedAttributeValues = [];
    this.showCustomAttrInput = false;
    this.showCustomValueInput = false;

    this.autoGenerateVariantName();
    this.toast.success('Atributo agregado');
  }

  removeManualAttribute(index: number) {
    this.manualAttributes.splice(index, 1);
    this.autoGenerateVariantName();
  }

  autoGenerateVariantName() {
    if (this.manualAttributes.length === 0) {
      this.variantForm.patchValue({ variantName: '' });
      return;
    }

    const baseName = this.productName || 'Producto';
    const attrValues = this.manualAttributes.map(attr => attr.value).join(' - ');
    const generatedName = `${baseName} - ${attrValues}`;

    this.variantForm.patchValue({ variantName: generatedName });
  }

  // ==================== SKU GENERATION ====================

  generateVariantSKU() {
    const brand = this.brandOptions.find(b => b.value === this.brandValue)?.label || 'UNK';
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
      this.variantForm.get('salePrice')?.valid &&
      this.variantForm.get('currentStock')?.valid &&
      this.variantForm.get('minStock')?.valid &&
      this.variantForm.get('maxStock')?.valid;

    if (!baseFieldsValid) {
      this.toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (this.manualAttributes.length === 0) {
      this.toast.error('Debes agregar al menos un atributo para identificar esta variante');
      return;
    }

    // Validar proveedores
    const validSupplierPrices = this.variantSupplierPrices.filter(sp =>
      Number(sp.supplierId) > 0 && Number(sp.costPrice) > 0
    );

    if (validSupplierPrices.length === 0) {
      this.toast.error('⚠️ Debes agregar al menos un proveedor con precio válido');
      return;
    }

    const attributes: { [key: string]: string } = {};
    this.manualAttributes.forEach(attr => {
      attributes[attr.key] = attr.value;
    });

    // Obtener mejor precio para compatibilidad legacy
    const bestCostPrice = this.getBestCostPrice();
    const preferredSupplier = this.getBestSupplierPrice();

    const variant: ProductVariant = {
      id: this.editingVariantIndex >= 0 ? this.variants[this.editingVariantIndex].id : null,
      sku: this.variantForm.value.sku.trim(),
      variantName: this.variantForm.value.variantName.trim(),

      // ⭐ NUEVO: Enviar precios por proveedor
      supplierPrices: validSupplierPrices.map(sp => ({
        supplierId: Number(sp.supplierId),
        costPrice: Number(sp.costPrice),
        isPreferred: sp.isPreferred || false
      })),

      // Legacy: compatibilidad con backend
      costPrice: bestCostPrice,
      supplierId: preferredSupplier ? [Number(preferredSupplier.supplierId)] : validSupplierPrices.map(sp => Number(sp.supplierId)),

      salePrice: Number(this.variantForm.value.salePrice),
      currentStock: Number(this.variantForm.value.currentStock),
      minStock: Number(this.variantForm.value.minStock),
      maxStock: Number(this.variantForm.value.maxStock),
      attributes: attributes,
      active: this.variantForm.value.active
    };

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
    this.emitVariants();
  }

  editVariant(index: number) {
    const variant = this.variants[index];
    this.editingVariantIndex = index;

    this.variantForm.patchValue({
      sku: variant.sku,
      variantName: variant.variantName,
      salePrice: variant.salePrice,
      currentStock: variant.currentStock,
      minStock: variant.minStock,
      maxStock: variant.maxStock,
      active: variant.active
    });

    // Cargar atributos
    this.manualAttributes = [];
    if (variant.attributes) {
      Object.keys(variant.attributes).forEach(key => {
        this.manualAttributes.push({
          key: key,
          value: variant.attributes[key]
        });
      });
    }

    // ⭐ Cargar precios por proveedor
    this.variantSupplierPrices = [];
    if (variant.supplierPrices && variant.supplierPrices.length > 0) {
      this.variantSupplierPrices = variant.supplierPrices.map(sp => ({
        ...sp,
        supplierName: this.supplierOptions.find(opt => opt.value === sp.supplierId.toString())?.label
      }));
    } else if (variant.costPrice && variant.supplierId && variant.supplierId.length > 0) {
      // Legacy: convertir formato antiguo
      this.variantSupplierPrices = variant.supplierId.map((supplierId, idx) => ({
        supplierId,
        supplierName: this.supplierOptions.find(opt => opt.value === supplierId.toString())?.label,
        costPrice: variant.costPrice || 0,
        isPreferred: idx === 0
      }));
    }
  }

  deleteVariant(index: number) {
    if (confirm('¿Estás seguro de eliminar esta variante?')) {
      this.variants.splice(index, 1);
      this.toast.success('Variante eliminada');
      this.emitVariants();
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
      salePrice: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 100,
      active: true,
      attrKey: '',
      attrValue: ''
    });

    this.manualAttributes = [];
    this.variantSupplierPrices = []; // ⭐ Limpiar precios de proveedores

    this.attrKeyControl.setValue('');
    this.attrValueControl.setValue('');
    this.customAttrKeyControl.setValue('');
    this.customAttrValueControl.setValue('');
    this.selectedAttributeValues = [];
    this.showCustomAttrInput = false;
    this.showCustomValueInput = false;
  }

  // ==================== HELPERS ====================

  emitVariants() {
    this.variantsChange.emit([...this.variants]);
  }

  getVariants(): ProductVariant[] {
    return [...this.variants];
  }

  hasVariants(): boolean {
    return this.variants.length > 0;
  }

  hasUnsavedChanges(): boolean {
    if (this.variants.length > 0) {
      return false;
    }

    const formHasData =
      this.variantForm.get('sku')?.value?.trim() ||
      this.variantForm.get('variantName')?.value?.trim() ||
      this.variantForm.get('salePrice')?.value ||
      this.manualAttributes.length > 0 ||
      this.variantSupplierPrices.length > 0;

    return !!formHasData;
  }

  // ==================== VARIANT DISPLAY ====================

  getVariantAttributesDisplay(variant: ProductVariant): string {
    if (!variant.attributes || Object.keys(variant.attributes).length === 0) {
      return 'Sin atributos';
    }

    return Object.entries(variant.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  getStockStatusClass(variant: ProductVariant): string {
    if (variant.currentStock === 0) return 'text-red-600 font-bold';
    if (variant.currentStock <= variant.minStock) return 'text-orange-600 font-semibold';
    return 'text-green-600';
  }

  getStockStatusText(variant: ProductVariant): string {
    if (variant.currentStock === 0) return 'AGOTADO';
    if (variant.currentStock <= variant.minStock) return 'BAJO STOCK';
    return 'DISPONIBLE';
  }
}
