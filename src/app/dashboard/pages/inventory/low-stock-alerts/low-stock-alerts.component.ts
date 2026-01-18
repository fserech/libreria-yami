import { CommonModule, NgClass } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matViewListOutline,
  matGridViewOutline,
  matRefreshOutline,
  matFileDownloadOutline,
  matEditOutline,
  matAddShoppingCartOutline,
  matCheckCircleOutline,
  matInventoryOutline,
  matWarningOutline
} from '@ng-icons/material-icons/outline';
import {
  bootstrapChevronBarLeft,
  bootstrapChevronBarRight,
  bootstrapChevronLeft,
  bootstrapChevronRight
} from '@ng-icons/bootstrap-icons';

import { InventoryService } from '../../../../shared/services/inventory.service';
import { ProductStock } from '../../../../shared/interfaces/inventory';
import { AuthService } from '../../../../shared/services/auth.service';
import { AdjustmentModalComponent } from '../Components/adjustment-modal/adjustment-modal.component';
import { CrudService } from '../../../../shared/services/crud.service';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-low-stock-alerts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIcon,
    NgClass,
    AdjustmentModalComponent
  ],
  templateUrl: './low-stock-alerts.component.html',
  styleUrl: './low-stock-alerts.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  viewProviders: [
    provideIcons({
      matViewListOutline,
      matGridViewOutline,
      matRefreshOutline,
      matFileDownloadOutline,
      matEditOutline,
      matAddShoppingCartOutline,
      matCheckCircleOutline,
      matInventoryOutline,
      matWarningOutline,
      bootstrapChevronLeft,
      bootstrapChevronRight,
      bootstrapChevronBarLeft,
      bootstrapChevronBarRight
    })
  ]
})
export class LowStockAlertsComponent implements OnInit {
  Math = Math;

  activeView: 'alerts' | 'stock' = 'alerts';

  alerts: ProductStock[] = [];
  allStock: ProductStock[] = [];
  filteredAlerts: ProductStock[] = [];
  filteredStock: ProductStock[] = [];
  branches: Array<{id: number, branchName: string}> = [];

  selectedBranchId: string = '';
  selectedAlertLevel: string = 'all';
  searchTerm: string = '';

  loading = false;
  viewMode: 'table' | 'cards' = 'table';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  user: any;

  showAdjustmentModal = false;
  editingMovement: any;

  get totalAlertsCount(): number {
    return this.filteredAlerts.length;
  }

  get criticalCount(): number {
    return this.filteredAlerts.filter(a => a.currentStock === 0).length;
  }

  get warningCount(): number {
    return this.filteredAlerts.filter(a => a.currentStock > 0 && a.belowMinStock).length;
  }

  // ⭐ CORREGIDO: Contar solo productos únicos, no variantes duplicadas
  get totalProducts(): number {
    const uniqueProducts = new Set<number>();
    this.filteredStock.forEach(item => {
      uniqueProducts.add(item.productId);
    });
    return uniqueProducts.size;
  }

  // ⭐ CORREGIDO: Usar costPrice si averageCost no está disponible
  get totalStockValue(): number {
    return this.filteredStock.reduce((sum, item) => {
      // Prioridad: averageCost > costPrice del producto > 0
      const cost = item.averageCost || item.product?.costPrice || 0;
      return sum + (item.currentStock * cost);
    }, 0);
  }

  get paginatedItems(): ProductStock[] {
    const items = this.activeView === 'alerts' ? this.filteredAlerts : this.filteredStock;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return items.slice(startIndex, endIndex);
  }

  get startIndex(): number {
    const totalItems = this.activeView === 'alerts' ? this.filteredAlerts.length : this.filteredStock.length;
    return totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    const totalItems = this.activeView === 'alerts' ? this.filteredAlerts.length : this.filteredStock.length;
    const end = this.currentPage * this.itemsPerPage;
    return end > totalItems ? totalItems : end;
  }

  get totalItems(): number {
    return this.activeView === 'alerts' ? this.filteredAlerts.length : this.filteredStock.length;
  }

  get page(): number {
    return this.currentPage;
  }

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private auth: AuthService,
    private crud: CrudService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  private loadBranches(): void {
    this.loading = true;
    const branchesUrl = `${environment.apiUrl}/api/v1/branches`;

    this.http.get<any[]>(branchesUrl).subscribe({
      next: (branches) => {
        this.branches = branches.map((b: any) => ({
          id: b.id,
          branchName: b.name
        }));
        this.loadInitialData();
      },
      error: (error) => {
        console.error('Error cargando sucursales:', error);
        this.loading = false;
        this.loadInitialData();
      }
    });
  }

  private loadInitialData(): void {
    forkJoin({
      alerts: this.inventoryService.getLowStockProducts(),
      stock: this.inventoryService.getAllProductStock()
    }).subscribe({
      next: (results) => {
        this.alerts = results.alerts;
        this.allStock = results.stock;
        this.syncBranchesFromData();
        this.applyFilters();
        this.applyStockFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando datos:', error);
        this.loading = false;
      }
    });
  }

  private syncBranchesFromData(): void {
    const branchMap = new Map<number, string>();

    this.branches.forEach(branch => {
      branchMap.set(branch.id, branch.branchName);
    });

    this.alerts.forEach(alert => {
      if (alert.branchId && alert.branchName && !branchMap.has(alert.branchId)) {
        branchMap.set(alert.branchId, alert.branchName);
      }
    });

    this.allStock.forEach(item => {
      if (item.branchId && item.branchName && !branchMap.has(item.branchId)) {
        branchMap.set(item.branchId, item.branchName);
      }
    });

    this.branches = Array.from(branchMap.entries()).map(([id, branchName]) => ({
      id,
      branchName
    }));

    this.branches.sort((a, b) =>
      a.branchName.localeCompare(b.branchName)
    );
  }

  switchView(view: 'alerts' | 'stock'): void {
    this.activeView = view;
    this.currentPage = 1;
    this.searchTerm = '';

    if (view === 'alerts') {
      this.applyFilters();
    } else {
      this.applyStockFilters();
    }
  }

  loadAllStock(forceReload: boolean = false): void {
    this.loading = true;
    const branchId = this.selectedBranchId ? Number(this.selectedBranchId) : undefined;

    this.inventoryService.getAllProductStock(branchId)
      .subscribe({
        next: (products: ProductStock[]) => {
          this.allStock = products;
          this.syncBranchesFromData();
          this.applyStockFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando stock:', error);
          this.loading = false;
        }
      });
  }

  applyStockFilters(): void {
    this.filteredStock = this.allStock.filter(item => {
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const productName = this.getDisplayName(item).toLowerCase();
        const sku = this.getDisplaySKU(item).toLowerCase();

        if (!productName.includes(searchLower) && !sku.includes(searchLower)) {
          return false;
        }
      }

      if (this.selectedBranchId && this.selectedBranchId !== '') {
        if (item.branchId !== Number(this.selectedBranchId)) {
          return false;
        }
      }

      return true;
    });

    this.filteredStock.sort((a, b) =>
      this.getDisplayName(a).localeCompare(this.getDisplayName(b))
    );

    this.totalPages = Math.ceil(this.filteredStock.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
    if (this.activeView === 'alerts') {
      this.applyFilters();
    } else {
      this.applyStockFilters();
    }
  }

  loadAlerts(forceReload: boolean = false): void {
    this.loading = true;
    const branchId = this.selectedBranchId ? Number(this.selectedBranchId) : undefined;

    if (forceReload) {
      this.alerts = [];
      this.filteredAlerts = [];
    }

    this.inventoryService.getLowStockProducts(branchId)
      .subscribe({
        next: (products: ProductStock[]) => {
          this.alerts = products;
          this.syncBranchesFromData();
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando alertas:', error);
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredAlerts = this.alerts.filter(alert => {
      if (this.selectedAlertLevel === 'critical' && alert.currentStock > 0) {
        return false;
      }
      if (this.selectedAlertLevel === 'warning' && (alert.currentStock === 0 || !alert.belowMinStock)) {
        return false;
      }

      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const productName = this.getDisplayName(alert).toLowerCase();
        const sku = this.getDisplaySKU(alert).toLowerCase();

        if (!productName.includes(searchLower) && !sku.includes(searchLower)) {
          return false;
        }
      }

      if (this.selectedBranchId && this.selectedBranchId !== '') {
        if (alert.branchId !== Number(this.selectedBranchId)) {
          return false;
        }
      }

      return true;
    });

    this.filteredAlerts.sort((a, b) => {
      if (a.currentStock === 0 && b.currentStock > 0) return -1;
      if (a.currentStock > 0 && b.currentStock === 0) return 1;
      return a.currentStock - b.currentStock;
    });

    this.totalPages = Math.ceil(this.filteredAlerts.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  onBranchChange(): void {
    this.currentPage = 1;
    this.loadAlerts();
    this.loadAllStock();
  }

  onAlertLevelChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.scrollToTop();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.scrollToTop();
    }
  }

  firstPage(): void {
    this.currentPage = 1;
    this.scrollToTop();
  }

  lastPage(): void {
    this.currentPage = this.totalPages;
    this.scrollToTop();
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getStockStatus(item: ProductStock): 'critical' | 'warning' | 'good' | 'excess' {
    if (item.currentStock === 0) return 'critical';
    if (item.belowMinStock) return 'warning';
    if (item.currentStock > item.maxStock) return 'excess';
    return 'good';
  }

  getStockStatusClass(item: ProductStock): string {
    const status = this.getStockStatus(item);
    switch (status) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'excess': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-green-600 dark:text-green-400';
    }
  }

  isVariant(alert: ProductStock): boolean {
    return alert.variantId != null;
  }

  getDisplayName(alert: ProductStock): string {
    if (this.isVariant(alert) && alert.product?.variants) {
      const variant = alert.product.variants.find(v => v.id === alert.variantId);
      return variant?.variantName || alert.product?.productName || 'N/A';
    }
    return alert.product?.productName || 'N/A';
  }

  getDisplaySKU(alert: ProductStock): string {
    if (this.isVariant(alert) && alert.product?.variants) {
      const variant = alert.product.variants.find(v => v.id === alert.variantId);
      return variant?.sku || 'N/A';
    }
    return alert.product?.sku || 'N/A';
  }

  getVariantAttributes(alert: ProductStock): string {
    if (!this.isVariant(alert) || !alert.product?.variants) {
      return '';
    }

    const variant = alert.product.variants.find(v => v.id === alert.variantId);
    if (!variant?.attributes || Object.keys(variant.attributes).length === 0) {
      return '';
    }

    return Object.entries(variant.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' • ');
  }

  getTypeBadge(alert: ProductStock): string {
    return this.isVariant(alert) ? 'Variante' : 'Producto simple';
  }

  getTypeBadgeClass(alert: ProductStock): string {
    return this.isVariant(alert)
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  }

  getAlertLevel(alert: ProductStock): 'critical' | 'warning' | 'normal' {
    if (alert.currentStock === 0) return 'critical';
    if (alert.belowMinStock) return 'warning';
    return 'normal';
  }

  getStockPercentage(alert: ProductStock): number {
    if (alert.maxStock === 0) return 0;
    return Math.min(100, (alert.currentStock / alert.maxStock) * 100);
  }

  viewProductHistory(alert: ProductStock): void {
    const queryParams: any = { productId: alert.productId };
    if (alert.variantId) {
      queryParams.variantId = alert.variantId;
    }

    this.router.navigate(['/dashboard/inventory/movements'], {
      queryParams
    });
  }

  createPurchaseOrder(alert: ProductStock): void {
    const queryParams: any = { productId: alert.productId };
    if (alert.variantId) {
      queryParams.variantId = alert.variantId;
    }

    this.router.navigate(['/dashboard/purchases/create'], {
      queryParams
    });
  }

  adjustStock(alert: ProductStock): void {
    this.editingMovement = {
      productId: alert.productId,
      variantId: alert.variantId || null,
      branchId: alert.branchId,
      product: alert.product,
      branch: {
        branchId: alert.branchId,
        branchName: alert.branchName
      },
      currentStock: alert.currentStock,
      quantity: 0,
      movementType: 'ADJUSTMENT',
      date: new Date().toISOString()
    };

    this.showAdjustmentModal = true;
  }

  closeAdjustmentModal(): void {
    this.showAdjustmentModal = false;
    this.editingMovement = undefined;
  }

  handleAdjustmentSuccess(): void {
    setTimeout(() => {
      this.showAdjustmentModal = false;
      this.editingMovement = undefined;
      this.loadAlerts(true);
      this.loadAllStock(true);
    }, 500);
  }

  exportToExcel(): void {
    const data = this.activeView === 'alerts'
      ? this.filteredAlerts.map(alert => {
          const cost = alert.averageCost || alert.product?.costPrice || 0;
          return {
            'Tipo': this.getTypeBadge(alert),
            'Producto': this.getDisplayName(alert),
            'SKU': this.getDisplaySKU(alert),
            'Atributos': this.getVariantAttributes(alert),
            'Sucursal': alert.branchName || 'N/A',
            'Stock Actual': alert.currentStock,
            'Stock Mínimo': alert.minStock,
            'Stock Máximo': alert.maxStock,
            'Nivel': this.getAlertLevel(alert) === 'critical' ? 'CRÍTICO' : 'ADVERTENCIA',
            'Costo Unitario': cost,
            'Valor Total': alert.currentStock * cost
          };
        })
      : this.filteredStock.map(item => {
          const cost = item.averageCost || item.product?.costPrice || 0;
          return {
            'Tipo': this.getTypeBadge(item),
            'Producto': this.getDisplayName(item),
            'SKU': this.getDisplaySKU(item),
            'Atributos': this.getVariantAttributes(item),
            'Sucursal': item.branchName || 'N/A',
            'Stock Actual': item.currentStock,
            'Stock Mínimo': item.minStock,
            'Stock Máximo': item.maxStock,
            'Estado': this.getStockStatus(item).toUpperCase(),
            'Costo Unitario': cost,
            'Valor Total': item.currentStock * cost
          };
        });

    console.log('📊 Datos para exportar:', data);
    console.log('💰 Valor total del inventario: Q', this.totalStockValue.toFixed(2));
  }

  refresh(): void {
    if (this.activeView === 'alerts') {
      this.loadAlerts(true);
    } else {
      this.loadAllStock(true);
    }
  }
}
