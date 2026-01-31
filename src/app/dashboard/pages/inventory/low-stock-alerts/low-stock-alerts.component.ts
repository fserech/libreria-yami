import { CommonModule, NgClass } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
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
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { saveAs } from 'file-saver';
import { ViewModeComponent, StockItem, ViewMode, ActiveView } from '../Components/view-mode/view-mode.component';

// ⭐ Cache estático con TTL
interface CacheData {
  alerts: ProductStock[];
  allStock: ProductStock[];
  branches: Array<{id: number, branchName: string}>;
  timestamp: number;
}

@Component({
  selector: 'app-low-stock-alerts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIcon,
    NgClass,
    AdjustmentModalComponent,
    ViewModeComponent
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
export class LowStockAlertsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  private static cache: CacheData | null = null;

  Math = Math;

  activeView: ActiveView = 'alerts';
  viewMode: ViewMode = 'table';

  alerts: ProductStock[] = [];
  allStock: ProductStock[] = [];
  filteredAlerts: ProductStock[] = [];
  filteredStock: ProductStock[] = [];
  branches: Array<{id: number, branchName: string}> = [];

  selectedBranchId: string = '';
  selectedAlertLevel: string = 'all';
  searchTerm: string = '';

  loading = false;

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  user: any;

  showAdjustmentModal = false;
  editingMovement: any;

  // ⭐ Getters optimizados con caching
  private _totalAlertsCount?: number;
  private _criticalCount?: number;
  private _warningCount?: number;
  private _totalProducts?: number;
  private _totalStockValue?: number;

  get totalAlertsCount(): number {
    if (this._totalAlertsCount === undefined) {
      this._totalAlertsCount = this.filteredAlerts.length;
    }
    return this._totalAlertsCount;
  }

  get criticalCount(): number {
    if (this._criticalCount === undefined) {
      this._criticalCount = this.filteredAlerts.filter(a => a.currentStock === 0).length;
    }
    return this._criticalCount;
  }

  get warningCount(): number {
    if (this._warningCount === undefined) {
      this._warningCount = this.filteredAlerts.filter(a => a.currentStock > 0).length;
    }
    return this._warningCount;
  }

  get totalProducts(): number {
    if (this._totalProducts === undefined) {
      const uniqueProducts = new Set<number>();
      this.filteredStock.forEach(item => {
        uniqueProducts.add(item.productId);
      });
      this._totalProducts = uniqueProducts.size;
    }
    return this._totalProducts;
  }

  get totalStockValue(): number {
    if (this._totalStockValue === undefined) {
      this._totalStockValue = this.filteredStock.reduce((sum, item) => {
        const cost = item.averageCost || item.product?.costPrice || 0;
        return sum + (item.currentStock * cost);
      }, 0);
    }
    return this._totalStockValue;
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

  get stockItemsForView(): StockItem[] {
    return this.paginatedItems.map(item => this.convertToStockItem(item));
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ⭐ Limpiar cache de getters
  private clearGetterCache(): void {
    this._totalAlertsCount = undefined;
    this._criticalCount = undefined;
    this._warningCount = undefined;
    this._totalProducts = undefined;
    this._totalStockValue = undefined;
  }

  private hasLowStock(item: ProductStock): boolean {
    const isBelowMin = item.currentStock < item.minStock;
    const isNearMin = item.currentStock <= (item.minStock * 1.2);
    return isBelowMin || (isNearMin && item.belowMinStock);
  }

  private convertToStockItem(productStock: ProductStock): StockItem {
    const isVariant = productStock.variantId != null;
    let displayName = '';
    let sku = '';
    let attributes: { [key: string]: string } | undefined;

    if (isVariant && productStock.product?.variants) {
      const variant = productStock.product.variants.find(v => v.id === productStock.variantId);
      displayName = variant?.variantName || productStock.product?.productName || 'N/A';
      sku = variant?.sku || 'N/A';
      attributes = variant?.attributes;
    } else {
      displayName = productStock.product?.productName || 'N/A';
      sku = productStock.product?.sku || 'N/A';
    }

    return {
      id: `${productStock.productId}-${productStock.variantId || 0}-${productStock.branchId}`,
      productId: productStock.productId.toString(),
      variantId: productStock.variantId?.toString(),
      productName: productStock.product?.productName,
      variantName: isVariant ? displayName : undefined,
      sku: sku,
      currentStock: productStock.currentStock,
      minStock: productStock.minStock,
      maxStock: productStock.maxStock,
      branchName: productStock.branchName,
      branchId: productStock.branchId.toString(),
      attributes: attributes
    };
  }

  handleAdjustStock(item: StockItem): void {
    const originalItem = this.paginatedItems.find(ps =>
      ps.productId.toString() === item.productId &&
      (item.variantId ? ps.variantId?.toString() === item.variantId : !ps.variantId) &&
      ps.branchId.toString() === item.branchId
    );

    if (originalItem) {
      this.adjustStock(originalItem);
    }
  }

  handleCreatePurchaseOrder(item: StockItem): void {
    const originalItem = this.paginatedItems.find(ps =>
      ps.productId.toString() === item.productId &&
      (item.variantId ? ps.variantId?.toString() === item.variantId : !ps.variantId) &&
      ps.branchId.toString() === item.branchId
    );

    if (originalItem) {
      this.createPurchaseOrder(originalItem);
    }
  }

  handleViewModeChange(mode: ViewMode): void {
    this.viewMode = mode;
  }

  // ⭐ OPTIMIZACIÓN: Carga de sucursales más rápida
  private loadBranches(): void {
    this.loading = true;
    const branchesUrl = `${environment.apiUrl}/api/v1/branches`;

    this.http.get<any[]>(branchesUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

  // ⭐ OPTIMIZACIÓN CRÍTICA: Uso de cache
  private loadInitialData(): void {
    const now = Date.now();
    const useCache = LowStockAlertsComponent.cache &&
                     (now - LowStockAlertsComponent.cache.timestamp) < LowStockAlertsComponent.CACHE_TTL;

    if (useCache && LowStockAlertsComponent.cache) {
      console.log('✅ Usando datos en cache');
      this.alerts = LowStockAlertsComponent.cache.alerts;
      this.allStock = LowStockAlertsComponent.cache.allStock;

      // Merge branches (cache + nuevas)
      const cachedBranchIds = new Set(LowStockAlertsComponent.cache.branches.map(b => b.id));
      const newBranches = this.branches.filter(b => !cachedBranchIds.has(b.id));
      this.branches = [...LowStockAlertsComponent.cache.branches, ...newBranches];

      this.applyFilters();
      this.applyStockFilters();
      this.loading = false;
      return;
    }

    // Cargar datos frescos
    forkJoin({
      alerts: this.inventoryService.getLowStockProducts(),
      stock: this.inventoryService.getAllProductStock()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (results) => {
        this.alerts = results.alerts.filter(p => this.hasLowStock(p));
        this.allStock = results.stock;

        console.log('📊 Datos cargados:', {
          alertas: this.alerts.length,
          stock: this.allStock.length,
          criticas: this.alerts.filter(a => a.currentStock === 0).length
        });

        // ⭐ Guardar en cache
        LowStockAlertsComponent.cache = {
          alerts: this.alerts,
          allStock: this.allStock,
          branches: this.branches,
          timestamp: now
        };

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

    this.branches = Array.from(branchMap.entries())
      .map(([id, branchName]) => ({ id, branchName }))
      .sort((a, b) => a.branchName.localeCompare(b.branchName));
  }

  switchView(view: ActiveView): void {
    this.activeView = view;
    this.currentPage = 1;
    this.searchTerm = '';
    this.clearGetterCache();

    if (view === 'alerts') {
      this.applyFilters();
    } else {
      this.applyStockFilters();
    }
  }

  loadAllStock(forceReload: boolean = false): void {
    if (forceReload) {
      // ⭐ Invalidar cache al forzar recarga
      LowStockAlertsComponent.cache = null;
    }

    this.loading = true;
    const branchId = this.selectedBranchId ? Number(this.selectedBranchId) : undefined;

    this.inventoryService.getAllProductStock(branchId)
      .pipe(takeUntil(this.destroy$))
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

  // ⭐ OPTIMIZACIÓN: Filtrado más eficiente
  applyStockFilters(): void {
    const searchLower = this.searchTerm.toLowerCase();
    const branchIdNum = this.selectedBranchId ? Number(this.selectedBranchId) : null;

    this.filteredStock = this.allStock.filter(item => {
      // Filtro por búsqueda
      if (searchLower) {
        const stockItem = this.convertToStockItem(item);
        const productName = (stockItem.variantName || stockItem.productName || '').toLowerCase();
        const sku = stockItem.sku.toLowerCase();

        if (!productName.includes(searchLower) && !sku.includes(searchLower)) {
          return false;
        }
      }

      // Filtro por sucursal
      if (branchIdNum !== null && item.branchId !== branchIdNum) {
        return false;
      }

      return true;
    });

    // Ordenar
    this.filteredStock.sort((a, b) => {
      const nameA = this.convertToStockItem(a).variantName || this.convertToStockItem(a).productName || '';
      const nameB = this.convertToStockItem(b).variantName || this.convertToStockItem(b).productName || '';
      return nameA.localeCompare(nameB);
    });

    this.totalPages = Math.ceil(this.filteredStock.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    this.clearGetterCache();
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
    if (forceReload) {
      // ⭐ Invalidar cache al forzar recarga
      LowStockAlertsComponent.cache = null;
    }

    this.loading = true;
    const branchId = this.selectedBranchId ? Number(this.selectedBranchId) : undefined;

    this.inventoryService.getLowStockProducts(branchId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products: ProductStock[]) => {
          this.alerts = products.filter(p => this.hasLowStock(p));

          console.log('📊 Alertas recargadas:', {
            backend: products.length,
            filtradas: this.alerts.length
          });

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
    const searchLower = this.searchTerm.toLowerCase();
    const branchIdNum = this.selectedBranchId ? Number(this.selectedBranchId) : null;

    this.filteredAlerts = this.alerts.filter(alert => {
      // Filtro por nivel
      if (this.selectedAlertLevel === 'critical') {
        if (alert.currentStock !== 0) return false;
      }

      if (this.selectedAlertLevel === 'warning') {
        if (alert.currentStock === 0) return false;
      }

      // Filtro por búsqueda
      if (searchLower) {
        const stockItem = this.convertToStockItem(alert);
        const productName = (stockItem.variantName || stockItem.productName || '').toLowerCase();
        const sku = stockItem.sku.toLowerCase();

        if (!productName.includes(searchLower) && !sku.includes(searchLower)) {
          return false;
        }
      }

      // Filtro por sucursal
      if (branchIdNum !== null && alert.branchId !== branchIdNum) {
        return false;
      }

      return true;
    });

    // Ordenar: críticos primero
    this.filteredAlerts.sort((a, b) => {
      const aCritical = a.currentStock === 0;
      const bCritical = b.currentStock === 0;

      if (aCritical && !bCritical) return -1;
      if (!aCritical && bCritical) return 1;
      return a.currentStock - b.currentStock;
    });

    this.totalPages = Math.ceil(this.filteredAlerts.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    this.clearGetterCache();
  }

  onBranchChange(): void {
    this.currentPage = 1;

    // ⭐ Usar datos en memoria si están disponibles
    if (LowStockAlertsComponent.cache) {
      this.applyFilters();
      this.applyStockFilters();
    } else {
      this.loadAlerts();
      this.loadAllStock();
    }
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

      // ⭐ Invalidar cache al hacer cambios
      LowStockAlertsComponent.cache = null;

      this.loadAlerts(true);
      this.loadAllStock(true);
    }, 500);
  }

  exportToExcel(): void {
    if (this.loading || (this.activeView === 'alerts' && this.filteredAlerts.length === 0) ||
        (this.activeView === 'stock' && this.filteredStock.length === 0)) {
      console.warn('⚠️ No hay datos para exportar');
      return;
    }

    console.log('📊 Exportando a Excel...');
    this.loading = true;

    const exportFilter: any = {};

    if (this.selectedBranchId) {
      exportFilter.branchId = Number(this.selectedBranchId);
    }

    if (this.activeView === 'alerts') {
      exportFilter.alertLevel = this.selectedAlertLevel !== 'all' ? this.selectedAlertLevel : undefined;
    }

    const exportObservable = this.activeView === 'alerts'
      ? this.inventoryService.exportLowStockAlerts(exportFilter)
      : this.inventoryService.exportAllStock(exportFilter);

    exportObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const viewType = this.activeView === 'alerts' ? 'Alertas_Stock' : 'Existencias';
          const branchName = this.selectedBranchId
            ? `_${this.branches.find(b => b.id === Number(this.selectedBranchId))?.branchName || 'Sucursal'}`
            : '_Todas_Sucursales';
          const fecha = new Date().toISOString().split('T')[0];
          const fileName = `${viewType}${branchName}_${fecha}.xlsx`;

          saveAs(blob, fileName);
          console.log('✅ Archivo exportado:', fileName);
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error exportando:', error);
          this.loading = false;
        }
      });
  }

  refresh(): void {
    // ⭐ Invalidar cache al refrescar
    LowStockAlertsComponent.cache = null;

    if (this.activeView === 'alerts') {
      this.loadAlerts(true);
    } else {
      this.loadAllStock(true);
    }
  }
}
