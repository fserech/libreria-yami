import { Component, Output, EventEmitter, OnInit } from '@angular/core';
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
export class AdjustmentModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<AdjustmentForm>();

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadBranches();
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
        currentStock: product.currentStock || 0
      }));

      // Inicialmente mostrar los primeros 20 productos
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

  // Búsqueda de productos
  onProductSearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase().trim();
    this.productSearchTerm = searchTerm;
    this.showProductDropdown = true;

    if (!searchTerm) {
      // Si no hay búsqueda, mostrar los primeros 20
      this.filteredProducts = this.allProducts.slice(0, 20);
      return;
    }

    // Filtrar productos por nombre o SKU
    this.filteredProducts = this.allProducts
      .filter(product =>
        product.productName.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm)
      )
      .slice(0, 50); // Limitar a 50 resultados
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.form.productId = product.id.toString();
    this.productSearchTerm = `${product.productName} (${product.sku})`;
    this.showProductDropdown = false;
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
    // Delay para permitir click en dropdown
    setTimeout(() => {
      this.showProductDropdown = false;
    }, 200);
  }

  getSelectedProductStock(): number {
    return this.selectedProduct?.currentStock || 0;
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.submit.emit(this.form);
      this.resetForm();
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
  }
}
