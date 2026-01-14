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
  matCheckCircleOutline
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

@Component({
  selector: 'app-low-stock-alerts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIcon,
    NgClass
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
      bootstrapChevronLeft,
      bootstrapChevronRight,
      bootstrapChevronBarLeft,
      bootstrapChevronBarRight
    })
  ]
})
export class LowStockAlertsComponent implements OnInit {
  Math = Math;

  // Datos
  alerts: ProductStock[] = [];
  filteredAlerts: ProductStock[] = [];
  branches: Array<{id: number, branchName: string}> = [];

  // Filtros
  selectedBranchId: string = '';
  selectedAlertLevel: string = 'all';

  // UI
  loading = false;
  viewMode: 'table' | 'cards' = 'table';

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Usuario actual (para roles y permisos si es necesario)
  user: any;

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

  // Alertas paginadas
  get paginatedAlerts(): ProductStock[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAlerts.slice(startIndex, endIndex);
  }

  // Índices para mostrar (igual que categorías)
  get startIndex(): number {
    return this.filteredAlerts.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.filteredAlerts.length ? this.filteredAlerts.length : end;
  }

  get totalItems(): number {
    return this.filteredAlerts.length;
  }

  // Variables para compatibilidad con template de categorías
  get page(): number {
    return this.currentPage;
  }

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private auth: AuthService
  ) {
    // Obtener usuario actual

  }

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;
    const branchId = this.selectedBranchId ? Number(this.selectedBranchId) : undefined;

    this.inventoryService.getLowStockProducts(branchId)
      .subscribe({
        next: (products: ProductStock[]) => {
          this.alerts = products;
          this.extractBranches();
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar productos con stock bajo:', error);
          this.loading = false;
        }
      });
  }

  private extractBranches(): void {
    const branchMap = new Map<number, string>();
    this.alerts.forEach(alert => {
      if (alert.branchId && alert.branchName) {
        branchMap.set(alert.branchId, alert.branchName);
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

    // Calcular páginas y resetear a página 1
    this.totalPages = Math.ceil(this.filteredAlerts.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  onBranchChange(): void {
    this.loadAlerts();
  }

  onAlertLevelChange(): void {
    this.applyFilters();
  }

  // Métodos de paginación (igual que categorías)
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

  // Métodos de utilidad
  getAlertLevel(alert: ProductStock): 'critical' | 'warning' | 'normal' {
    if (alert.currentStock === 0) return 'critical';
    if (alert.belowMinStock) return 'warning';
    return 'normal';
  }

  getAlertIcon(level: 'critical' | 'warning' | 'normal'): string {
    switch (level) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      default: return '🟢';
    }
  }

  getAlertLabel(level: 'critical' | 'warning' | 'normal'): string {
    switch (level) {
      case 'critical': return 'CRÍTICO - Stock Agotado';
      case 'warning': return 'ADVERTENCIA - Stock Bajo';
      default: return 'Normal';
    }
  }

  getStockPercentage(alert: ProductStock): number {
    if (alert.maxStock === 0) return 0;
    return Math.min(100, (alert.currentStock / alert.maxStock) * 100);
  }

  getDaysUntilStockout(alert: ProductStock): number {
    if (alert.currentStock === 0) return 0;
    const avgConsumption = 2;
    return Math.floor(alert.currentStock / avgConsumption);
  }

  getAverageDailyConsumption(): number {
    return 2;
  }

  // Navegación
  viewProductHistory(alert: ProductStock): void {
    this.router.navigate(['/dashboard/inventory/movements'], {
      queryParams: { productId: alert.productId }
    });
  }

  createPurchaseOrder(alert: ProductStock): void {
    this.router.navigate(['/dashboard/purchases/create'], {
      queryParams: { productId: alert.productId }
    });
  }

  adjustStock(alert: ProductStock): void {
    this.router.navigate(['/dashboard/inventory/movements'], {
      queryParams: { adjust: true, productId: alert.productId }
    });
  }

  // Exportar a Excel
  exportToExcel(): void {
    const data = this.filteredAlerts.map(alert => ({
      'Producto': alert.product?.productName || 'N/A',
      'SKU': alert.product?.sku || 'N/A',
      'Sucursal': alert.branchName || 'N/A',
      'Stock Actual': alert.currentStock,
      'Stock Mínimo': alert.minStock,
      'Stock Máximo': alert.maxStock,
      'Nivel': this.getAlertLevel(alert) === 'critical' ? 'CRÍTICO' : 'ADVERTENCIA',
      'Costo Promedio': alert.averageCost,
      'Última Venta': alert.lastSaleDate || 'N/A',
      'Última Reposición': alert.lastRestockDate || 'N/A'
    }));

    // Implementar exportación real usando xlsx si es necesario
    console.log('Exportando a Excel:', data);
  }

  refresh(): void {
    this.loadAlerts();
  }
}
