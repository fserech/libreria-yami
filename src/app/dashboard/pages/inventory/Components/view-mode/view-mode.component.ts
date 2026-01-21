import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matViewListOutline,
  matGridViewOutline,
  matEditOutline,
  matAddShoppingCartOutline
} from '@ng-icons/material-icons/outline';

// Interfaces
export interface StockItem {
  id: string;
  productId?: string;
  variantId?: string;
  productName?: string;
  variantName?: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  branchName: string;
  branchId: string;
  attributes?: { [key: string]: string };
}

export type ViewMode = 'table' | 'cards';
export type ActiveView = 'alerts' | 'stock';
export type StockStatus = 'critical' | 'warning' | 'good' | 'excess';
export type AlertLevel = 'critical' | 'warning';

@Component({
  selector: 'app-view-mode',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      matViewListOutline,
      matGridViewOutline,
      matEditOutline,
      matAddShoppingCartOutline
    })
  ],
  templateUrl: './view-mode.component.html',
  styleUrl: './view-mode.component.scss'
})
export class ViewModeComponent implements OnChanges {
  @Input() items: StockItem[] = [];
  @Input() activeView: ActiveView = 'alerts';
  @Input() viewMode: ViewMode = 'table';

  @Output() onAdjustStock = new EventEmitter<StockItem>();
  @Output() onCreatePurchaseOrder = new EventEmitter<StockItem>();
  @Output() onViewModeChange = new EventEmitter<ViewMode>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.items.length > 0) {
      console.log('🔍 ViewMode recibió items:', this.items.length);
      console.log('📊 Primer item:', {
        sku: this.items[0]?.sku,
        current: this.items[0]?.currentStock,
        min: this.items[0]?.minStock,
        max: this.items[0]?.maxStock,
        percentage: this.getStockPercentage(this.items[0])
      });
    }
  }

  switchViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.onViewModeChange.emit(mode);
  }

  isVariant(item: StockItem): boolean {
    return !!item.variantId;
  }

  getDisplayName(item: StockItem): string {
    if (this.isVariant(item)) {
      return item.variantName || item.productName || 'Sin nombre';
    }
    return item.productName || 'Sin nombre';
  }

  getDisplaySKU(item: StockItem): string {
    return item.sku || 'N/A';
  }

  getVariantAttributes(item: StockItem): string {
    if (!item.attributes || Object.keys(item.attributes).length === 0) {
      return '';
    }

    return Object.entries(item.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' • ');
  }

  getTypeBadge(item: StockItem): string {
    return this.isVariant(item) ? 'Variante' : 'Producto';
  }

  getTypeBadgeClass(item: StockItem): string {
    if (this.isVariant(item)) {
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    }
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  }

  getStockStatus(item: StockItem): StockStatus {
    const { currentStock, minStock, maxStock } = item;

    // Crítico: stock actual es 0 o está por debajo del mínimo
    if (currentStock === 0 || currentStock < minStock) {
      return 'critical';
    }

    // Advertencia: está cerca del mínimo (dentro del 20% por encima del mínimo)
    const warningThreshold = minStock * 1.2;
    if (currentStock <= warningThreshold) {
      return 'warning';
    }

    // Exceso: está por encima del máximo
    if (currentStock > maxStock) {
      return 'excess';
    }

    // Bien: está dentro del rango óptimo
    return 'good';
  }

  getAlertLevel(item: StockItem): AlertLevel {
    const { currentStock, minStock } = item;

    if (currentStock === 0 || currentStock < minStock) {
      return 'critical';
    }

    return 'warning';
  }

  /**
   * 🎯 MÉTODO CLAVE: Calcula el porcentaje de stock basado en el rango min-max
   *
   * Para ALERTAS (stock bajo):
   * - Si currentStock < minStock: muestra % basado en qué tan cerca está de 0
   * - Permite ver visualmente qué tan crítico es el nivel
   *
   * Para EXISTENCIAS normales:
   * - Muestra el % dentro del rango min-max
   */
  getStockPercentage(item: StockItem): number {
    if (!item) {
      console.warn('⚠️ getStockPercentage: item es undefined');
      return 0;
    }

    const { currentStock, minStock, maxStock } = item;

    // Validar que los valores existan
    if (currentStock === undefined || minStock === undefined || maxStock === undefined) {
      console.warn('⚠️ Valores undefined:', { currentStock, minStock, maxStock });
      return 0;
    }

    // ⭐ CASO ESPECIAL: Stock es 0
    if (currentStock === 0) {
      return 0;
    }

    // Si min y max son iguales
    if (maxStock === minStock) {
      return currentStock >= minStock ? 100 : (currentStock / minStock) * 100;
    }

    // ⭐ NUEVO: Si el stock está por debajo del mínimo (caso de alertas)
    if (currentStock < minStock) {
      // Mostrar el porcentaje relativo al mínimo
      // Ejemplo: si min=20 y current=15, mostrar 75% (15/20)
      const percentageOfMin = (currentStock / minStock) * 100;
      return Math.max(0, Math.min(100, percentageOfMin));
    }

    // CASO NORMAL: Stock dentro o por encima del rango
    const range = maxStock - minStock;
    const current = currentStock - minStock;
    const percentage = (current / range) * 100;

    // Limitar entre 0 y 150% (puede exceder si hay sobrestock)
    const finalPercentage = Math.max(0, Math.min(150, percentage));

    // Debug solo para el primer item
    if (item.id === this.items[0]?.id) {
      console.log('📊 Cálculo de porcentaje:', {
        sku: item.sku,
        currentStock,
        minStock,
        maxStock,
        isBelowMin: currentStock < minStock,
        range,
        current,
        rawPercentage: percentage,
        finalPercentage
      });
    }

    return finalPercentage;
  }

  getStockStatusClass(item: StockItem): string {
    const status = this.getStockStatus(item);

    switch (status) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'excess':
        return 'text-orange-600 dark:text-orange-400';
      case 'good':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-slate-700 dark:text-slate-300';
    }
  }

  /**
   * 🎨 Obtiene la clase CSS apropiada para la barra de progreso
   * Funciona tanto en alertas como en existencias generales
   */
  getProgressBarClass(item: StockItem): string {
    const status = this.getStockStatus(item);

    // Para vista de alertas, usar rojo o amarillo según criticidad
    if (this.activeView === 'alerts') {
      const alertLevel = this.getAlertLevel(item);
      return alertLevel === 'critical' ? 'bg-red-500' : 'bg-yellow-500';
    }

    // Para vista de existencias, usar colores según el estado
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'excess':
        return 'bg-orange-500';
      case 'good':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
    }
  }

  adjustStock(item: StockItem): void {
    this.onAdjustStock.emit(item);
  }

  createPurchaseOrder(item: StockItem): void {
    this.onCreatePurchaseOrder.emit(item);
  }
}
