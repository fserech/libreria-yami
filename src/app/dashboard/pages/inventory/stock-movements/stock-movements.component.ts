import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Product {
  hasVariants: any;
  variants: any;
  currentStock: number;
  salePrice: number;
  costPrice: number;
  active: unknown;
  productName: string;
  categoryId: any;
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  supplier: string;
  lastRestock: string;
  soldLastMonth: number;
}

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './stock-movements.component.html',
  styleUrl: './stock-movements.component.scss'
})
export class StockMovementsComponent {


}
