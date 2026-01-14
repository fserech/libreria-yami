import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
} from '@ng-icons/material-icons/outline';
import { environment } from '../../../../../../environments/environment';
import { CheckboxComponent } from '../../../../../shared/components/checkbox/checkbox.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ToggleComponent } from '../../../../../shared/components/toggle/toggle.component';
import { REGUEX_DECIMAL_INT } from '../../../../../shared/constants/reguex';
import { InputOptionsSelect } from '../../../../../shared/interfaces/input';
import { ProductVariant } from '../../../../../shared/interfaces/product';
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
    matInventory2Outline
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

    if (this.supplierOptions.length > 0) {
      this.initSupplierFormArray();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] && !changes['categoryId'].firstChange) {
      const newCategoryId = changes['categoryId'].currentValue;
      if (newCategoryId) {
        this.loadCategoryAttributes(newCategoryId);
      }
    }

    if (changes['supplierOptions']) {
      if (this.supplierOptions.length > 0) {
        this.initSupplierFormArray();
      }
    }
  }

  // ==================== INITIALIZATION ====================

  initForm() {
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
      attrKey: [''],
      attrValue: ['']
    });
  }

  initSupplierFormArray() {
    const variantSuppliers = this.variantForm.get('supplierId') as FormArray;
    variantSuppliers.clear();

    for (let i = 0; i < this.supplierOptions.length; i++) {
      variantSuppliers.push(new FormControl(false));
    }
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

    // Auto-generar nombre de variante
    this.autoGenerateVariantName();

    this.toast.success('Atributo agregado');
  }

  removeManualAttribute(index: number) {
    this.manualAttributes.splice(index, 1);
    // Regenerar nombre de variante
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
      this.variantForm.get('costPrice')?.valid &&
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

    const supplierFormArray = this.variantForm.get('supplierId') as FormArray;

    if (!supplierFormArray || supplierFormArray.length === 0) {
      this.toast.error('Error: No se han cargado los proveedores correctamente');
      return;
    }

    const selectedSuppliers = this.supplierOptions
      .filter((_, index) => {
        const control = supplierFormArray.at(index);
        return control && control.value === true;
      })
      .map(option => Number(option.value));

    if (selectedSuppliers.length === 0) {
      this.toast.error('Debes seleccionar al menos un proveedor');
      return;
    }

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
      costPrice: variant.costPrice,
      salePrice: variant.salePrice,
      currentStock: variant.currentStock,
      minStock: variant.minStock,
      maxStock: variant.maxStock,
      active: variant.active
    });

    this.manualAttributes = [];
    if (variant.attributes) {
      Object.keys(variant.attributes).forEach(key => {
        this.manualAttributes.push({
          key: key,
          value: variant.attributes[key]
        });
      });
    }

    this.setSuppliers(variant.supplierId);
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

    this.attrKeyControl.setValue('');
    this.attrValueControl.setValue('');
    this.customAttrKeyControl.setValue('');
    this.customAttrValueControl.setValue('');
    this.selectedAttributeValues = [];
    this.showCustomAttrInput = false;
    this.showCustomValueInput = false;

    const supplierFormArray = this.variantForm.get('supplierId') as FormArray;
    if (supplierFormArray && supplierFormArray.length > 0) {
      supplierFormArray.controls.forEach(control => control.setValue(false));
    }
  }

  // ==================== HELPERS ====================

  setSuppliers(supplierId: number[]) {
    const supplierFormArray = this.variantForm.get('supplierId') as FormArray;

    if (!supplierFormArray || supplierFormArray.length === 0) {
      console.error('FormArray de proveedores no inicializado');
      return;
    }

    this.supplierOptions.forEach((option, index) => {
      if (index < supplierFormArray.length) {
        const isSelected = supplierId.includes(Number(option.value));
        supplierFormArray.at(index).setValue(isSelected);
      }
    });
  }

  emitVariants() {
    this.variantsChange.emit([...this.variants]);
  }

  getVariants(): ProductVariant[] {
    return [...this.variants];
  }

   hasVariants(): boolean {
    return this.variants.length > 0;
  }

  // Método para verificar si hay cambios sin guardar
  hasUnsavedChanges(): boolean {
    // Si ya hay variantes creadas, no hay "cambios sin guardar" que importen
    if (this.variants.length > 0) {
      return false;
    }

    // Solo hay cambios sin guardar si está en proceso de crear la primera variante
    const formHasData =
      this.variantForm.get('sku')?.value?.trim() ||
      this.variantForm.get('variantName')?.value?.trim() ||
      this.variantForm.get('costPrice')?.value ||
      this.variantForm.get('salePrice')?.value ||
      this.manualAttributes.length > 0;

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
