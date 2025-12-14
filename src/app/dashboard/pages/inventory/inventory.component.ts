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
import { firstValueFrom } from 'rxjs';
import { provideIcons } from '@ng-icons/core';
import { matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline, matDeleteOutline, matEditOutline, matFilterAltOutline, matSearchOutline } from '@ng-icons/material-icons/outline';
import { bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight } from '@ng-icons/bootstrap-icons';

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

  categories: string[] = ['all'];
  searchTerm = '';
  selectedCategory = 'all';
  load = false;

  // KPIs
  lowStockCount = 0;
  totalValue = 0;
  totalItems = 0;
  totalRevenue = 0;
  potentialProfit = 0;

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
      const data = await firstValueFrom(
        this.http.get<Inventory[]>(URL_PRODUCTS)
      );
      this.products = data;
      this.extractCategories();
      this.calculateKPIs();
      this.applyFilters();
    } catch {
      this.toast.error('Error al cargar inventario');
    } finally {
      this.load = false;
    }
  }

  extractCategories(): void {
    const cats = new Set(this.products.map(p => p.categoryName).filter(Boolean));
    this.categories = ['all', ...Array.from(cats) as string[]];
  }

  calculateKPIs(): void {
    this.lowStockCount = this.products.filter(p => p.stock < p.minStock).length;
    this.totalValue = this.products.reduce((s, p) => s + p.stock * p.cost, 0);
    this.totalItems = this.products.reduce((s, p) => s + p.stock, 0);
    this.totalRevenue = this.products.reduce((s, p) => s + p.stock * p.price, 0);
    this.potentialProfit = this.totalRevenue - this.totalValue;
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(p => {
      const matchText =
        p.productName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (p.productDesc?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false);

      const matchCategory =
        this.selectedCategory === 'all' ||
        p.categoryName === this.selectedCategory;

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
    if (!p.stock) return 'N/A';
    return ((p.soldLastMonth / p.stock) * 100).toFixed(0) + '%';
  }

  getMargin(p: Inventory): string {
    if (!p.price) return '0';
    return (((p.price - p.cost) / p.price) * 100).toFixed(0);
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
}
