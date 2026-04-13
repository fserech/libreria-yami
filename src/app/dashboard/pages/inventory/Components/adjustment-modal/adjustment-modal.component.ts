import { Component, Output, EventEmitter, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { Product } from '../../../../../shared/interfaces/product';
import { StockMovement } from '../../../../../shared/interfaces/inventory';

interface AdjustmentForm {
  productId: string;
  variantId: string | null; // ⭐ AGREGADO
  branchId: string;
  quantity: number;
  reason: string;
  notes: string;
}

interface Branch {
  id: number;
  branchName: string;
  address?: string;
}

@Component({
  selector: 'app-adjustment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adjustment-modal.component.html',
  styleUrls: ['./adjustment-modal.component.scss']
})
export class AdjustmentModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() editingMovement?: any;
  @Output() close = new EventEmitter<void>();
  @Output() adjustmentSuccess = new EventEmitter<void>();

  form: AdjustmentForm = {
    productId: '',
    variantId: null, // ⭐ AGREGADO
    branchId: '',
    quantity: 0,
    reason: '',
    notes: ''
  };

  isEditMode: boolean = false;
  movementId?: number;

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  productSearchTerm: string = '';
  showProductDropdown: boolean = false;

  branches: Branch[] = [];
  currentStockInBranch: number = 0;

  isSubmitting: boolean = false;
  submitError: string = '';
  loadingStock: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadBranches();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.refreshData();
    }

    if (changes['editingMovement'] && changes['editingMovement'].currentValue) {
      this.loadMovementForEdit(changes['editingMovement'].currentValue);
    }
  }

  async loadMovementForEdit(data: any): Promise<void> {
    this.isEditMode = true;

    const isFromProductStock = data.currentStock !== undefined && !data.movementType;

    if (isFromProductStock) {
      this.movementId = undefined;
      await this.loadDataFromProductStock(data);
    } else {
      this.movementId = data.id;
      await this.loadDataFromStockMovement(data);
    }
  }

  private async loadDataFromProductStock(data: any): Promise<void> {


    await Promise.all([
      this.loadProducts(),
      this.loadBranches()
    ]);

    const product = this.allProducts.find(p => p.id === data.productId);
    if (product) {
      this.selectedProduct = product;
      this.form.productId = product.id.toString();
      this.productSearchTerm = `${product.productName} (${product.sku})`;
    }

    this.form.branchId = data.branchId?.toString() || '';

    // ⭐ AGREGADO: Pre-cargar variantId si existe
    this.form.variantId = data.variantId?.toString() || null;


    this.currentStockInBranch = data.currentStock || 0;
    this.form.quantity = 0;
    this.form.reason = '';
    this.form.notes = '';
  }

  private async loadDataFromStockMovement(movement: StockMovement): Promise<void> {
    await Promise.all([
      this.loadProducts(),
      this.loadBranches()
    ]);

    const product = this.allProducts.find(p => p.id === movement.productId);
    if (product) {
      this.selectedProduct = product;
      this.form.productId = product.id.toString();
      this.productSearchTerm = `${product.productName} (${product.sku})`;
    }

    this.form.branchId = movement.branchId?.toString() || '';

    // ⭐ AGREGADO: Cargar variantId del movimiento
    this.form.variantId = movement.variantId?.toString() || null;

    this.currentStockInBranch = movement.newStock || movement.previousStock || 0;
    this.form.quantity = movement.quantity || 0;
    this.form.reason = movement.reason || '';
    this.form.notes = movement.notes || '';
  }

  async refreshData(): Promise<void> {
    await Promise.all([
      this.loadProducts(),
      this.loadBranches()
    ]);
  }

  async loadProducts(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/api/v1/products`)
      );

      const productsList = Array.isArray(response)
        ? response
        : (response.content || response.data || []);

      this.allProducts = productsList;
      this.filteredProducts = this.allProducts.slice(0, 20);

    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.allProducts = [];
      this.filteredProducts = [];
    }
  }

  async loadBranches(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/api/v1/branches`)
      );

      const branchesList = Array.isArray(response)
        ? response
        : (response.content || response.data || []);

      this.branches = branchesList.map((branch: any) => ({
        id: branch.id,
        branchName: branch.branchName || branch.name,
        address: branch.address || ''
      }));

    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      this.branches = [];
    }
  }

  onProductSearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase().trim();
    this.productSearchTerm = searchTerm;
    this.showProductDropdown = true;

    if (!searchTerm) {
      this.filteredProducts = this.allProducts.slice(0, 20);
      return;
    }

    this.filteredProducts = this.allProducts
      .filter(product =>
        product.productName.toLowerCase().includes(searchTerm) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm))
      )
      .slice(0, 50);
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.form.productId = product.id!.toString();
    this.productSearchTerm = `${product.productName} (${product.sku})`;
    this.showProductDropdown = false;

    if (!this.isEditMode) {
      this.currentStockInBranch = 0;
      this.form.branchId = '';
      this.form.variantId = null; // ⭐ AGREGADO: Reset variantId
    }
  }

  clearProductSelection(): void {
    this.selectedProduct = null;
    this.form.productId = '';
    this.form.variantId = null; // ⭐ AGREGADO
    this.productSearchTerm = '';
    this.form.quantity = 0;
    this.currentStockInBranch = 0;
    this.filteredProducts = this.allProducts.slice(0, 20);
  }

  onProductInputFocus(): void {
    this.showProductDropdown = true;
    if (!this.productSearchTerm) {
      this.filteredProducts = this.allProducts.slice(0, 20);
    }
  }

  onProductInputBlur(): void {
    setTimeout(() => {
      this.showProductDropdown = false;
    }, 200);
  }

  getSelectedProductStock(): number {
    return this.currentStockInBranch;
  }

  async onBranchChange(): Promise<void> {
    this.form.quantity = 0;

    if (!this.isEditMode) {
      this.currentStockInBranch = 0;
    }
  }

  onClose(): void {
    this.close.emit();
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    try {
      // ⭐ MODIFICADO: Construir payload con variantId
      const payload: any = {
        productId: parseInt(this.form.productId),
        branchId: parseInt(this.form.branchId),
        quantity: this.form.quantity,
        reason: this.form.reason,
        notes: this.form.notes
      };

      // ⭐ AGREGADO: Incluir variantId si existe
      if (this.form.variantId) {
        payload.variantId = parseInt(this.form.variantId);

      } else {
        payload.variantId = null;
      }

      let response;

      if (this.isEditMode && this.movementId) {
        response = await firstValueFrom(
          this.http.put<any>(
            `${environment.apiUrl}/api/v1/inventory/adjustments/${this.movementId}`,
            payload
          )
        );
      } else {
        response = await firstValueFrom(
          this.http.post<any>(
            `${environment.apiUrl}/api/v1/inventory/adjustments`,
            payload
          )
        );
      }



      // ⭐ MODIFICADO: Actualizar stock considerando variantes
      this.currentStockInBranch = response.newStock ??
                                  response.variant?.newStock ??
                                  response.product?.newStock ??
                                  (this.currentStockInBranch + this.form.quantity);

      this.adjustmentSuccess.emit();

      setTimeout(() => {
        this.resetForm();
        this.close.emit();
      }, 300);

    } catch (error: any) {
      console.error('❌ Error al procesar ajuste:', error);
      this.submitError = error.error?.error || error.error?.message ||
                        'Error al procesar el ajuste. Por favor intente nuevamente.';
      this.isSubmitting = false;
    }
  }

  isFormValid(): boolean {
    return !!(
      this.form.productId &&
      this.form.branchId &&
      this.form.quantity !== 0 &&
      this.form.reason
    );
  }

  resetForm(): void {
    this.form = {
      productId: '',
      variantId: null, // ⭐ AGREGADO
      branchId: '',
      quantity: 0,
      reason: '',
      notes: ''
    };
    this.clearProductSelection();
    this.currentStockInBranch = 0;
    this.isSubmitting = false;
    this.submitError = '';
    this.loadingStock = false;
    this.isEditMode = false;
    this.movementId = undefined;
  }
}
