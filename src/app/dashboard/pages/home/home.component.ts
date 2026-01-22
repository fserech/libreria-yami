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

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private crud: CrudService
  ) {}

  ngOnInit() {
    // ⭐ OPTIMIZACIÓN: Iniciar carga de datos inmediatamente
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // ⭐ OPTIMIZACIÓN: Crear gráficos sin delay
    this.createLineChart();
    this.createPieChart();

    // Si los datos ya están cargados, actualizar gráficos
    if (!this.loading && this.orders.length > 0) {
      this.refreshCharts();
    }
  }

  onGoalCalculated(newGoal: number) {
    this.loadDashboardData();
  }

  onGoalConfigChanged(config: GoalConfig) {
  }

  async loadDashboardData() {
    this.loading = true;

    try {
      // ⭐ OPTIMIZACIÓN: Cargar TODO en paralelo
      const [products, categories, clients, ordersResponse] = await Promise.all([
        firstValueFrom(this.http.get<Product[]>(`${environment.apiUrl}/api/v1/products`)),
        firstValueFrom(this.http.get<Category[]>(`${environment.apiUrl}/api/v1/categories`)),
        firstValueFrom(this.http.get<Client[]>(`${environment.apiUrl}/api/v1/clients`)),
        this.loadOrders() // ⭐ Método separado para órdenes
      ]);

      const { orders, ordersWithProducts } = ordersResponse;
      this.orders = orders;

      // Calcular métricas
      const dashboardData = this.calculateDashboardMetrics(products, orders, clients);

      // Actualizar componentes visuales
      this.updateStats(dashboardData, products, orders);
      this.updateKPIs(dashboardData, orders);
      this.calculateTopProductsFromOrders(ordersWithProducts, products);

      // Actualizar gráficos (solo si ya están creados)
      this.refreshCharts(products, categories, orders);

    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
    } finally {
      this.loading = false;
    }
  }

  // ⭐ NUEVO: Método separado para cargar órdenes
  private async loadOrders(): Promise<{ orders: Order[], ordersWithProducts: Order[] }> {
    try {
      this.crud.baseUrl = URL_ORDERS;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      let filter = `&dateCreatedInit=${startDate.toISOString()}&dateCreatedEnd=${endDate.toISOString()}`;

      const userData = this.auth.getUserData();
      if (userData && userData.role === 'ROLE_USER') {
        filter += `&userId=${userData.id}`;
      }

      const response: any = await this.crud.getPage('asc', 'id', 10000, 1, filter);
      const orders: Order[] = response?.content || [];

      // ⭐ OPTIMIZACIÓN: Solo cargar detalles si es necesario
      let ordersWithProducts: Order[] = orders;

      if (orders.length > 0) {
        const firstOrder = orders[0];

        // Si la primera orden no tiene productos, cargar detalles en paralelo
        if (!firstOrder.products || firstOrder.products.length === 0) {
          // ⭐ OPTIMIZACIÓN: Limitar a 50 órdenes más recientes para detalles
          const recentOrders = orders.slice(0, 50);

          const ordersWithDetailsPromises = recentOrders.map(order =>
            firstValueFrom(this.crud.getId(order.id)).catch(() => order)
          );

          const detailedOrders = await Promise.all(ordersWithDetailsPromises);

          // Combinar órdenes con detalles y el resto sin detalles
          ordersWithProducts = [...detailedOrders, ...orders.slice(50)];
        }
      }

      return { orders, ordersWithProducts };
    } catch (e) {
      console.error('❌ Error cargando órdenes:', e);
      return { orders: [], ordersWithProducts: [] };
    }
  }

  // ⭐ NUEVO: Método para refrescar gráficos
  private refreshCharts(products?: Product[], categories?: Category[], orders?: Order[]) {
    if (this.pieChart && products && categories) {
      this.updatePieChartWithRealData(products, categories);
    }
    if (this.lineChart && orders) {
      this.updateLineChartWithRealData(orders);
    }
  }

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

    const getOrderTotal = (order: Order): number => {
      return order.totalAmount || 0;
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

    const totalSales = currentMonthOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
    const previousMonthSales = previousMonthOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);

    const productsWithPrices = products.filter(p =>
      p.active && (p.salePrice || 0) > 0 && getProductCostPrice(p) > 0
    );

    const totalMargin = productsWithPrices.reduce((sum, p) => {
      const price = p.salePrice || 0;
      const cost = getProductCostPrice(p);
      return sum + ((price - cost) / price) * 100;
    }, 0);

    const averageMargin = productsWithPrices.length > 0 ? totalMargin / productsWithPrices.length : 0;

    const last12MonthsSales = orders.filter(o => isFinalized(o)).reduce((sum, o) => {
      if (!o.products || !Array.isArray(o.products)) return sum;
      return sum + o.products.reduce((pSum, p) => pSum + (p.quantity || 0), 0);
    }, 0);

    const totalInventoryUnits = products.reduce((sum, p) => {
      if (p.hasVariants && p.variants) {
        return sum + p.variants.reduce((vSum, v) => vSum + (v.currentStock || 0), 0);
      }
      return sum + (p.currentStock || 0);
    }, 0);

    const inventoryRotation = totalInventoryUnits > 0 ? last12MonthsSales / totalInventoryUnits : 0;

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

  calculateTopProductsFromOrders(orders: Order[], products: Product[]) {
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

    finalizedOrders.forEach((order) => {
      if (!order.products || !Array.isArray(order.products)) return;

      order.products.forEach((productOrder: ProductOrder) => {
        let productId: number | undefined;

        if (productOrder.productId) {
          productId = productOrder.productId;
        } else if (productOrder.product?.id) {
          productId = productOrder.product.id;
        }

        if (!productId) return;

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

    const topProductsData: TopProductDisplay[] = [];

    productSalesMap.forEach((sales, productId) => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      topProductsData.push({
        name: product.productName,
        sales: sales.quantity,
        revenue: sales.revenue,
        trend: sales.ordersCount,
        hasVariants: false,
        productType: 'simple'
      });
    });

    variantSalesMap.forEach((sales) => {
      const product = products.find(p => p.id === sales.productId);
      if (!product) return;

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

    this.topProducts = topProductsData
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    if (this.topProducts.length === 0) {
      this.topProducts = [{
        name: 'Sin ventas registradas',
        sales: 0,
        revenue: 0,
        trend: 0,
        hasVariants: false,
        productType: 'simple'
      }];
    }
  }

  updateLineChartWithRealData(orders: Order[]) {
    if (!this.lineChart) {
      console.warn('⚠️ Line chart no está inicializado aún');
      return;
    }

    if (!this.goalsComponent) {
      console.warn('⚠️ Goals component no está disponible');
      return;
    }

    const months = this.getLast6Months();
    const salesData = new Array(6).fill(0);

    const isFinalized = (order: Order): boolean => {
      if (!order.status) return false;
      const status = order.status.toUpperCase().trim();
      return status === 'FINALIZED' || status === 'FINALIZADO';
    };

    const getOrderTotal = (order: Order): number => {
      return order.totalAmount || 0;
    };

    orders.forEach(order => {
      if (!order.dateCreated || !isFinalized(order)) return;

      const orderDate = new Date(order.dateCreated);
      const monthIndex = months.findIndex(m =>
        m.month === orderDate.getMonth() && m.year === orderDate.getFullYear()
      );

      if (monthIndex !== -1) {
        const orderTotal = getOrderTotal(order);
        salesData[monthIndex] += orderTotal;
      }
    });

    const goalsData = this.goalsComponent.calculateLast6MonthsGoals(orders);
    this.lineChart.data.labels = months.map(m => m.label);
    this.lineChart.data.datasets[0].data = salesData;
    this.lineChart.data.datasets[1].data = goalsData;
    this.lineChart.update();
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
    const categoryCounts = new Map<number, number>();

    products.forEach(product => {
      if (product.categoryId && product.active) {
        const count = categoryCounts.get(product.categoryId) || 0;
        categoryCounts.set(product.categoryId, count + 1);
      }
    });

    const labels: string[] = [];
    const values: number[] = [];

    categories.forEach(category => {
      const count = categoryCounts.get(category.id) || 0;
      if (count > 0) {
        labels.push(category.categoryName);
        values.push(count);
      }
    });

    return { labels, values };
  }

  updatePieChartWithRealData(products: Product[], categories: Category[]) {
    if (!this.pieChart) {
      console.warn('⚠️ Pie chart no está inicializado aún');
      return;
    }

    const categoryData = this.getCategoryDistribution(products, categories);
    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#9CA3AF' : '#6B7280';

    this.pieChart.data.labels = categoryData.labels;
    this.pieChart.data.datasets[0].data = categoryData.values;

    if (this.pieChart.options.plugins?.legend?.labels) {
      this.pieChart.options.plugins.legend.labels.color = textColor;
    }

    this.pieChart.update();
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

  ngOnDestroy() {
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    if (this.pieChart) {
      this.pieChart.destroy();
    }
  }
}
