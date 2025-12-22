import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import BaseForm from '../../../../shared/classes/base-form';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matAddOutline,
  matSearchOutline,
  matFilterAltOutline,
  matArrowDownwardOutline,
  matArrowUpwardOutline,
  matDeleteOutline,
  matEditOutline
} from '@ng-icons/material-icons/outline';
import { SearchInputTextComponent } from '../../../../shared/components/search-input-text/search-input-text.component';
import {
  bootstrapChevronBarLeft,
  bootstrapChevronBarRight,
  bootstrapChevronLeft,
  bootstrapChevronRight
} from '@ng-icons/bootstrap-icons';
import { ChatBubbleComponent } from '../../../../shared/components/chat-bubble/chat-bubble.component';
import { OptionsChatBubble } from '../../../../shared/interfaces/options-chat-bubble';
import { NgClass } from '@angular/common';
import { URL_PRODUCTS } from '../../../../shared/constants/endpoints';
import { Router } from '@angular/router';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { ProductsFiltersDialogComponent } from '../products-filters-dialog/products-filters-dialog.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../shared/services/auth.service';
import { ACTIONS_GRID_MAIN_ADMIN } from '../../../../shared/constants/actions-menu';

@Component({
  selector: 'app-products-grid-main',
  standalone: true,
  imports: [
    HeaderComponent,
    SearchInputTextComponent,
    NgIcon,
    ChatBubbleComponent,
    NgClass,
    DialogModule,
    FormsModule
  ],
  templateUrl: './products-grid-main.component.html',
  styleUrl: './products-grid-main.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  viewProviders: [
    provideIcons({
      matSearchOutline,
      matFilterAltOutline,
      matAddOutline,
      matArrowDownwardOutline,
      matArrowUpwardOutline,
      matDeleteOutline,
      matEditOutline,
      bootstrapChevronLeft,
      bootstrapChevronRight,
      bootstrapChevronBarLeft,
      bootstrapChevronBarRight
    })
  ]
})
export default class ProductsGridMainComponent extends BaseForm implements OnInit {

  form: FormGroup;
  actionsGrid: OptionsChatBubble[] = ACTIONS_GRID_MAIN_ADMIN;
  brandMap: Map<number, string> = new Map();

  // Filtros actuales
  currentFilters?: {
    id?: number;
    productName?: string;
    initPrice?: number;
    endPrice?: number;
    active?: boolean;
  };

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    public dialog: Dialog,
    private auth: AuthService,
    private bpo: BreakpointObserver
  ) {
    super(crud, toast, auth, bpo);
    this.sortConfig.sortBy = 'productName';
    this.sortConfig.sortOrder = 'asc';

    // Configurar baseUrl para operaciones CRUD (getId, updateId, deleteId)
    this.crud.baseUrl = `${environment.apiUrl}/api/v1/products`;

    this.form = new FormGroup({
      id: new FormControl(),
      name: new FormControl(),
      salePrice: new FormControl(),
      active: new FormControl()
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadBrands();
    this.loadProducts();
  }

  // ==================== CARGA DE DATOS ====================

  /**
   * Carga las marcas para mostrar en la tabla
   */
  async loadBrands() {
    try {
      const brands = await firstValueFrom(
        this.crud.http.get<any[]>(`${environment.apiUrl}/api/v1/categories/brands`)
      );
      brands.forEach(brand => {
        this.brandMap.set(brand.id, brand.brandName);
      });
    } catch (error) {
      console.error('Error cargando marcas:', error);
      this.toast.error('Error al cargar las marcas');
    }
  }

  /**
   * Carga los productos con paginación
   */
  async loadProducts() {
    this.load = true;
    try {
      const data = await this.crud.getProductsPage(
        this.sortConfig.sortOrder,
        this.sortConfig.sortBy,
        this.pageSize,
        this.page,
        this.currentFilters
      );

      this.ItemsList = data.content || [];
      this.page = data.number + 1; // Spring usa índice base 0
      this.pageSize = data.size;
      this.totalPages = data.totalPages;
      this.totalItems = data.totalElements;
      this.startIndex = (this.page - 1) * this.pageSize + 1;
      this.endIndex = Math.min(this.page * this.pageSize, this.totalItems);
    } catch (error: any) {
      this.toast.error(error.message || 'Error al cargar productos');
      console.error('Error:', error);
    } finally {
      this.load = false;
    }
  }

  /**
   * Sobrescribir refreshPage para usar el método de productos
   */
  protected refreshPage() {
    this.loadProducts();
  }

  // ==================== UTILIDADES ====================

  /**
   * Obtiene el nombre de la marca por ID
   */
  getBrandNames(brandId: number | number[]): string {
    if (!brandId) return 'Sin marca';

    const ids = Array.isArray(brandId) ? brandId : [brandId];
    const names = ids
      .map(id => this.brandMap.get(id) || '')
      .filter(name => name !== '');

    return names.length > 0 ? names.join(', ') : 'Sin marca';
  }

  // ==================== FILTROS Y BÚSQUEDA ====================

  /**
   * Abre el diálogo de filtros avanzados
   */
  async openDialog() {
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(ProductsFiltersDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: (darkmode === 'dark')
        ? ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4']
        : ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      data: {
        title: 'Filtros de productos'
      },
    });

    try {
      const result = await firstValueFrom(dialogRef.closed) as {
        name: string;
        id: number;
        initPrice: number;
        endPrice: number;
        active: boolean;
      };

      if (result) {
        if (result.name || result.id || result.initPrice || result.endPrice || result.active !== undefined) {
          this.filter(result.name, result.id, result.initPrice, result.endPrice, result.active);
        }
      }
    } catch (error: any) {
      this.toast.error(error.message);
    }
  }

  /**
   * Reinicia la página y filtros
   */
  initPage() {
    this.currentFilters = undefined;
    this.page = 1;
    this.form.reset();
    this.loadProducts();
  }

  /**
   * Búsqueda al presionar Enter
   */
  introSearch() {
    const name: any = this.form.controls['name'].value;
    if (name && name !== '') {
      this.filter(name);
    }
  }

  /**
   * Aplica filtros de búsqueda
   */
  filter(name?: string, id?: number, initPrice?: number, endPrice?: number, active?: boolean) {
    this.currentFilters = {};

    if (id) {
      this.currentFilters.id = id;
    }
    if (name) {
      this.currentFilters.productName = name;
    }
    if (initPrice !== undefined && endPrice !== undefined) {
      this.currentFilters.initPrice = initPrice;
      this.currentFilters.endPrice = endPrice;
    }
    if (active !== undefined) {
      this.currentFilters.active = active;
    }

    this.page = 1; // Reiniciar a la primera página
    this.loadProducts();
  }

  // ==================== ORDENAMIENTO ====================

  /**
   * Cambia el orden de la tabla
   */
  changeSortOrderBy(field: string) {
    if (field === this.sortConfig.sortBy) {
      // Cambiar orden si es el mismo campo
      this.sortConfig.sortOrder = this.sortConfig.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Nuevo campo, orden ascendente por defecto
      this.sortConfig.sortBy = field;
      this.sortConfig.sortOrder = 'asc';
    }

    this.loadProducts();
  }

  // ==================== ACCIONES ====================

  /**
   * Selecciona una opción del menú de acciones
   */
  selectOption(option: OptionsChatBubble) {
    if (option.action === 'delete') {
      this.deleteId(option.id);
    }
    if (option.action === 'edit') {
      this.edit(option.id);
    }
  }

  /**
   * Navega a la página de edición
   */
  edit(id: number) {
    this.router.navigate([`/dashboard/products/detail/edit/${id}`]);
  }

  /**
   * Navega a la página de creación
   */
  add() {
    this.router.navigate([`/dashboard/products/detail/new`]);
  }

  /**
   * Obtiene los precios mínimo y máximo de las variantes
   */
  getMinMaxPrices(variants: any[]): { min: number; max: number } {
    if (!variants || variants.length === 0) {
      return { min: 0, max: 0 };
    }

    const prices = variants
      .map(v => parseFloat(v.salePrice))
      .filter(price => !isNaN(price));

    if (prices.length === 0) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
}
