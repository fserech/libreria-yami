import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import {
  LucideAngularModule,
  TrendingUp, TrendingDown, Package, ShoppingCart,
  Users, DollarSign, ArrowUpRight, ArrowDownRight
} from 'lucide-angular';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { NavbarComponent } from '../../../shared/components/layout/navbar/navbar.component';
import { BottomNavbarComponent } from '../../../shared/components/layout/bottom-navbar/bottom-navbar.component';
import { FooterComponent } from '../../../shared/components/layout/footer/footer.component';
import { SidebarComponent } from '../../../shared/components/layout/sidebar/sidebar.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product, Category } from '../../../shared/interfaces/product';
import { Order, ProductOrder } from '../../../shared/interfaces/order';
import { Client } from '../../../shared/interfaces/client';
import moment from 'moment';
import { AuthService } from '../../../shared/services/auth.service';
import { CrudService } from '../../../shared/services/crud.service';
import { URL_ORDERS } from '../../../shared/constants/endpoints';
import { GoalConfig, GoalsComponent } from './component/goals/goals.component';
import { getProductCostPrice } from '../../../shared/utils/product-utils';

Chart.register(...registerables);

interface Stat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
  subtitle: string;
  progress: number;
}

interface KPI {
  label: string;
  value: string;
  description: string;
  trend: 'up' | 'down';
  change: string;
}

interface TopProductDisplay {
  name: string;
  sales: number;
  revenue: number;
  trend: number;
  hasVariants: boolean;
  variantName?: string;
  productType: 'simple' | 'variant';
}

interface DashboardData {
  totalSales: number;
  totalProducts: number;
  totalClients: number;
  averageMargin: number;
  inventoryRotation: number;
  totalOrders: number;
  previousMonthSales: number;
}

interface CacheData {
  products: Product[];
  categories: Category[];
  clients: Client[];
  orders: Order[];
  ordersWithProducts: Order[];
  timestamp: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    HeaderComponent,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    BottomNavbarComponent,
    SelectComponent,
    DatePickerComponent,
    GoalsComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild(GoalsComponent) goalsComponent!: GoalsComponent;

  private lineChart?: Chart;
  private pieChart?: Chart;

  loading = true;

  // 🚀 Cache con TTL de 5 minutos
  private static readonly CACHE_TTL = 5 * 60 * 1000;
  private static cache: CacheData | null = null;

  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Package = Package;
  readonly ShoppingCart = ShoppingCart;
  readonly Users = Users;
  readonly DollarSign = DollarSign;
  readonly ArrowUpRight = ArrowUpRight;
  readonly ArrowDownRight = ArrowDownRight;

  stats: Stat[] = [];
  kpis: KPI[] = [];
  topProducts: TopProductDisplay[] = [];
  orders: Order[] = [];

  // 🚀 Mapa de productos para lookups O(1)
  private productsMap = new Map<number, Product>();

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private crud: CrudService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // ⭐ Usar setTimeout para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
      this.createLineChart();
      this.createPieChart();

      // Si los datos ya están cargados, actualizar gráficos
      if (!this.loading && this.orders.length > 0) {
        this.refreshCharts();
      }
    }, 0);
  }

  onGoalCalculated(newGoal: number) {
    this.loadDashboardData();
  }

  onGoalConfigChanged(config: GoalConfig) {
  }

  // ⭐⭐⭐ MÉTODO PRINCIPAL - GARANTIZA CARGA DE TOP PRODUCTOS ⭐⭐⭐
  async loadDashboardData() {
    this.loading = true;

    try {
      const now = Date.now();
      const useCache = HomeComponent.cache &&
                       (now - HomeComponent.cache.timestamp) < HomeComponent.CACHE_TTL;

      let products: Product[];
      let categories: Category[];
      let clients: Client[];
      let orders: Order[];
      let ordersWithProducts: Order[];

      if (useCache && HomeComponent.cache) {
        // Usar cache existente
        ({ products, categories, clients, orders, ordersWithProducts } = HomeComponent.cache);
        console.log('✅ Usando datos en cache');
      } else {
        // 🚀 CARGAR TODO EN PARALELO
        const userData = this.auth.getUserData();

        const [productsData, categoriesData, clientsData, ordersResponse] = await Promise.all([
          this.loadProducts(),
          this.loadCategories(),
          this.loadClients(),
          this.loadOrdersWithProducts(userData) // ⭐ CRÍTICO: Método que garantiza productos
        ]);

        products = productsData;
        categories = categoriesData;
        clients = clientsData;
        orders = ordersResponse.orders;
        ordersWithProducts = ordersResponse.ordersWithProducts;

        // Guardar en cache
        HomeComponent.cache = {
          products,
          categories,
          clients,
          orders,
          ordersWithProducts,
          timestamp: now
        };

        console.log('✅ Datos cargados y guardados en cache');
      }

      // 🚀 Pre-construir mapa de productos
      this.buildProductsMap(products);
      this.orders = orders;

      // 📊 Calcular métricas del dashboard
      const dashboardData = this.calculateDashboardMetrics(products, orders, clients);

      // 📈 Actualizar componentes visuales
      this.updateStats(dashboardData, products, orders);
      this.updateKPIs(dashboardData, orders);

      // ⭐⭐⭐ CRÍTICO: Usar ordersWithProducts para calcular top productos ⭐⭐⭐
      console.log('🎯 Calculando top productos con', ordersWithProducts.length, 'órdenes enriquecidas');
      this.calculateTopProductsFromOrders(ordersWithProducts, products);

      // 📊 Actualizar gráficos
      this.refreshCharts(products, categories, orders);

    } catch (error) {
      console.error('❌ Error cargando dashboard:', error);
    } finally {
      this.loading = false;
    }
  }

  // 🚀 Cargar productos
  private async loadProducts(): Promise<Product[]> {
    try {
      const products = await firstValueFrom(
        this.http.get<Product[]>(`${environment.apiUrl}/api/v1/products`)
      );
      console.log('✅ Productos cargados:', products.length);
      return products;
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      return [];
    }
  }

  // 🚀 Cargar categorías
  private async loadCategories(): Promise<Category[]> {
    try {
      const categories = await firstValueFrom(
        this.http.get<Category[]>(`${environment.apiUrl}/api/v1/categories`)
      );
      console.log('✅ Categorías cargadas:', categories.length);
      return categories;
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
      return [];
    }
  }

  // 🚀 Cargar clientes
  private async loadClients(): Promise<Client[]> {
    try {
      const clients = await firstValueFrom(
        this.http.get<Client[]>(`${environment.apiUrl}/api/v1/clients`)
      );
      console.log('✅ Clientes cargados:', clients.length);
      return clients;
    } catch (error) {
      console.error('❌ Error cargando clientes:', error);
      return [];
    }
  }

  // ⭐⭐⭐ MÉTODO CRÍTICO: GARANTIZA QUE LAS ÓRDENES TENGAN PRODUCTOS ⭐⭐⭐
  private async loadOrdersWithProducts(userData: any): Promise<{ orders: Order[], ordersWithProducts: Order[] }> {
    try {
      this.crud.baseUrl = URL_ORDERS;
      const endDate = new Date();
      const startDate = new Date();

      // Cargar últimos 6 meses
      startDate.setMonth(startDate.getMonth() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      let filter = `&dateCreatedInit=${startDate.toISOString()}&dateCreatedEnd=${endDate.toISOString()}`;

      if (userData && userData.role === 'ROLE_USER') {
        filter += `&userId=${userData.id}`;
      }

      // Cargar órdenes
      const response: any = await this.crud.getPage('desc', 'dateCreated', 1000, 1, filter);
      const orders: Order[] = response?.content || [];

      console.log('📦 Órdenes base cargadas:', orders.length);

      if (orders.length === 0) {
        console.warn('⚠️ No se encontraron órdenes');
        return { orders: [], ordersWithProducts: [] };
      }

      // ⭐ VERIFICAR SI LA PRIMERA ORDEN TIENE PRODUCTOS
      const firstOrder = orders[0];
      const hasProducts = firstOrder.products && Array.isArray(firstOrder.products) && firstOrder.products.length > 0;

      console.log('🔍 Primera orden tiene productos?', hasProducts);
      if (hasProducts) {
        console.log('🔍 Ejemplo de productos en primera orden:', firstOrder.products.slice(0, 2));
      }

      let ordersWithProducts: Order[] = orders;

      // ⭐⭐⭐ SI NO TIENEN PRODUCTOS, CARGAR DETALLES INDIVIDUALMENTE ⭐⭐⭐
      if (!hasProducts) {
        console.warn('⚠️ Las órdenes NO tienen productos, cargando detalles...');

        // Limitar a las 100 órdenes más recientes para evitar sobrecarga
        const ordersToEnrich = orders.slice(0, 100);
        console.log(`🔄 Enriqueciendo ${ordersToEnrich.length} órdenes con sus productos...`);

        // Cargar detalles en lotes de 10 para evitar sobrecarga
        const batchSize = 10;
        const enrichedOrders: Order[] = [];

        for (let i = 0; i < ordersToEnrich.length; i += batchSize) {
          const batch = ordersToEnrich.slice(i, i + batchSize);

          const batchPromises = batch.map(order =>
            firstValueFrom(this.crud.getId(order.id!))
              .then(detailedOrder => {
                console.log(`✅ Orden ${order.id} enriquecida con ${detailedOrder.products?.length || 0} productos`);
                return detailedOrder;
              })
              .catch(err => {
                console.error(`❌ Error enriqueciendo orden ${order.id}:`, err);
                return order; // Devolver orden sin detalles en caso de error
              })
          );

          const batchResults = await Promise.all(batchPromises);
          enrichedOrders.push(...batchResults);

          console.log(`📊 Progreso: ${Math.min(i + batchSize, ordersToEnrich.length)}/${ordersToEnrich.length} órdenes procesadas`);
        }

        // Combinar órdenes enriquecidas con el resto sin detalles
        ordersWithProducts = [...enrichedOrders, ...orders.slice(100)];

        console.log('✅ Órdenes enriquecidas:', enrichedOrders.length);
        console.log('📦 Total órdenes con productos disponibles:', ordersWithProducts.length);
      } else {
        console.log('✅ Las órdenes YA tienen productos, no es necesario cargar detalles');
      }

      return { orders, ordersWithProducts };

    } catch (e) {
      console.error('❌ Error cargando órdenes:', e);
      return { orders: [], ordersWithProducts: [] };
    }
  }

  // 🚀 Pre-construir mapa de productos para lookups O(1)
  private buildProductsMap(products: Product[]) {
    this.productsMap.clear();
    products.forEach(p => this.productsMap.set(p.id, p));
    console.log('🗺️ Mapa de productos construido:', this.productsMap.size);
  }

  // 📊 Refrescar gráficos con verificación de existencia
  private refreshCharts(products?: Product[], categories?: Category[], orders?: Order[]) {
    // ⭐ Usar setTimeout para asegurar que los gráficos estén listos
    setTimeout(() => {
      if (this.pieChart && products && categories) {
        console.log('📊 Actualizando pie chart con', products.length, 'productos y', categories.length, 'categorías');
        this.updatePieChartWithRealData(products, categories);
      } else if (!this.pieChart) {
        console.warn('⚠️ Pie chart aún no está inicializado');
      }

      if (this.lineChart && orders) {
        console.log('📈 Actualizando line chart con', orders.length, 'órdenes');
        this.updateLineChartWithRealData(orders);
      } else if (!this.lineChart) {
        console.warn('⚠️ Line chart aún no está inicializado');
      }
    }, 100);
  }

  // 📊 Calcular métricas del dashboard
  calculateDashboardMetrics(products: Product[], orders: Order[], clients: Client[]): DashboardData {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const isFinalized = (order: Order): boolean => {
      if (!order.status) return false;
      const status = order.status.toUpperCase().trim();
      return status === 'FINALIZED' || status === 'FINALIZADO';
    };

    const currentMonthOrders = orders.filter(o => {
      if (!o.dateCreated) return false;
      const orderDate = new Date(o.dateCreated);
      return orderDate.getMonth() === currentMonth &&
             orderDate.getFullYear() === currentYear &&
             isFinalized(o);
    });

    const previousMonthOrders = orders.filter(o => {
      if (!o.dateCreated) return false;
      const orderDate = new Date(o.dateCreated);
      return orderDate.getMonth() === lastMonth &&
             orderDate.getFullYear() === lastMonthYear &&
             isFinalized(o);
    });

    const totalSales = currentMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const previousMonthSales = previousMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const productsWithPrices = products.filter(p =>
      p.active && (p.salePrice || 0) > 0 && getProductCostPrice(p) > 0
    );

    let totalMargin = 0;
    for (const p of productsWithPrices) {
      const price = p.salePrice || 0;
      const cost = getProductCostPrice(p);
      totalMargin += ((price - cost) / price) * 100;
    }

    const averageMargin = productsWithPrices.length > 0 ? totalMargin / productsWithPrices.length : 0;

    const finalizedOrders = orders.filter(o => isFinalized(o));
    let last6MonthsSales = 0;
    for (const o of finalizedOrders) {
      if (!o.products || !Array.isArray(o.products)) continue;
      for (const p of o.products) {
        last6MonthsSales += (p.quantity || 0);
      }
    }

    let totalInventoryUnits = 0;
    for (const p of products) {
      if (p.hasVariants && p.variants) {
        for (const v of p.variants) {
          totalInventoryUnits += (v.currentStock || 0);
        }
      } else {
        totalInventoryUnits += (p.currentStock || 0);
      }
    }

    const inventoryRotation = totalInventoryUnits > 0 ? last6MonthsSales / totalInventoryUnits : 0;

    return {
      totalSales,
      previousMonthSales,
      totalProducts: products.filter(p => p.active).length,
      totalClients: clients.length,
      averageMargin,
      inventoryRotation,
      totalOrders: currentMonthOrders.length
    };
  }

  updateStats(data: DashboardData, products: Product[], orders: Order[]) {
    const goalAmount = this.goalsComponent ? this.goalsComponent.calculateCurrentMonthGoal(orders) : 20000;
    const progress = (data.totalSales / goalAmount) * 100;

    const salesChange = data.previousMonthSales > 0
      ? ((data.totalSales - data.previousMonthSales) / data.previousMonthSales) * 100
      : 0;

    const salesChangeText = data.previousMonthSales > 0
      ? `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}% vs mes anterior`
      : `${data.totalOrders} órdenes este mes`;

    if (this.goalsComponent) {
      this.goalsComponent.saveCurrentMonthGoal(goalAmount);
    }

    const goalTypeLabel = this.goalsComponent ? this.goalsComponent.getGoalTypeLabel() : '';

    this.stats = [
      {
        label: 'Ventas del Mes',
        value: `Q${data.totalSales.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: salesChangeText,
        trend: salesChange >= 0 ? 'up' : 'down',
        icon: 'DollarSign',
        color: data.totalSales >= goalAmount ? 'bg-green-500' : 'bg-blue-500',
        subtitle: `Meta ${goalTypeLabel}: Q${goalAmount.toLocaleString('es-GT', { maximumFractionDigits: 0 })}`,
        progress: Math.min(progress, 100),
      },
      {
        label: 'Productos Activos',
        value: data.totalProducts.toString(),
        change: `${products.length} total en catálogo`,
        trend: 'up',
        icon: 'ShoppingCart',
        color: 'bg-purple-500',
        subtitle: 'Disponibles para venta',
        progress: 0,
      },
      {
        label: 'Clientes Activos',
        value: data.totalClients.toString(),
        change: data.totalClients > 0 ? 'Registrados en sistema' : 'Sin clientes',
        trend: 'up',
        icon: 'Users',
        color: 'bg-pink-500',
        subtitle: 'Base de datos',
        progress: 0,
      }
    ];
  }

  updateKPIs(data: DashboardData, orders: Order[]) {
    this.kpis = [
      {
        label: 'Rotación de Inventario',
        value: `${data.inventoryRotation.toFixed(1)}x`,
        description: 'Veces por año',
        trend: data.inventoryRotation >= 4 ? 'up' : 'down',
        change: data.inventoryRotation >= 4 ? 'Óptima' : 'Mejorable'
      },
      {
        label: 'Margen de Ganancia',
        value: `${data.averageMargin.toFixed(1)}%`,
        description: 'Margen bruto promedio',
        trend: data.averageMargin >= 30 ? 'up' : 'down',
        change: data.averageMargin >= 30 ? 'Saludable' : 'Bajo'
      },
      {
        label: 'Órdenes Completadas',
        value: `${data.totalOrders}`,
        description: 'Este mes',
        trend: 'up',
        change: `Total procesadas`
      },
    ];
  }

  // ⭐⭐⭐ MÉTODO CRÍTICO: CALCULAR TOP PRODUCTOS ⭐⭐⭐
  calculateTopProductsFromOrders(orders: Order[], products: Product[]) {
    console.log('🎯 === INICIO CÁLCULO TOP PRODUCTOS ===');
    console.log('📦 Órdenes recibidas:', orders.length);
    console.log('🛍️ Productos disponibles:', products.length);

    const productSalesMap = new Map<number, {
      quantity: number;
      revenue: number;
      ordersCount: number;
    }>();

    const variantSalesMap = new Map<number, {
      productId: number;
      variantId: number;
      quantity: number;
      revenue: number;
      ordersCount: number;
    }>();

    const isFinalized = (order: Order): boolean => {
      if (!order.status) return false;
      const status = order.status.toUpperCase().trim();
      return status === 'FINALIZED' || status === 'FINALIZADO';
    };

    const finalizedOrders = orders.filter(order => isFinalized(order));
    console.log('✅ Órdenes finalizadas:', finalizedOrders.length);

    let ordersWithProductsCount = 0;
    let totalProductsProcessed = 0;

    finalizedOrders.forEach((order, index) => {
      if (!order.products || !Array.isArray(order.products) || order.products.length === 0) {
        if (index < 5) {
          console.warn(`⚠️ Orden #${order.id} SIN productos`);
        }
        return;
      }

      ordersWithProductsCount++;
      if (index < 3) {
        console.log(`✅ Orden #${order.id} tiene ${order.products.length} productos`);
      }

      order.products.forEach((productOrder: ProductOrder) => {
        totalProductsProcessed++;

        let productId: number | undefined;

        if (productOrder.productId) {
          productId = productOrder.productId;
        } else if (productOrder.product?.id) {
          productId = productOrder.product.id;
        }

        if (!productId) {
          console.warn('⚠️ ProductOrder sin productId:', productOrder);
          return;
        }

        if (productOrder.variantId) {
          const variantKey = productOrder.variantId;
          const current = variantSalesMap.get(variantKey) || {
            productId: productId,
            variantId: productOrder.variantId,
            quantity: 0,
            revenue: 0,
            ordersCount: 0
          };

          variantSalesMap.set(variantKey, {
            ...current,
            quantity: current.quantity + (productOrder.quantity || 0),
            revenue: current.revenue + (productOrder.subtotal || 0),
            ordersCount: current.ordersCount + 1
          });

        } else {
          const current = productSalesMap.get(productId) || {
            quantity: 0,
            revenue: 0,
            ordersCount: 0
          };

          productSalesMap.set(productId, {
            quantity: current.quantity + (productOrder.quantity || 0),
            revenue: current.revenue + (productOrder.subtotal || 0),
            ordersCount: current.ordersCount + 1
          });
        }
      });
    });

    console.log('📊 Resumen del procesamiento:');
    console.log(`  - Órdenes con productos: ${ordersWithProductsCount}/${finalizedOrders.length}`);
    console.log(`  - Total productos procesados: ${totalProductsProcessed}`);
    console.log(`  - Productos simples únicos: ${productSalesMap.size}`);
    console.log(`  - Variantes únicas: ${variantSalesMap.size}`);

    const topProductsData: TopProductDisplay[] = [];

    // Procesar productos simples
    productSalesMap.forEach((sales, productId) => {
      const product = this.productsMap.get(productId);
      if (!product) {
        console.warn(`⚠️ Producto ID ${productId} no encontrado en mapa`);
        return;
      }

      topProductsData.push({
        name: product.productName,
        sales: sales.quantity,
        revenue: sales.revenue,
        trend: sales.ordersCount,
        hasVariants: false,
        productType: 'simple'
      });
    });

    // Procesar variantes
    variantSalesMap.forEach((sales) => {
      const product = this.productsMap.get(sales.productId);
      if (!product) {
        console.warn(`⚠️ Producto ID ${sales.productId} (variante) no encontrado en mapa`);
        return;
      }

      const variant = product.variants?.find(v => v.id === sales.variantId);
      const variantName = variant?.variantName || `Variante #${sales.variantId}`;

      topProductsData.push({
        name: product.productName,
        variantName: variantName,
        sales: sales.quantity,
        revenue: sales.revenue,
        trend: sales.ordersCount,
        hasVariants: true,
        productType: 'variant'
      });
    });

    console.log('🏆 Productos candidatos para top:', topProductsData.length);

    // Ordenar y tomar top 5
    this.topProducts = topProductsData
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    console.log('✅ TOP 5 PRODUCTOS MÁS VENDIDOS:');
    this.topProducts.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name}${p.variantName ? ` - ${p.variantName}` : ''}: ${p.sales} unidades, Q${p.revenue.toFixed(2)}`);
    });

    // Fallback si no hay productos vendidos
    if (this.topProducts.length === 0) {
      console.warn('⚠️ NO HAY PRODUCTOS VENDIDOS - Mostrando mensaje por defecto');
      this.topProducts = [{
        name: 'Sin ventas registradas',
        sales: 0,
        revenue: 0,
        trend: 0,
        hasVariants: false,
        productType: 'simple'
      }];
    }

    console.log('🎯 === FIN CÁLCULO TOP PRODUCTOS ===');
  }

  updateLineChartWithRealData(orders: Order[]) {
    if (!this.lineChart) {
      console.warn('⚠️ Line chart no está inicializado');
      return;
    }

    if (!this.lineChartRef || !this.lineChartRef.nativeElement) {
      console.warn('⚠️ Line chart ref no disponible');
      return;
    }

    if (!this.goalsComponent) {
      console.warn('⚠️ Goals component no está disponible');
      return;
    }

    console.log('📈 Actualizando line chart con', orders.length, 'órdenes');

    const months = this.getLast6Months();
    const salesData = new Array(6).fill(0);

    const isFinalized = (order: Order): boolean => {
      if (!order.status) return false;
      const status = order.status.toUpperCase().trim();
      return status === 'FINALIZED' || status === 'FINALIZADO';
    };

    orders.forEach(order => {
      if (!order.dateCreated || !isFinalized(order)) return;

      const orderDate = new Date(order.dateCreated);
      const monthIndex = months.findIndex(m =>
        m.month === orderDate.getMonth() && m.year === orderDate.getFullYear()
      );

      if (monthIndex !== -1) {
        salesData[monthIndex] += (order.totalAmount || 0);
      }
    });

    const goalsData = this.goalsComponent.calculateLast6MonthsGoals(orders);
    this.lineChart.data.labels = months.map(m => m.label);
    this.lineChart.data.datasets[0].data = salesData;
    this.lineChart.data.datasets[1].data = goalsData;

    // ⭐ CRÍTICO: Usar 'active' para forzar actualización
    this.lineChart.update('active');
    console.log('✅ Line chart actualizado correctamente');
  }

  getLast6Months() {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const result = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      result.push({
        label: months[date.getMonth()],
        month: date.getMonth(),
        year: date.getFullYear()
      });
    }

    return result;
  }

  createLineChart() {
    if (!this.lineChartRef) return;

    this.lineChart = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Ventas Reales',
            data: [],
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Meta',
            data: [],
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            fill: true,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#000',
            bodyColor: '#000',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': Q' + context.parsed.y.toLocaleString('es-GT', { minimumFractionDigits: 2 });
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'Q' + value.toLocaleString('es-GT');
              }
            },
            grid: {
              color: '#f0f0f0',
            }
          },
          x: {
            grid: {
              display: false,
            }
          }
        }
      }
    });
  }

  createPieChart() {
    if (!this.pieChartRef) return;

    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#9CA3AF' : '#6B7280';

    this.pieChart = new Chart(this.pieChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            'rgb(59, 130, 246)',
            'rgb(139, 92, 246)',
            'rgb(236, 72, 153)',
            'rgb(245, 158, 11)',
            'rgb(16, 185, 129)',
            'rgb(239, 68, 68)',
            'rgb(20, 184, 166)',
            'rgb(251, 146, 60)',
          ],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        layout: {
          padding: {
            bottom: 20
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 12,
              font: {
                size: 10
              },
              boxWidth: 8,
              boxHeight: 8,
              color: textColor,
              generateLabels: function(chart) {
                const data = chart.data;
                const isDark = document.documentElement.classList.contains('dark');
                const labelColor = isDark ? '#9CA3AF' : '#6B7280';

                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const dataset = data.datasets[0];
                    return {
                      text: label as string,
                      fillStyle: dataset.backgroundColor[i] as string,
                      hidden: false,
                      index: i,
                      strokeStyle: dataset.backgroundColor[i] as string,
                      pointStyle: 'circle',
                      fontColor: labelColor
                    };
                  });
                }
                return [];
              }
            },
            maxHeight: 200,
            align: 'center'
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#000',
            bodyColor: '#000',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
              }
            }
          }
        }
      }
    });
  }

  getCategoryDistribution(products: Product[], categories: Category[]) {
    console.log('🔍 Calculando distribución de categorías...');
    console.log('🔍 Total productos:', products.length);
    console.log('🔍 Total categorías:', categories.length);

    const categoryCounts = new Map<number, number>();

    products.forEach(product => {
      if (product.categoryId && product.active) {
        const count = categoryCounts.get(product.categoryId) || 0;
        categoryCounts.set(product.categoryId, count + 1);
      }
    });

    console.log('🔍 Categorías con productos:', categoryCounts.size);

    const labels: string[] = [];
    const values: number[] = [];

    categories.forEach(category => {
      const count = categoryCounts.get(category.id) || 0;
      if (count > 0) {
        labels.push(category.categoryName);
        values.push(count);
      }
    });

    console.log('🔍 Distribución final:', { labels, values });

    return { labels, values };
  }

  updatePieChartWithRealData(products: Product[], categories: Category[]) {
    if (!this.pieChart) {
      console.warn('⚠️ Pie chart no está inicializado');
      return;
    }

    if (!this.pieChartRef || !this.pieChartRef.nativeElement) {
      console.warn('⚠️ Pie chart ref no disponible');
      return;
    }

    console.log('🥧 Actualizando datos del pie chart...');
    const categoryData = this.getCategoryDistribution(products, categories);

    console.log('🥧 Categorías encontradas:', categoryData.labels.length);
    console.log('🥧 Labels:', categoryData.labels);
    console.log('🥧 Values:', categoryData.values);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#9CA3AF' : '#6B7280';

    this.pieChart.data.labels = categoryData.labels;
    this.pieChart.data.datasets[0].data = categoryData.values;

    if (this.pieChart.options.plugins?.legend?.labels) {
      this.pieChart.options.plugins.legend.labels.color = textColor;
    }

    // ⭐ CRÍTICO: Usar 'active' en lugar de 'none' para forzar actualización
    this.pieChart.update('active');
    console.log('✅ Pie chart actualizado correctamente');
  }

  getIcon(iconName: string) {
    const icons: any = {
      DollarSign: this.DollarSign,
      ShoppingCart: this.ShoppingCart,
      Users: this.Users,
      Package: this.Package,
    };
    return icons[iconName];
  }

  getProgressPercentage(sales: number): number {
    const maxSales = this.topProducts.length > 0
      ? Math.max(...this.topProducts.map(p => p.sales))
      : 1;
    return Math.min((sales / maxSales) * 100, 100);
  }

  diagnosticVariants() {
  console.log('🔬 === DIAGNÓSTICO DE VARIANTES ===');

  // 1. Verificar productos con variantes
  const productsWithVariants = Array.from(this.productsMap.values())
    .filter(p => p.hasVariants && p.variants && p.variants.length > 0);

  console.log('📦 Productos con variantes en sistema:', productsWithVariants.length);
  productsWithVariants.slice(0, 3).forEach(p => {
    console.log(`  - ${p.productName}:`);
    p.variants?.forEach(v => {
      console.log(`    └─ ID: ${v.id}, Nombre: ${v.variantName}`);
    });
  });

  // 2. Verificar órdenes con variantes
  const ordersWithVariants = this.orders.filter(order =>
    order.products?.some(po => po.variantId !== null && po.variantId !== undefined)
  );

  console.log('📋 Órdenes con variantes:', ordersWithVariants.length);
  ordersWithVariants.slice(0, 3).forEach(order => {
    console.log(`  - Orden #${order.id}:`);
    order.products
      ?.filter(po => po.variantId)
      .forEach(po => {
        console.log(`    └─ ProductID: ${po.productId}, VariantID: ${po.variantId}, Qty: ${po.quantity}`);
      });
  });

  // 3. Verificar estructura de ProductOrder
  const sampleOrder = this.orders.find(o => o.products && o.products.length > 0);
  if (sampleOrder && sampleOrder.products && sampleOrder.products.length > 0) {
    console.log('🔍 Estructura de ProductOrder (muestra):');
    const sampleProduct = sampleOrder.products[0];
    console.log('  Keys disponibles:', Object.keys(sampleProduct));
    console.log('  Valores:', {
      productId: sampleProduct.productId,
      variantId: sampleProduct.variantId,
      quantity: sampleProduct.quantity,
      subtotal: sampleProduct.subtotal,
      hasProduct: !!sampleProduct.product
    });
  }

   const variantIdTypes = new Map<string, number>();
  this.orders.forEach(order => {
    order.products?.forEach(po => {
      const type = typeof po.variantId === 'number' ? 'number' :
                   po.variantId === null ? 'null' :
                   po.variantId === undefined ? 'undefined' : 'otro';
      variantIdTypes.set(type, (variantIdTypes.get(type) || 0) + 1);
    });
  });

  console.log('📊 Tipos de variantId encontrados:');
  variantIdTypes.forEach((count, type) => {
    console.log(`  - ${type}: ${count} veces`);
  });

  console.log('🔬 === FIN DIAGNÓSTICO ===');
}

  ngOnDestroy() {
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    if (this.pieChart) {
      this.pieChart.destroy();
    }
  }
}
