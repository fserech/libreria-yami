import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  LucideAngularModule,
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  Filter,
  TrendingUp,
  BarChart3,
  Download,
  Grid,
  List
} from 'lucide-angular';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ToastService } from '../../../shared/services/toast.service';
import { URL_PRODUCTS } from '../../../shared/constants/endpoints';
import { ProductResponse } from '../../../shared/interfaces/product';
import { firstValueFrom } from 'rxjs';
import { provideIcons } from '@ng-icons/core';
import { matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline, matDeleteOutline, matEditOutline, matFilterAltOutline, matSearchOutline } from '@ng-icons/material-icons/outline';
import { bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight } from '@ng-icons/bootstrap-icons';
import { environment } from '../../../../environments/environment';

// Interfaz unificada para el inventario
interface InventoryItem {
  id: string; // productId-variantId o solo productId
  productId: number;
  variantId?: number;
  sku: string;
  name: string;
  description: string;
  categoryName: string;
  brandName: string;
  supplierNames: string[];
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  stockStatus: 'critical' | 'warning' | 'normal' | 'high';
  margin: number;
  profit: number;
  active: boolean;
  type: 'simple' | 'variant';
  variantInfo?: string; // Info de atributos para variantes
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, HeaderComponent, RouterOutlet],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  viewProviders: [provideIcons({
    matSearchOutline, matFilterAltOutline, matAddOutline, matArrowDownwardOutline,
    matArrowUpwardOutline, matDeleteOutline, matEditOutline, bootstrapChevronLeft,
    bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight
  })]
})
export default class InventoryComponent implements OnInit {

  readonly Search = Search;
  readonly Plus = Plus;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly Package = Package;
  readonly AlertTriangle = AlertTriangle;
  readonly Filter = Filter;
  readonly TrendingUp = TrendingUp;
  readonly BarChart3 = BarChart3;
  readonly Download = Download;
  readonly Grid = Grid;
  readonly List = List;

  inventoryItems: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];

  categories: any[] = [];
  brands: any[] = [];
  suppliers: any[] = [];

  searchTerm = '';
  selectedCategory: number | 'all' = 'all';
  selectedStatus: string = 'all';
  selectedType: string = 'all'; // all, simple, variant

  load = false;
  viewMode: 'table' | 'grid' = 'table';

  // KPIs
  lowStockCount = 0;
  totalValue = 0;
  totalItems = 0;
  totalRevenue = 0;
  potentialProfit = 0;
  averageMargin = 0;
  lowMarginCount = 0;

  // Productos críticos
  criticalItems: InventoryItem[] = [];

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  async loadInventory(): Promise<void> {
    this.load = true;
    try {
      // Cargar datos en paralelo
      const [productsData, categoriesData, brandsData, suppliersData] = await Promise.all([
        firstValueFrom(this.http.get<ProductResponse[]>(URL_PRODUCTS)),
        firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/api/v1/categories`)),
        firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/api/v1/categories/brands`)),
        firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/api/v1/suppliers`))
      ]);

      this.categories = categoriesData;
      this.brands = brandsData;
      this.suppliers = suppliersData;

      // Procesar productos y convertir a items de inventario
      this.inventoryItems = this.processProducts(productsData);

      this.calculateKPIs();
      this.applyFilters();
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      this.toast.error('Error al cargar inventario');
    } finally {
      this.load = false;
    }
  }

  processProducts(products: ProductResponse[]): InventoryItem[] {
    const items: InventoryItem[] = [];

    products.forEach(product => {
      if (product.hasVariants && product.variants && product.variants.length > 0) {
        // Producto con variantes: crear un item por cada variante
        product.variants.forEach(variant => {
          items.push(this.mapVariantToInventoryItem(product, variant));
        });
      } else {
        // Producto simple: crear un solo item
        items.push(this.mapSimpleProductToInventoryItem(product));
      }
    });

    return items;
  }

  mapSimpleProductToInventoryItem(product: ProductResponse): InventoryItem {
    const margin = this.calculateMargin(product.salePrice || 0, product.costPrice || 0);
    const profit = (product.salePrice || 0) - (product.costPrice || 0);

    return {
      id: `p-${product.id}`,
      productId: product.id,
      sku: product.sku || 'N/A',
      name: product.productName,
      description: product.productDesc,
      categoryName: product.category?.categoryName || 'Sin categoría',
      brandName: product.brand?.brandName || 'Sin marca',
      supplierNames: product.suppliers?.map(s => s.supplierName) || [],
      costPrice: product.costPrice || 0,
      salePrice: product.salePrice || 0,
      currentStock: product.currentStock || 0,
      minStock: product.minStock || 0,
      maxStock: product.maxStock || 100,
      stockStatus: this.calculateStockStatus(
        product.currentStock || 0,
        product.minStock || 0,
        product.maxStock || 100
      ),
      margin,
      profit,
      active: product.active,
      type: 'simple'
    };
  }

  mapVariantToInventoryItem(product: ProductResponse, variant: any): InventoryItem {
    const margin = this.calculateMargin(variant.salePrice, variant.costPrice);
    const profit = variant.salePrice - variant.costPrice;

    // Formatear atributos de la variante
    const variantInfo = Object.entries(variant.attributes || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join(' • ');

    return {
      id: `p-${product.id}-v-${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      sku: variant.sku,
      name: `${product.productName} - ${variant.variantName || 'Variante'}`,
      description: product.productDesc,
      categoryName: product.category?.categoryName || 'Sin categoría',
      brandName: product.brand?.brandName || 'Sin marca',
      supplierNames: variant.suppliers?.map((s: any) => s.supplierName) || [],
      costPrice: variant.costPrice,
      salePrice: variant.salePrice,
      currentStock: variant.currentStock,
      minStock: variant.minStock,
      maxStock: variant.maxStock,
      stockStatus: this.calculateStockStatus(
        variant.currentStock,
        variant.minStock,
        variant.maxStock
      ),
      margin,
      profit,
      active: variant.active,
      type: 'variant',
      variantInfo
    };
  }

  calculateStockStatus(current: number, min: number, max: number): 'critical' | 'warning' | 'normal' | 'high' {
    if (current < min) return 'critical';
    const percent = (current / max) * 100;
    if (percent < 40) return 'warning';
    if (percent > 80) return 'high';
    return 'normal';
  }

  calculateMargin(salePrice: number, costPrice: number): number {
    if (salePrice === 0) return 0;
    return ((salePrice - costPrice) / salePrice) * 100;
  }

  calculateKPIs(): void {
    // Productos con stock crítico
    this.criticalItems = this.inventoryItems.filter(item => item.stockStatus === 'critical');
    this.lowStockCount = this.criticalItems.length;

    // Valores totales
    this.totalValue = this.inventoryItems.reduce((sum, item) =>
      sum + (item.currentStock * item.costPrice), 0
    );

    this.totalItems = this.inventoryItems.reduce((sum, item) =>
      sum + item.currentStock, 0
    );

    this.totalRevenue = this.inventoryItems.reduce((sum, item) =>
      sum + (item.currentStock * item.salePrice), 0
    );

    this.potentialProfit = this.totalRevenue - this.totalValue;

    // Margen promedio
    if (this.inventoryItems.length > 0) {
      const totalMargin = this.inventoryItems.reduce((sum, item) => sum + item.margin, 0);
      this.averageMargin = totalMargin / this.inventoryItems.length;
    }

    // Productos con margen bajo
    this.lowMarginCount = this.inventoryItems.filter(item => item.margin < 20).length;
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredItems = this.inventoryItems.filter(item => {
      // Filtro de texto
      const matchText =
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        (item.variantInfo?.toLowerCase().includes(term) ?? false);

      // Filtro de categoría
      const matchCategory = this.selectedCategory === 'all' ||
        this.categories.find(c => c.categoryName === item.categoryName)?.id === this.selectedCategory;

      // Filtro de estado
      const matchStatus = this.selectedStatus === 'all' || item.stockStatus === this.selectedStatus;

      // Filtro de tipo
      const matchType = this.selectedType === 'all' || item.type === this.selectedType;

      return matchText && matchCategory && matchStatus && matchType;
    });
  }

  getStockBarColor(status: string): string {
    return {
      critical: 'bg-red-600',
      warning: 'bg-orange-600',
      high: 'bg-blue-600',
      normal: 'bg-green-600'
    }[status] || 'bg-gray-600';
  }

  getMarginClass(margin: number): string {
    if (margin >= 50) return 'text-green-600 dark:text-green-400 font-bold';
    if (margin >= 30) return 'text-green-600 dark:text-green-400';
    if (margin >= 20) return 'text-blue-600 dark:text-blue-400';
    if (margin >= 10) return 'text-orange-600 dark:text-orange-400';
    if (margin >= 0) return 'text-red-600 dark:text-red-400';
    return 'text-red-700 dark:text-red-500 font-bold';
  }

  addProduct(): void {
    this.router.navigate(['dashboard/products/detail/create']);
  }

  editItem(item: InventoryItem): void {
    // Navegar a la edición del producto (no de la variante individual)
    this.router.navigate([`/dashboard/products/detail/edit/${item.productId}`]);
  }

  async deleteItem(item: InventoryItem): Promise<void> {
    const message = item.type === 'variant'
      ? '¿Eliminar esta variante? Esto afectará el producto principal.'
      : '¿Eliminar este producto?';

    if (!confirm(message)) return;

    try {
      // Solo se puede eliminar el producto completo
      await firstValueFrom(this.http.delete(`${URL_PRODUCTS}/${item.productId}`));
      this.toast.success('Producto eliminado');
      this.loadInventory();
    } catch (error) {
      this.toast.error('Error al eliminar producto');
    }
  }

  viewLowStockProducts(): void {
    if (this.lowStockCount === 0) {
      this.toast.info('No hay productos con stock bajo');
      return;
    }
    this.filteredItems = this.criticalItems;
    this.selectedStatus = 'critical';
  }

  exportInventory(): void {
    const data = this.filteredItems.map(item => ({
      SKU: item.sku,
      Producto: item.name,
      Tipo: item.type === 'simple' ? 'Simple' : 'Variante',
      Variante: item.variantInfo || '-',
      Categoría: item.categoryName,
      Marca: item.brandName,
      'Stock Actual': item.currentStock,
      'Stock Mínimo': item.minStock,
      'Stock Máximo': item.maxStock,
      'Estado': item.stockStatus,
      'Costo': item.costPrice,
      'Precio': item.salePrice,
      'Margen %': item.margin.toFixed(2),
      'Ganancia': item.profit.toFixed(2),
      'Proveedores': item.supplierNames.join(', ')
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `inventario-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    this.toast.success('Inventario exportado');
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'table' ? 'grid' : 'table';
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.selectedStatus = 'all';
    this.selectedType = 'all';
    this.applyFilters();
  }
}
