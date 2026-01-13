import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StockMovement, ProductStock, MovementFilter, MovementType } from '../../../../shared/interfaces/inventory';
import { InventoryService } from '../../../../shared/services/inventory.service';


@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './stock-movements.component.html',
  styleUrl: './stock-movements.component.scss'
})
export class StockMovementsComponent implements OnInit {
    Math = Math;

  // Datos
  movements: StockMovement[] = [];
  filteredMovements: StockMovement[] = [];
  lowStockProducts: ProductStock[] = [];

  // Filtros
  filter: MovementFilter = {};
  movementTypes = Object.values(MovementType);

  // UI
  loading = false;
  selectedMovement?: StockMovement;
  showAdjustmentModal = false;

  // Paginación
  currentPage = 1;
  itemsPerPage = 20;
  totalItems = 0;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadMovements();
    this.loadLowStockProducts();
  }

  loadMovements(): void {
    this.loading = true;
    this.inventoryService.getMovements(this.filter, this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.movements = response.data;
          this.filteredMovements = response.data;
          this.totalItems = response.total;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading movements:', error);
          this.loading = false;
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
          console.error('Error loading low stock products:', error);
        }
      });
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadMovements();
  }

  clearFilter(): void {
    this.filter = {};
    this.applyFilter();
  }

  viewMovementDetail(movement: StockMovement): void {
    this.selectedMovement = movement;
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
    // Implementar exportación
    this.inventoryService.exportMovements(this.filter)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `movimientos-inventario-${new Date().toISOString()}.xlsx`;
          a.click();
        },
        error: (error) => {
          console.error('Error exporting:', error);
        }
      });
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.currentPage++;
      this.loadMovements();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMovements();
    }
  }
}
