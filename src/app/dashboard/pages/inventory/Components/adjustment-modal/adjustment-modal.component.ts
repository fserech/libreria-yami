import { Component, Output, EventEmitter, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

interface AdjustmentForm {
  productId: string;
  branchId: string;
  quantity: number;
  reason: string;
  notes: string;
}

interface Product {
  id: number;
  productName: string;
  sku: string;
  currentStock: number;
  stockByBranch?: { [branchId: number]: number }; // ✅ Stock por sucursal
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
  @Output() close = new EventEmitter<void>();
  @Output() adjustmentSuccess = new EventEmitter<void>();

  form: AdjustmentForm = {
    productId: '',
    branchId: '',
    quantity: 0,
    reason: '',
    notes: ''
  };

  // Productos
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  productSearchTerm: string = '';
  showProductDropdown: boolean = false;

  // Sucursales
  branches: Branch[] = [];

  // Estados de envío
  isSubmitting: boolean = false;
  submitError: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadBranches();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      console.log('🔄 Modal abierto - Recargando datos...');
      this.refreshData();
    }
  }

  async refreshData(): Promise<void> {
    await Promise.all([
      this.loadProducts(),
      this.loadBranches()
    ]);
    console.log('✅ Datos recargados:', this.allProducts.length, 'productos');
  }

  async loadProducts(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/api/v1/products`)
      );

      const productsList = Array.isArray(response)
        ? response
        : (response.content || response.data || []);

      this.allProducts = productsList.map((product: any) => ({
        id: product.id,
        productName: product.productName,
        sku: product.sku || '',
        currentStock: product.currentStock || 0,
        stockByBranch: {} // ✅ Inicializar objeto vacío
      }));

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
        product.sku.toLowerCase().includes(searchTerm)
      )
      .slice(0, 50);
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.form.productId = product.id.toString();
    this.productSearchTerm = `${product.productName} (${product.sku})`;
    this.showProductDropdown = false;

    // ✅ Si ya hay una sucursal seleccionada, cargar el stock de esa sucursal
    if (this.form.branchId) {
      this.loadProductStockByBranch();
    }
  }

  clearProductSelection(): void {
    this.selectedProduct = null;
    this.form.productId = '';
    this.productSearchTerm = '';
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

  // ✅ MÉTODO CORREGIDO: Obtener stock según sucursal seleccionada
  getSelectedProductStock(): number {
    if (!this.selectedProduct) return 0;

    // Si hay una sucursal seleccionada, mostrar el stock de esa sucursal
    if (this.form.branchId && this.selectedProduct.stockByBranch) {
      const branchId = parseInt(this.form.branchId);
      const branchStock = this.selectedProduct.stockByBranch[branchId];

      // Si ya se cargó el stock de la sucursal, usarlo
      if (branchStock !== undefined) {
        return branchStock;
      }
    }

    // Si no hay sucursal o no se ha cargado el stock específico, mostrar 0
    return 0;
  }

  // ✅ NUEVO: Método para cargar stock específico por sucursal
  async loadProductStockByBranch(): Promise<void> {
    if (!this.form.productId || !this.form.branchId) return;

    try {
      console.log(`🔍 Cargando stock - Producto: ${this.form.productId}, Sucursal: ${this.form.branchId}`);

      const response = await firstValueFrom(
        this.http.get<any>(
          `${environment.apiUrl}/api/v1/inventory/stock/${this.form.productId}/${this.form.branchId}`
        )
      );

      if (this.selectedProduct) {
        if (!this.selectedProduct.stockByBranch) {
          this.selectedProduct.stockByBranch = {};
        }

        const branchId = parseInt(this.form.branchId);
        const currentStock = response.currentStock ?? response.stock ?? 0;

        this.selectedProduct.stockByBranch[branchId] = currentStock;

        console.log(`✅ Stock cargado para sucursal ${branchId}: ${currentStock} unidades`);
      }
    } catch (error) {
      console.error('❌ Error al cargar stock por sucursal:', error);

      // Si el endpoint no existe, intentar con endpoint alternativo
      try {
        const response = await firstValueFrom(
          this.http.get<any>(
            `${environment.apiUrl}/api/v1/products/${this.form.productId}/stock?branchId=${this.form.branchId}`
          )
        );

        if (this.selectedProduct) {
          if (!this.selectedProduct.stockByBranch) {
            this.selectedProduct.stockByBranch = {};
          }

          const branchId = parseInt(this.form.branchId);
          const currentStock = response.currentStock ?? response.stock ?? 0;

          this.selectedProduct.stockByBranch[branchId] = currentStock;

          console.log(`✅ Stock cargado (método alternativo) para sucursal ${branchId}: ${currentStock} unidades`);
        }
      } catch (altError) {
        console.error('❌ Error en método alternativo:', altError);
        // Si ambos métodos fallan, dejar el stock en 0
        if (this.selectedProduct && this.selectedProduct.stockByBranch) {
          this.selectedProduct.stockByBranch[parseInt(this.form.branchId)] = 0;
        }
      }
    }
  }

  // ✅ NUEVO: Detectar cambio de sucursal y recargar stock
  async onBranchChange(): Promise<void> {
    if (this.selectedProduct && this.form.branchId) {
      await this.loadProductStockByBranch();
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
      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/api/v1/inventory/adjustments`, {
          productId: parseInt(this.form.productId),
          branchId: parseInt(this.form.branchId),
          quantity: this.form.quantity,
          reason: this.form.reason,
          notes: this.form.notes
        })
      );

      console.log('✅ Ajuste creado exitosamente:', response);

      // ✅ Actualizar el stock de la sucursal específica localmente
      if (this.selectedProduct && this.selectedProduct.stockByBranch) {
        const branchId = parseInt(this.form.branchId);
        const newStock = response.newStock ?? response.product?.newStock ??
                        (this.getSelectedProductStock() + this.form.quantity);

        this.selectedProduct.stockByBranch[branchId] = newStock;

        // Actualizar en la lista de productos
        const productIndex = this.allProducts.findIndex(p => p.id === this.selectedProduct!.id);
        if (productIndex !== -1 && this.allProducts[productIndex].stockByBranch) {
          this.allProducts[productIndex].stockByBranch![branchId] = newStock;
        }
      }

      // ✅ Emitir evento de éxito
      this.adjustmentSuccess.emit();

      // Cerrar el modal
      setTimeout(() => {
        this.resetForm();
        this.close.emit();
      }, 500);

    } catch (error: any) {
      console.error('❌ Error al crear ajuste:', error);
      this.submitError = error.error?.error || error.error?.message ||
                        'Error al crear el ajuste. Por favor intente nuevamente.';
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
      branchId: '',
      quantity: 0,
      reason: '',
      notes: ''
    };
    this.clearProductSelection();
    this.isSubmitting = false;
    this.submitError = '';
  }
}
