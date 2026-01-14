import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movement-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movement-detail-modal.component.html'
})
export class MovementDetailModalComponent {
  @Input() movement: any;
  @Output() close = new EventEmitter<void>();

  getMovementTypeClass(type: string): string {
    const classes: any = {
      'purchase': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'sale': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      'adjustment': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'transfer': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'return': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return classes[type] || 'bg-slate-100 text-slate-700';
  }

  getMovementTypeLabel(type: string): string {
    const labels: any = {
      'purchase': 'Compra',
      'sale': 'Venta',
      'adjustment': 'Ajuste',
      'transfer': 'Transferencia',
      'return': 'Devolución'
    };
    return labels[type] || type;
  }

  isStockIncrease(movement: any): boolean {
    return movement.quantity > 0;
  }

  onClose(): void {
    this.close.emit();
  }
}
