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

  // NUEVA: Vista activa
  activeView: 'alerts' | 'stock' = 'alerts';

  // Datos
  alerts: ProductStock[] = [];
  allStock: ProductStock[] = []; // NUEVO: Todos los productos
  filteredAlerts: ProductStock[] = [];
  filteredStock: ProductStock[] = []; // NUEVO: Productos filtrados
  branches: Array<{id: number, branchName: string}> = [];

  // Filtros
  selectedBranchId: string = '';
  selectedAlertLevel: string = 'all';
  searchTerm: string = ''; // NUEVO: Búsqueda por nombre/SKU

  // UI
  loading = false;
  viewMode: 'table' | 'cards' = 'table';

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Usuario actual
  user: any;

  // Modal de ajuste
  showAdjustmentModal = false;
  editingMovement: any;

  // Estadísticas calculadas
  get totalAlertsCount(): number {
    return this.filteredAlerts.length;
  }

  get criticalCount(): number {
    return this.filteredAlerts.filter(a => a.currentStock === 0).length;
  }

  get warningCount(): number {
    return this.filteredAlerts.filter(a => a.currentStock > 0 && a.belowMinStock).length;
  }

  // NUEVO: Estadísticas de existencias
  get totalProducts(): number {
    return this.filteredStock.length;
  }

  get totalStockValue(): number {
    return this.filteredStock.reduce((sum, item) =>
      sum + (item.currentStock * (item.averageCost || 0)), 0
    );
  }

  // Alertas/Stock paginados
  get paginatedItems(): ProductStock[] {
    const items = this.activeView === 'alerts' ? this.filteredAlerts : this.filteredStock;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return items.slice(startIndex, endIndex);
  }

  // Índices para mostrar
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
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
    this.loadAllStock(); // NUEVO: Cargar todos los productos
  }

  // NUEVO: Cambiar vista
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

  // NUEVO: Cargar todas las existencias
  loadAllStock(forceReload: boolean = false): void {
    this.loading = true;
    const branchId = this.selectedBranchId ? Number(this.selectedBranchId) : undefined;

    this.inventoryService.getAllProductStock(branchId)
      .subscribe({
        next: (products: ProductStock[]) => {
          this.allStock = products;
          this.applyStockFilters();
          this.loading = false;

          if (forceReload) {
            console.log('Existencias recargadas:', products.length);
          }
        },
        error: (error) => {
          console.error('Error al cargar existencias:', error);
          this.loading = false;
        }
      });
  }

  // NUEVO: Aplicar filtros a existencias
  applyStockFilters(): void {
    this.filteredStock = this.allStock.filter(item => {
      // Filtro por búsqueda
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const productName = this.getDisplayName(item).toLowerCase();
        const sku = this.getDisplaySKU(item).toLowerCase();

        if (!productName.includes(searchLower) && !sku.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });

    // Ordenar por nombre
    this.filteredStock.sort((a, b) =>
      this.getDisplayName(a).localeCompare(this.getDisplayName(b))
    );

    this.totalPages = Math.ceil(this.filteredStock.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  // NUEVO: Método para búsqueda
  onSearchChange(): void {
    this.applyStockFilters();
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
          this.extractBranches();
          this.applyFilters();
          this.loading = false;

          if (forceReload) {
            console.log('Alertas recargadas exitosamente:', products.length);
          }
        },
        error: (error) => {
          console.error('Error al cargar productos con stock bajo:', error);
          this.loading = false;
        }
      });
  }

  private extractBranches(): void {
    const branchMap = new Map<number, string>();

    // Extraer de alertas
    this.alerts.forEach(alert => {
      if (alert.branchId && alert.branchName) {
        branchMap.set(alert.branchId, alert.branchName);
      }
    });

    // Extraer de existencias
    this.allStock.forEach(item => {
      if (item.branchId && item.branchName) {
        branchMap.set(item.branchId, item.branchName);
      }
    });

    this.branches = Array.from(branchMap.entries()).map(([id, name]) => ({
      id,
      branchName: name
    }));
  }

  applyFilters(): void {
    this.filteredAlerts = this.alerts.filter(alert => {
      if (this.selectedAlertLevel === 'critical' && alert.currentStock > 0) {
        return false;
      }
      if (this.selectedAlertLevel === 'warning' && (alert.currentStock === 0 || !alert.belowMinStock)) {
        return false;
      }
      return true;
    });

    // Ordenar: primero críticos, luego advertencias
    this.filteredAlerts.sort((a, b) => {
      if (a.currentStock === 0 && b.currentStock > 0) return -1;
      if (a.currentStock > 0 && b.currentStock === 0) return 1;
      return a.currentStock - b.currentStock;
    });

    this.totalPages = Math.ceil(this.filteredAlerts.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  onBranchChange(): void {
    this.loadAlerts();
    this.loadAllStock();
  }

  onAlertLevelChange(): void {
    this.applyFilters();
  }

  // Métodos de paginación
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

  // NUEVO: Obtener estado del stock
  getStockStatus(item: ProductStock): 'critical' | 'warning' | 'good' | 'excess' {
    if (item.currentStock === 0) return 'critical';
    if (item.belowMinStock) return 'warning';
    if (item.currentStock > item.maxStock) return 'excess';
    return 'good';
  }

  // NUEVO: Clase CSS según estado
  getStockStatusClass(item: ProductStock): string {
    const status = this.getStockStatus(item);
    switch (status) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'excess': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-green-600 dark:text-green-400';
    }
  }

  // ==================== MÉTODOS PARA VARIANTES ====================

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

  // ==================== MÉTODOS ORIGINALES ====================

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
      ? this.filteredAlerts.map(alert => ({
          'Tipo': this.getTypeBadge(alert),
          'Producto': this.getDisplayName(alert),
          'SKU': this.getDisplaySKU(alert),
          'Atributos': this.getVariantAttributes(alert),
          'Sucursal': alert.branchName || 'N/A',
          'Stock Actual': alert.currentStock,
          'Stock Mínimo': alert.minStock,
          'Stock Máximo': alert.maxStock,
          'Nivel': this.getAlertLevel(alert) === 'critical' ? 'CRÍTICO' : 'ADVERTENCIA',
          'Costo Promedio': alert.averageCost
        }))
      : this.filteredStock.map(item => ({
          'Tipo': this.getTypeBadge(item),
          'Producto': this.getDisplayName(item),
          'SKU': this.getDisplaySKU(item),
          'Atributos': this.getVariantAttributes(item),
          'Sucursal': item.branchName || 'N/A',
          'Stock Actual': item.currentStock,
          'Stock Mínimo': item.minStock,
          'Stock Máximo': item.maxStock,
          'Estado': this.getStockStatus(item).toUpperCase(),
          'Costo Promedio': item.averageCost,
          'Valor Total': item.currentStock * (item.averageCost || 0)
        }));

    console.log('Exportando a Excel:', data);
  }

  refresh(): void {
    if (this.activeView === 'alerts') {
      this.loadAlerts(true);
    } else {
      this.loadAllStock(true);
    }
  }
}
