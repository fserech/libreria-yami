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
import { saveAs } from 'file-saver';
import { ViewModeComponent, StockItem, ViewMode, ActiveView } from '../Components/view-mode/view-mode.component';

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
export class LowStockAlertsComponent implements OnInit {
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

  get totalAlertsCount(): number {
    return this.filteredAlerts.length;
  }

  get criticalCount(): number {
    // 🔴 CRÍTICO: Solo productos con stock = 0
    return this.filteredAlerts.filter(a => a.currentStock === 0).length;
  }

  get warningCount(): number {
    // 🟡 ADVERTENCIA: Productos con stock bajo pero > 0
    return this.filteredAlerts.filter(a => a.currentStock > 0).length;
  }

  get totalProducts(): number {
    const uniqueProducts = new Set<number>();
    this.filteredStock.forEach(item => {
      uniqueProducts.add(item.productId);
    });
    return uniqueProducts.size;
  }

  get totalStockValue(): number {
    return this.filteredStock.reduce((sum, item) => {
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

  // ⭐ MÉTODO AUXILIAR: Determina si un producto tiene stock bajo
  private hasLowStock(item: ProductStock): boolean {
    const isBelowMin = item.currentStock < item.minStock;
    const isNearMin = item.currentStock <= (item.minStock * 1.2); // 20% sobre el mínimo
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

  // ⭐ MODIFICADO: Filtra productos con stock bajo al cargar
  private loadInitialData(): void {
    forkJoin({
      alerts: this.inventoryService.getLowStockProducts(),
      stock: this.inventoryService.getAllProductStock()
    }).subscribe({
      next: (results) => {
        // ⭐ FILTRO: Solo productos que realmente tienen stock bajo
        this.alerts = results.alerts.filter(p => this.hasLowStock(p));
        this.allStock = results.stock;

        console.log('📊 Datos iniciales cargados:', {
          alertasBackend: results.alerts.length,
          alertasFiltradas: this.alerts.length,
          stock: this.allStock.length,
          criticas: this.alerts.filter(a => a.currentStock === 0).length,
          advertencias: this.alerts.filter(a => a.currentStock > 0).length
        });

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

  switchView(view: ActiveView): void {
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
        const stockItem = this.convertToStockItem(item);
        const productName = (stockItem.variantName || stockItem.productName || '').toLowerCase();
        const sku = stockItem.sku.toLowerCase();

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

    this.filteredStock.sort((a, b) => {
      const nameA = this.convertToStockItem(a).variantName || this.convertToStockItem(a).productName || '';
      const nameB = this.convertToStockItem(b).variantName || this.convertToStockItem(b).productName || '';
      return nameA.localeCompare(nameB);
    });

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

  // ⭐ MODIFICADO: Filtra productos con stock bajo al cargar
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
          // ⭐ FILTRO: Solo productos que realmente tienen stock bajo
          this.alerts = products.filter(p => this.hasLowStock(p));

          console.log('📊 Alertas recargadas:', {
            backend: products.length,
            filtradas: this.alerts.length,
            criticas: this.alerts.filter(a => a.currentStock === 0).length,
            advertencias: this.alerts.filter(a => a.currentStock > 0).length
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

  // ⭐ MODIFICADO: Aplica filtros adicionales sobre alertas ya filtradas
  applyFilters(): void {
    this.filteredAlerts = this.alerts.filter(alert => {
      // Ya sabemos que todos tienen stock bajo, ahora aplicar filtros de UI

      // Filtro por nivel de alerta (crítico/advertencia)
      if (this.selectedAlertLevel === 'critical') {
        // 🔴 CRÍTICO: Solo stock = 0
        if (alert.currentStock !== 0) return false;
      }

      if (this.selectedAlertLevel === 'warning') {
        // 🟡 ADVERTENCIA: Solo stock bajo pero > 0
        if (alert.currentStock === 0) return false;
      }

      // Filtro por búsqueda
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const stockItem = this.convertToStockItem(alert);
        const productName = (stockItem.variantName || stockItem.productName || '').toLowerCase();
        const sku = stockItem.sku.toLowerCase();

        if (!productName.includes(searchLower) && !sku.includes(searchLower)) {
          return false;
        }
      }

      // Filtro por sucursal
      if (this.selectedBranchId && this.selectedBranchId !== '') {
        if (alert.branchId !== Number(this.selectedBranchId)) {
          return false;
        }
      }

      return true;
    });

    // Ordenar: críticos primero (stock = 0), luego por cantidad ascendente
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
    if (this.loading || (this.activeView === 'alerts' && this.filteredAlerts.length === 0) ||
        (this.activeView === 'stock' && this.filteredStock.length === 0)) {
      console.warn('⚠️ No hay datos para exportar');
      return;
    }

    console.log('📊 ========================================');
    console.log('📊 Exportando a Excel...');
    console.log('📅 Vista:', this.activeView === 'alerts' ? 'Alertas' : 'Existencias');
    console.log('📄 Registros:', this.activeView === 'alerts' ? this.filteredAlerts.length : this.filteredStock.length);
    console.log('🔍 Sucursal:', this.selectedBranchId || 'Todas');

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

    exportObservable.subscribe({
      next: (blob) => {
        const viewType = this.activeView === 'alerts' ? 'Alertas_Stock' : 'Existencias';
        const branchName = this.selectedBranchId
          ? `_${this.branches.find(b => b.id === Number(this.selectedBranchId))?.branchName || 'Sucursal'}`
          : '_Todas_Sucursales';
        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `${viewType}${branchName}_${fecha}.xlsx`;

        saveAs(blob, fileName);

        console.log('✅ Archivo exportado:', fileName);
        console.log('📊 ========================================');
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error exportando a Excel:', error);
        console.error('   Detalles:', error.error);
        console.log('📊 ========================================');
        this.loading = false;
      }
    });
  }

  refresh(): void {
    if (this.activeView === 'alerts') {
      this.loadAlerts(true);
    } else {
      this.loadAllStock(true);
    }
  }
}
