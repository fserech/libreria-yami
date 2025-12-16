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
  Download
} from 'lucide-angular';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ToastService } from '../../../shared/services/toast.service';
import { URL_PRODUCTS } from '../../../shared/constants/endpoints';
import { Inventory, InventoryStatus } from '../../../shared/interfaces/inventory';
import { Product } from '../../../shared/interfaces/product';
import { firstValueFrom } from 'rxjs';
import { provideIcons } from '@ng-icons/core';
import { matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline, matDeleteOutline, matEditOutline, matFilterAltOutline, matSearchOutline } from '@ng-icons/material-icons/outline';
import { bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight } from '@ng-icons/bootstrap-icons';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, HeaderComponent, RouterOutlet],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
   viewProviders: [ provideIcons({ matSearchOutline, matFilterAltOutline, matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline,
       matDeleteOutline, matEditOutline, bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight }) ]
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

  products: Inventory[] = [];
  filteredProducts: Inventory[] = [];

  categories: any[] = [];
  brands: any[] = [];
  suppliers: any[] = [];

  searchTerm = '';
  selectedCategory: number | 'all' = 'all';

  load = false;

  // KPIs
  lowStockCount = 0;
  totalValue = 0;
  totalItems = 0;
  totalRevenue = 0;
  potentialProfit = 0;
  averageMargin = 0;
  lowMarginCount = 0;

  // Productos críticos
  criticalProducts: Inventory[] = [];

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.load = true;
    try {
      // Cargar productos, categorías, marcas y proveedores en paralelo
      const [productsData, categoriesData, brandsData, suppliersData] = await Promise.all([
        firstValueFrom(this.http.get<Product[]>(URL_PRODUCTS)),
        firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/api/v1/categories`)),
        firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/api/v1/categories/brands`)),
        firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/api/v1/suppliers`))
      ]);

      this.categories = categoriesData;
      this.brands = brandsData;
      this.suppliers = suppliersData;
      // Mapear productos a inventario
      this.products = productsData.map(p => this.mapProductToInventory(p));
      this.calculateKPIs();
      this.applyFilters();
    } catch (error) {
      this.toast.error('Error al cargar inventario');
    } finally {
      this.load = false;
    }
  }

  mapProductToInventory(product: Product): Inventory {
    // OPCIÓN 1: Usar minStock como stock actual (temporal)
    // const currentStock = product.minStock || 0;

    // OPCIÓN 2: Usar un valor aleatorio para simular (MEJOR PARA VER ALERTAS)
    const maxStock = product.maxStock || 100;
    const minStock = product.minStock || 10;
    // Generar stock aleatorio entre minStock y maxStock
    const currentStock = Math.floor(Math.random() * (maxStock - minStock + 1)) + minStock;

    // Obtener nombre de categoría
    const category = this.categories.find(c => c.id === product.categoryId);

    // Obtener nombres de marcas
    const brandName = product.brandRef
    ? (this.brands.find(b => b.id === product.brandRef)?.brandName || 'Sin marca')
    : 'Sin marca';

    // Obtener nombres de proveedores
    const supplierNames = product.supplierId?.map(suppId => {
      const supplier = this.suppliers.find(s => s.id === suppId);
      return supplier?.supplierName || 'N/A';
    }) || [];

    // Simular ventas del último mes
    const soldLastMonth = Math.floor(Math.random() * currentStock * 0.3); // 0-30% del stock

    return {
      id: product.id,
      productName: product.productName,
      productDesc: product.productDesc,
      salePrice: product.salePrice,
      costPrice: product.costPrice || 0,
      categoryId: product.categoryId,
      categoryName: category?.categoryName || 'Sin categoría',
      brandRef: product.brandRef,
      brandNames: brandName,
      supplierId: product.supplierId,
      supplierNames: supplierNames,
      stock: currentStock, // Stock simulado
      minStock: minStock,
      maxStock: maxStock,
      active: product.active,
      isSelected: product.isSelected,
      soldLastMonth: soldLastMonth,
      lastRestock: new Date().toISOString()
    };
  }

  calculateKPIs(): void {
    // Calcular productos con stock bajo
    this.criticalProducts = this.products.filter(p => p.stock < p.minStock);
    this.lowStockCount = this.criticalProducts.length;

    console.log('Productos con stock bajo:', this.criticalProducts); // Debug

    // Calcular valores
    this.totalValue = this.products.reduce((s, p) => s + p.stock * p.costPrice, 0);
    this.totalItems = this.products.reduce((s, p) => s + p.stock, 0);
    this.totalRevenue = this.products.reduce((s, p) => s + p.stock * p.salePrice, 0);
    this.potentialProfit = this.totalRevenue - this.totalValue;

    // Calcular margen promedio
    if (this.products.length > 0) {
      const totalMargin = this.products.reduce((sum, p) => {
        if (p.salePrice > 0) {
          return sum + ((p.salePrice - p.costPrice) / p.salePrice) * 100;
        }
        return sum;
      }, 0);
      this.averageMargin = totalMargin / this.products.length;
    }

    // Calcular productos con margen bajo
    this.lowMarginCount = this.products.filter(p => {
      const margin = ((p.salePrice - p.costPrice) / p.salePrice) * 100;
      return margin < 20; // Margen menor al 20%
    }).length;
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredProducts = this.products.filter(p => {
      const matchText =
        p.productName.toLowerCase().includes(term) ||
        (p.productDesc?.toLowerCase().includes(term) ?? false);

      const matchCategory =
        this.selectedCategory === 'all'
          ? true
          : p.categoryId === this.selectedCategory;

      return matchText && matchCategory;
    });
  }

  getStockStatus(p: Inventory): InventoryStatus {
    if (p.stock < p.minStock) return 'critical';
    const percent = (p.stock / p.maxStock) * 100;
    if (percent < 40) return 'warning';
    if (percent > 80) return 'high';
    return 'normal';
  }

  getRotationRate(p: Inventory): string {
    if (!p.stock || p.stock === 0) return 'N/A';
    const rotation = ((p.soldLastMonth || 0) / p.stock) * 100;
    return rotation.toFixed(0) + '%';
  }

  getRotationClass(p: Inventory): string {
    if (!p.stock) return '';
    const rotation = ((p.soldLastMonth || 0) / p.stock) * 100;

    if (rotation >= 80) return 'text-green-600 dark:text-green-400 font-semibold';
    if (rotation >= 50) return 'text-blue-600 dark:text-blue-400';
    if (rotation >= 20) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  getMargin(p: Inventory): string {
    if (!p.salePrice || p.salePrice === 0) return '0';
    const margin = ((p.salePrice - p.costPrice) / p.salePrice) * 100;
    return margin.toFixed(1);
  }

  getMarginClass(p: Inventory): string {
    if (!p.salePrice) return '';
    const margin = ((p.salePrice - p.costPrice) / p.salePrice) * 100;

    if (margin >= 50) return 'text-green-600 dark:text-green-400 font-bold';
    if (margin >= 30) return 'text-green-600 dark:text-green-400';
    if (margin >= 20) return 'text-blue-600 dark:text-blue-400';
    if (margin >= 10) return 'text-orange-600 dark:text-orange-400';
    if (margin >= 0) return 'text-red-600 dark:text-red-400';
    return 'text-red-700 dark:text-red-500 font-bold';
  }

  getProfit(p: Inventory): number {
    return p.salePrice - p.costPrice;
  }

  getStockBarColor(status: InventoryStatus): string {
    return {
      critical: 'bg-red-600',
      warning: 'bg-orange-600',
      high: 'bg-blue-600',
      normal: 'bg-green-600'
    }[status];
  }

  addProduct(): void {
    this.router.navigate(['dashboard/inventory/stock-entry-exit']);
  }

  edit(id: number){
    this.router.navigate([`/dashboard/products/detail/edit/${id}`]);
  }

  async deleteProduct(id: number): Promise<void> {
    if (!confirm('¿Eliminar producto?')) return;
    await firstValueFrom(this.http.delete(`${URL_PRODUCTS}/${id}`));
    this.toast.success('Producto eliminado');
    this.loadProducts();
  }

  exportInventory(): void {
    const blob = new Blob(
      [JSON.stringify(this.filteredProducts, null, 2)],
      { type: 'application/json' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inventario.json';
    a.click();
    this.toast.success('Inventario exportado');
  }

  // Método para ver detalles de alertas
  viewLowStockProducts(): void {
    if (this.lowStockCount === 0) {
      this.toast.info('No hay productos con stock bajo');
      return;
    }
    console.log('Productos con stock crítico:', this.criticalProducts);
    // Puedes filtrar la tabla para mostrar solo estos productos
    this.filteredProducts = this.criticalProducts;
  }
}
