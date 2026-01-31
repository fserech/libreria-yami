import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StockMovement, ProductStock, MovementFilter, MovementType } from '../../../../shared/interfaces/inventory';
import { InventoryService } from '../../../../shared/services/inventory.service';
import { MovementDetailModalComponent } from '../Components/movement-detail-modal/movement-detail-modal.component';
import { AdjustmentModalComponent } from '../Components/adjustment-modal/adjustment-modal.component';
import { HeaderComponent } from "../../../../shared/components/header/header.component";
import { saveAs } from 'file-saver';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

export enum TimePeriod {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH'
}

// ⭐ Cache estático con TTL
interface CacheData {
  movements: StockMovement[];
  timestamp: number;
}

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MovementDetailModalComponent,
    AdjustmentModalComponent,
    HeaderComponent
  ],
  templateUrl: './stock-movements.component.html',
  styleUrl: './stock-movements.component.scss'
})
export class StockMovementsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  private static cache: CacheData | null = null;

  viewMode: 'table' | 'cards' = 'table';
  Math = Math;

  movements: StockMovement[] = [];
  filteredMovements: StockMovement[] = [];
  lowStockProducts: ProductStock[] = [];

  filter: MovementFilter = {};
  movementTypes = Object.values(MovementType);

  TimePeriod = TimePeriod;
  selectedPeriod: TimePeriod = TimePeriod.MONTH;

  loading = false;
  selectedMovement?: StockMovement;
  showAdjustmentModal = false;
  editingMovement?: StockMovement;

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  adjustmentModal: any;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.applyPeriodFilter(this.selectedPeriod);
    // ⭐ Cargar low stock en paralelo sin bloquear
    this.loadLowStockProductsAsync();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'table' ? 'cards' : 'table';
  }

  // ⭐ NUEVO: Método para obtener el nombre completo del producto (incluyendo variantes)
  getProductDisplayName(movement: StockMovement): string {
    if (!movement.product) {
      return 'Producto no disponible';
    }

    const baseProductName = movement.product.productName || 'Sin nombre';

    // Si tiene variantId, buscar la información de la variante
    if (movement.variantId && movement.product.variants) {
      const variant = movement.product.variants.find(v => v.id === movement.variantId);

      if (variant) {
        // Si la variante tiene un nombre específico, usarlo
        if (variant.variantName) {
          return variant.variantName;
        }

        // Si no, construir el nombre con los atributos
        if (variant.attributes && Object.keys(variant.attributes).length > 0) {
          const attributesStr = Object.entries(variant.attributes)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          return `${baseProductName} (${attributesStr})`;
        }
      }
    }

    // Si no tiene variante o no se encontró, retornar el nombre base
    return baseProductName;
  }

  // ⭐ NUEVO: Método para obtener el SKU (considerando variantes)
  getProductSKU(movement: StockMovement): string {
    if (!movement.product) {
      return 'N/A';
    }

    // Si tiene variantId, buscar el SKU de la variante
    if (movement.variantId && movement.product.variants) {
      const variant = movement.product.variants.find(v => v.id === movement.variantId);
      if (variant && variant.sku) {
        return variant.sku;
      }
    }

    // Si no tiene variante o no se encontró SKU, retornar el SKU del producto base
    return movement.product.sku || 'N/A';
  }

  // ⭐ NUEVO: Método para verificar si el movimiento es de una variante
  isVariantMovement(movement: StockMovement): boolean {
    return movement.variantId != null && movement.variantId !== undefined;
  }

  // ⭐ NUEVO: Método para obtener los atributos de la variante
  getVariantAttributes(movement: StockMovement): string {
    if (!movement.variantId || !movement.product?.variants) {
      return '';
    }

    const variant = movement.product.variants.find(v => v.id === movement.variantId);

    if (variant?.attributes && Object.keys(variant.attributes).length > 0) {
      return Object.entries(variant.attributes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ');
    }

    return '';
  }

  // ⭐ OPTIMIZACIÓN: Carga asíncrona en background
  private loadLowStockProductsAsync(): void {
    this.inventoryService.getLowStockProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.lowStockProducts = products;
        },
        error: (error) => {
          console.error('Error cargando productos con stock bajo:', error);
        }
      });
  }

  applyPeriodFilter(period: TimePeriod): void {
    this.selectedPeriod = period;
    this.currentPage = 1;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case TimePeriod.DAY:
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;

      case TimePeriod.WEEK:
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = new Date(today);
        startDate.setDate(today.getDate() - diffToMonday);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;

      case TimePeriod.MONTH:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    const formatDateString = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDateStr = formatDateString(startDate);
    const endDateStr = formatDateString(endDate);

    this.filter = {
      movementType: undefined,
      branchId: undefined,
      startDate: startDateStr,
      endDate: endDateStr
    };

    console.log('🔍 Filtrando período:', this.getPeriodLabel(period));
    console.log('📅 Desde:', startDateStr, 'Hasta:', endDateStr);

    this.loadMovements();
  }

  getPeriodLabel(period: TimePeriod): string {
    const labels = {
      [TimePeriod.DAY]: 'Hoy',
      [TimePeriod.WEEK]: 'Esta Semana',
      [TimePeriod.MONTH]: 'Este Mes'
    };
    return labels[period];
  }

  getPeriodDays(period: TimePeriod): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const descriptions = {
      [TimePeriod.DAY]: today.toLocaleDateString('es-GT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      [TimePeriod.WEEK]: 'Lunes a Hoy',
      [TimePeriod.MONTH]: today.toLocaleDateString('es-GT', {
        month: 'long',
        year: 'numeric'
      })
    };
    return descriptions[period];
  }

  // ⭐ OPTIMIZACIÓN: Filtro en memoria más eficiente
  private filterMovementsByDate(movements: StockMovement[]): StockMovement[] {
    if (!this.filter.startDate || !this.filter.endDate) {
      return movements;
    }

    const startTime = new Date(this.filter.startDate + 'T00:00:00').getTime();
    const endTime = new Date(this.filter.endDate + 'T23:59:59').getTime();

    return movements.filter(movement => {
      const movementTime = new Date(movement.dateCreated).getTime();
      return movementTime >= startTime && movementTime <= endTime;
    });
  }

  // ⭐ OPTIMIZACIÓN CRÍTICA: Uso de cache
  loadMovements(): void {
    this.loading = true;

    console.log('📡 Cargando movimientos...');
    console.log('📅 Período:', this.getPeriodLabel(this.selectedPeriod));

    // ⭐ Verificar cache
    const now = Date.now();
    const useCache = StockMovementsComponent.cache &&
                     (now - StockMovementsComponent.cache.timestamp) < StockMovementsComponent.CACHE_TTL;

    if (useCache && StockMovementsComponent.cache) {
      console.log('✅ Usando datos en cache');
      this.processMovements(StockMovementsComponent.cache.movements);
      return;
    }

    // ⭐ CRÍTICO: NO enviar fechas al backend
    const backendFilter: MovementFilter = {
      movementType: this.filter.movementType,
      branchId: this.filter.branchId,
      productId: this.filter.productId,
      userId: this.filter.userId
    };

    // ⭐ Solicitar más registros para filtrar localmente
    const limit = 1000;

    this.inventoryService.getMovements(backendFilter, 1, limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta del backend:', response.data.length, 'movimientos');
          console.log('📦 Productos simples:', response.data.filter(m => !m.variantId).length);
          console.log('🎨 Productos con variantes:', response.data.filter(m => m.variantId).length);

          // ⭐ Guardar en cache
          StockMovementsComponent.cache = {
            movements: response.data,
            timestamp: now
          };

          this.processMovements(response.data);
        },
        error: (error) => {
          this.loading = false;
          console.error('❌ Error cargando movimientos:', error);
        }
      });
  }

  // ⭐ OPTIMIZACIÓN: Procesamiento separado para mejor rendimiento
  private processMovements(allMovements: StockMovement[]): void {
    this.movements = allMovements;

    // ⭐ Filtrar por fechas
    let filtered = this.filterMovementsByDate(allMovements);

    // ⭐ Ordenar por fecha descendente (más reciente primero)
    filtered.sort((a, b) => {
      return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
    });

    // ⭐ Aplicar paginación
    this.totalItems = filtered.length;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredMovements = filtered.slice(start, end);

    this.loading = false;

    console.log('✅ Procesamiento completo:');
    console.log('   Total en BD:', allMovements.length);
    console.log('   Después de filtrar:', filtered.length);
    console.log('   En página actual:', this.filteredMovements.length);
    console.log('   Variantes en página:', this.filteredMovements.filter(m => m.variantId).length);
  }

  applyFilter(): void {
    this.currentPage = 1;
    console.log('🔍 Aplicando filtros adicionales');

    // ⭐ Si hay cache, usar procesamiento local
    if (StockMovementsComponent.cache) {
      this.processMovements(StockMovementsComponent.cache.movements);
    } else {
      this.loadMovements();
    }
  }

  clearFilter(): void {
    const currentStartDate = this.filter.startDate;
    const currentEndDate = this.filter.endDate;

    this.filter = {
      movementType: undefined,
      branchId: undefined,
      startDate: currentStartDate,
      endDate: currentEndDate
    };

    console.log('🧹 Filtros limpiados');
    this.applyFilter();
  }

  viewMovementDetail(movement: StockMovement): void {
    this.selectedMovement = movement;
  }

  canEditMovement(movement: StockMovement): boolean {
    return false;
  }

  editMovement(movement: StockMovement): void {
    return;
  }

  createNewAdjustment(): void {
    this.editingMovement = undefined;
    this.showAdjustmentModal = true;
  }

  handleAdjustmentSuccess(): void {
    this.showAdjustmentModal = false;
    this.editingMovement = undefined;

    // ⭐ Invalidar cache al hacer cambios
    StockMovementsComponent.cache = null;

    this.loadMovements();
    this.loadLowStockProductsAsync();
  }

  closeAdjustmentModal(): void {
    this.showAdjustmentModal = false;
    this.editingMovement = undefined;
  }

  async openAdjustmentModal(): Promise<void> {
    this.showAdjustmentModal = true;

    setTimeout(async () => {
      if (this.showAdjustmentModal) {
        await this.adjustmentModal?.refreshData();
      }
    }, 100);
  }

  getMovementTypeLabel(type: MovementType): string {
    const labels: Record<MovementType, string> = {
      [MovementType.PURCHASE]: 'Compra',
      [MovementType.SALE]: 'Venta',
      [MovementType.ADJUSTMENT]: 'Ajuste',
      [MovementType.RETURN_PURCHASE]: 'Devolución Compra',
      [MovementType.RETURN_SALE]: 'Devolución Venta',
      [MovementType.TRANSFER]: 'Transferencia',
      [MovementType.DAMAGE]: 'Daño',
      [MovementType.LOSS]: 'Pérdida'
    };
    return labels[type];
  }

  getMovementTypeClass(type: MovementType): string {
    const classes: Record<MovementType, string> = {
      [MovementType.PURCHASE]: 'badge-success',
      [MovementType.SALE]: 'badge-primary',
      [MovementType.ADJUSTMENT]: 'badge-warning',
      [MovementType.RETURN_PURCHASE]: 'badge-danger',
      [MovementType.RETURN_SALE]: 'badge-info',
      [MovementType.TRANSFER]: 'badge-secondary',
      [MovementType.DAMAGE]: 'badge-danger',
      [MovementType.LOSS]: 'badge-dark'
    };
    return classes[type];
  }

  isStockIncrease(movement: StockMovement): boolean {
    return movement.quantity > 0;
  }

  exportToExcel(): void {
    if (this.loading || this.filteredMovements.length === 0) {
      console.warn('⚠️ No hay datos para exportar');
      return;
    }

    console.log('📊 Exportando a Excel...');
    this.loading = true;

    this.inventoryService.exportMovements(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const period = this.getPeriodLabel(this.selectedPeriod).replace(/\s/g, '_');
          const fecha = new Date().toISOString().split('T')[0];
          const fileName = `Movimientos_Inventario_${period}_${fecha}.xlsx`;

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

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.currentPage++;

      // ⭐ Usar cache si está disponible
      if (StockMovementsComponent.cache) {
        this.processMovements(StockMovementsComponent.cache.movements);
      } else {
        this.loadMovements();
      }

      this.scrollToTop();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;

      // ⭐ Usar cache si está disponible
      if (StockMovementsComponent.cache) {
        this.processMovements(StockMovementsComponent.cache.movements);
      } else {
        this.loadMovements();
      }

      this.scrollToTop();
    }
  }

  firstPage(): void {
    this.currentPage = 1;

    // ⭐ Usar cache si está disponible
    if (StockMovementsComponent.cache) {
      this.processMovements(StockMovementsComponent.cache.movements);
    } else {
      this.loadMovements();
    }

    this.scrollToTop();
  }

  lastPage(): void {
    this.currentPage = Math.ceil(this.totalItems / this.itemsPerPage);

    // ⭐ Usar cache si está disponible
    if (StockMovementsComponent.cache) {
      this.processMovements(StockMovementsComponent.cache.movements);
    } else {
      this.loadMovements();
    }

    this.scrollToTop();
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
