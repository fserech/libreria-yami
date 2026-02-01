import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';  // ✅ Agregar RouterLink
import { HttpClient } from '@angular/common/http';
import {
  LucideAngularModule,
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  Filter,
  TrendingUp,
  BarChart3,
  Download,
  Grid,
  List
} from 'lucide-angular';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ToastService } from '../../../shared/services/toast.service';
import { URL_PRODUCTS } from '../../../shared/constants/endpoints';
import { firstValueFrom } from 'rxjs';
import { provideIcons } from '@ng-icons/core';
import { matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline, matDeleteOutline, matEditOutline, matFilterAltOutline, matSearchOutline } from '@ng-icons/material-icons/outline';
import { bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight } from '@ng-icons/bootstrap-icons';
import { environment } from '../../../../environments/environment';

// Interfaz unificada para el inventario
interface InventoryItem {
  id: string;
  productId: number;
  variantId?: number;
  sku: string;
  name: string;
  description: string;
  categoryName: string;
  brandName: string;
  supplierNames: string[];
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  stockStatus: 'critical' | 'warning' | 'normal' | 'high';
  margin: number;
  profit: number;
  active: boolean;
  type: 'simple' | 'variant';
  variantInfo?: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    HeaderComponent,
    RouterOutlet,
    RouterLink, // ✅ Agregar
    RouterLinkActive
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  viewProviders: [provideIcons({
    matSearchOutline, matFilterAltOutline, matAddOutline, matArrowDownwardOutline,
    matArrowUpwardOutline, matDeleteOutline, matEditOutline, bootstrapChevronLeft,
    bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight
  })]
})
export default class InventoryComponent implements OnInit {
  inventoryItems: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  categories: any[] = [];
  brands: any[] = [];
  suppliers: any[] = [];
  searchTerm = '';
  selectedCategory: number | 'all' = 'all';
  selectedStatus: string = 'all';
  selectedType: string = 'all';
  load = false;
  viewMode: 'table' | 'grid' = 'table';

  // ✅ AGREGAR: Control de tabs
  activeTab: 'movements' | 'low-stock' | 'entries-exits' = 'movements';

  // KPIs
  lowStockCount = 0;
  totalValue = 0;
  totalItems = 0;
  totalRevenue = 0;
  potentialProfit = 0;
  averageMargin = 0;
  lowMarginCount = 0;

  criticalItems: InventoryItem[] = [];

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ AGREGAR: Detectar la ruta activa
    this.router.events.subscribe(() => {
      if (this.router.url.includes('/low-stock')) {
        this.activeTab = 'low-stock';

      } else {
        this.activeTab = 'movements';
      }
    });
  }

  // ✅ AGREGAR: Método para cambiar tab
  setActiveTab(tab: 'movements' | 'low-stock') {
    this.activeTab = tab;
  }
}
