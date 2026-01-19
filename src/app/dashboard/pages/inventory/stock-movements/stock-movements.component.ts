import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StockMovement, ProductStock, MovementFilter, MovementType } from '../../../../shared/interfaces/inventory';
import { InventoryService } from '../../../../shared/services/inventory.service';
import { MovementDetailModalComponent } from '../Components/movement-detail-modal/movement-detail-modal.component';
import { AdjustmentModalComponent } from '../Components/adjustment-modal/adjustment-modal.component';
import { HeaderComponent } from "../../../../shared/components/header/header.component";
import { saveAs } from 'file-saver';

// ⭐ NUEVO: Enum para períodos
export enum TimePeriod {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH'
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
export class StockMovementsComponent implements OnInit {

   viewMode: 'table' | 'cards' = 'table';
  Math = Math;

  movements: StockMovement[] = [];
  filteredMovements: StockMovement[] = [];
  lowStockProducts: ProductStock[] = [];

  filter: MovementFilter = {};
  movementTypes = Object.values(MovementType);

  // ⭐ NUEVO: Control de períodos
  TimePeriod = TimePeriod;
  selectedPeriod: TimePeriod = TimePeriod.MONTH; // ⭐ Default: MES

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
    // ⭐ Inicia con el período por defecto (MES)
    this.applyPeriodFilter(this.selectedPeriod);
    this.loadLowStockProducts();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'table' ? 'cards' : 'table';
  }

  // ⭐ NUEVO: Aplicar filtro de período (CÓDIGO CORREGIDO)
  applyPeriodFilter(period: TimePeriod): void {
    this.selectedPeriod = period;
    this.currentPage = 1;

    // ⭐ CRÍTICO: Obtener la fecha actual del sistema
    const now = new Date();

    // ⭐ NUEVO: Resetear a medianoche para asegurar fecha correcta
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case TimePeriod.DAY:
        // ⭐ HOY: Solo el día actual (00:00:00 a 23:59:59)
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;

      case TimePeriod.WEEK:
        // ⭐ ESTA SEMANA: Desde el lunes hasta hoy
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = new Date(today);
        startDate.setDate(today.getDate() - diffToMonday);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;

      case TimePeriod.MONTH:
        // ⭐ ESTE MES: Desde el día 1 hasta hoy
        startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    // ⭐ CRÍTICO: Formatear fechas en formato ISO (YYYY-MM-DD)
    const formatDateString = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDateStr = formatDateString(startDate);
    const endDateStr = formatDateString(endDate);

    // ⭐ CRÍTICO: Limpiar filtros anteriores y establecer SOLO las fechas del período
    this.filter = {
      movementType: undefined,
      branchId: undefined,
      startDate: startDateStr,
      endDate: endDateStr
    };

    console.log('🔍 ========================================');
    console.log('🔍 Filtrando período:', this.getPeriodLabel(period));
    console.log('📅 Fecha actual del sistema:', now.toLocaleString('es-GT'));
    console.log('📅 Desde:', startDateStr, '→', startDate.toLocaleString('es-GT'));
    console.log('📅 Hasta:', endDateStr, '→', endDate.toLocaleString('es-GT'));
    console.log('🔍 ========================================');

    this.loadMovements();
  }

  // ⭐ NUEVO: Obtener label del período
  getPeriodLabel(period: TimePeriod): string {
    const labels = {
      [TimePeriod.DAY]: 'Hoy',
      [TimePeriod.WEEK]: 'Esta Semana',
      [TimePeriod.MONTH]: 'Este Mes'
    };
    return labels[period];
  }

  // ⭐ NUEVO: Obtener descripción del período (MEJORADO)
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

  // ⭐ NUEVO: Filtrar movimientos por fecha en el frontend
  private filterMovementsByDate(movements: StockMovement[]): StockMovement[] {
    if (!this.filter.startDate || !this.filter.endDate) {
      return movements;
    }

    // Crear fechas de inicio y fin del rango
    const startDate = new Date(this.filter.startDate + 'T00:00:00');
    const endDate = new Date(this.filter.endDate + 'T23:59:59');

    console.log('🔍 Filtrando movimientos en frontend:');
    console.log('   - Rango: ', startDate.toLocaleString('es-GT'), 'a', endDate.toLocaleString('es-GT'));

    // Filtrar movimientos que estén dentro del rango
    const filtered = movements.filter(movement => {
      const movementDate = new Date(movement.dateCreated);
      const isInRange = movementDate >= startDate && movementDate <= endDate;

      if (!isInRange) {
        console.log('   ❌ Excluido:', movement.dateCreated, '→', movementDate.toLocaleString('es-GT'));
      }

      return isInRange;
    });

    console.log('   ✅ Movimientos válidos:', filtered.length, 'de', movements.length);
    return filtered;
  }

  loadMovements(): void {
    this.loading = true;

    console.log('📡 ========================================');
    console.log('📡 Cargando movimientos...');
    console.log('📅 Período seleccionado:', this.getPeriodLabel(this.selectedPeriod));
    console.log('🔍 Filtro completo:', JSON.stringify(this.filter, null, 2));
    console.log('📄 Página:', this.currentPage, '| Items por página:', this.itemsPerPage);

    this.inventoryService.getMovements(this.filter, this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.movements = response.data;

          // ⭐ CRÍTICO: Filtrar en el frontend por las fechas correctas
          this.filteredMovements = this.filterMovementsByDate(response.data);
          this.totalItems = this.filteredMovements.length;
          this.loading = false;

          console.log('✅ Respuesta recibida:');
          console.log('   - Movimientos del backend:', response.data.length);
          console.log('   - Movimientos después del filtro:', this.filteredMovements.length);
          console.log('   - Total items:', this.totalItems);

          // ⭐ Verificar fechas de los movimientos filtrados
          if (this.filteredMovements.length > 0) {
            const firstDate = new Date(this.filteredMovements[0].dateCreated);
            const lastDate = new Date(this.filteredMovements[this.filteredMovements.length - 1].dateCreated);
            console.log('   - Primera fecha:', firstDate.toLocaleDateString('es-GT'));
            console.log('   - Última fecha:', lastDate.toLocaleDateString('es-GT'));
            console.log('   - Fecha esperada:', new Date().toLocaleDateString('es-GT'));
          } else {
            console.log('⚠️ No se encontraron movimientos para:', this.getPeriodLabel(this.selectedPeriod));
          }

          console.log('📡 ========================================');
        },
        error: (error) => {
          this.loading = false;
          console.error('❌ Error cargando movimientos:', error);
        }
      });
  }

  loadLowStockProducts(): void {
    this.inventoryService.getLowStockProducts()
      .subscribe({
        next: (products) => {
          this.lowStockProducts = products;
        },
        error: (error) => {
          console.error('Error cargando productos con stock bajo:', error);
        }
      });
  }

  applyFilter(): void {
    // ⭐ Al aplicar filtro manual, mantener las fechas del período seleccionado
    this.currentPage = 1;
    console.log('🔍 Aplicando filtros adicionales:', this.filter);
    this.loadMovements();
  }

  clearFilter(): void {
    // ⭐ Limpiar solo filtros adicionales, mantener las fechas del período
    const currentStartDate = this.filter.startDate;
    const currentEndDate = this.filter.endDate;

    this.filter = {
      movementType: undefined,
      branchId: undefined,
      startDate: currentStartDate,
      endDate: currentEndDate
    };

    console.log('🧹 Filtros limpiados, fechas del período mantenidas');
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
    this.loadMovements();
    this.loadLowStockProducts();
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

  console.log('📊 ========================================');
  console.log('📊 Exportando a Excel...');
  console.log('📅 Período:', this.getPeriodLabel(this.selectedPeriod));
  console.log('📄 Registros:', this.filteredMovements.length);
  console.log('🔍 Filtros:', this.filter);

  this.loading = true;

  this.inventoryService.exportMovements(this.filter)
    .subscribe({
      next: (blob) => {
        // Generar nombre de archivo descriptivo
        const period = this.getPeriodLabel(this.selectedPeriod).replace(/\s/g, '_');
        const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const fileName = `Movimientos_Inventario_${period}_${fecha}.xlsx`;

        // Descargar archivo
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

        // Aquí puedes agregar un toast de error
        // this.toast.error('Error al exportar el archivo');
      }
    });
}

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.currentPage++;
      this.loadMovements();
      this.scrollToTop();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMovements();
      this.scrollToTop();
    }
  }

  firstPage(): void {
    this.currentPage = 1;
    this.loadMovements();
    this.scrollToTop();
  }

  lastPage(): void {
    this.currentPage = Math.ceil(this.totalItems / this.itemsPerPage);
    this.loadMovements();
    this.scrollToTop();
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
