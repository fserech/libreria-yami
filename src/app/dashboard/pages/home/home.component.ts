import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

Chart.register(...registerables);

// Interfaces locales solo para el dashboard UI
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

// Interface para mostrar top productos (extiende ProductOrder con datos calculados)
interface TopProductDisplay {
  name: string;
  sales: number;      // Cantidad total vendida
  revenue: number;    // Ingresos totales
  trend: number;      // Tendencia vs mes anterior
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
    LucideAngularModule,
    HeaderComponent,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    BottomNavbarComponent,
    SelectComponent,
    DatePickerComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;

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

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    await this.loadDashboardData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createLineChart();
      this.createPieChart();
    }, 100);
  }

  async loadDashboardData() {
    this.loading = true;

    try {
      const [products, categories, clients] = await Promise.all([
        firstValueFrom(this.http.get<Product[]>(`${environment.apiUrl}/api/v1/products`)),
        firstValueFrom(this.http.get<Category[]>(`${environment.apiUrl}/api/v1/categories`)),
        firstValueFrom(this.http.get<Client[]>(`${environment.apiUrl}/api/v1/clients`))
      ]);

      console.log('📦 Productos cargados:', products.length);
      console.log('📂 Categorías cargadas:', categories.length);
      console.log('👥 Clientes cargados:', clients.length);

      let orders: Order[] = [];
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);

        const url = `${environment.apiUrl}/api/v1/finalizedOrders` +
          `?idUsers=0` +
          `&fechaInicio=${encodeURIComponent(this.formatDateToLocalString(startDate))}` +
          `&fechaFin=${encodeURIComponent(this.formatDateToLocalString(endDate))}`;

        console.log('🔍 Consultando órdenes desde:', startDate.toLocaleDateString(), 'hasta:', endDate.toLocaleDateString());

        const response: any = await firstValueFrom(this.http.post<any>(url, {}));

        orders = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.orders)
              ? response.orders
              : [];

        console.log('📋 Total órdenes recibidas:', orders.length);

        if (orders.length > 0) {
          const statusCount = orders.reduce((acc: any, order) => {
            const status = order.status || 'SIN_STATUS';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
          console.log('📊 Órdenes por status:', statusCount);
        }

      } catch (e) {
        console.warn('⚠️ Error cargando órdenes', e);
      }

      const dashboardData = this.calculateDashboardMetrics(products, orders, clients);

      console.log('💰 Métricas calculadas:', dashboardData);

      this.updateStats(dashboardData, products);
      this.updateKPIs(dashboardData, orders);
      this.calculateTopProductsFromOrders(orders, products);

      if (this.pieChart) {
        this.updatePieChartWithRealData(products, categories);
      }

      if (this.lineChart) {
        this.updateLineChartWithRealData(orders);
      }

    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
    } finally {
      this.loading = false;
    }
  }

  calculateDashboardMetrics(products: Product[], orders: Order[], clients: Client[]): DashboardData {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    console.log('📊 Calculando métricas del dashboard...');
    console.log('📅 Mes actual:', currentMonth + 1, '/', currentYear);
    console.log('📋 Total de órdenes recibidas:', orders.length);

    const isFinalized = (order: Order): boolean => {
      if (!order.status) return false;
      const status = order.status.toUpperCase().trim();
      return status === 'FINALIZED' || status === 'FINALIZADO';
    };

    const currentMonthOrders = orders.filter(o => {
      if (!o.dateCreated) return false;

      const orderDate = new Date(o.dateCreated);
      const isCurrentMonth = orderDate.getMonth() === currentMonth &&
                            orderDate.getFullYear() === currentYear;

      return isCurrentMonth && isFinalized(o);
    });

    console.log('✅ Órdenes finalizadas del mes actual:', currentMonthOrders.length);

    const previousMonthOrders = orders.filter(o => {
      if (!o.dateCreated) return false;

      const orderDate = new Date(o.dateCreated);
      const isLastMonth = orderDate.getMonth() === lastMonth &&
                         orderDate.getFullYear() === lastMonthYear;

      return isLastMonth && isFinalized(o);
    });

    console.log('📈 Órdenes finalizadas del mes anterior:', previousMonthOrders.length);

    const totalSales = currentMonthOrders.reduce((sum, o) => {
      const orderTotal = o.totalAmount ||
                        o.products.reduce((pSum, p) => pSum + (p.subtotal || 0), 0);

      if (orderTotal > 0) {
        console.log(`💵 Orden ${o.id}: Q${orderTotal.toFixed(2)}`);
      }

      return sum + orderTotal;
    }, 0);

    console.log('💰 Total ventas del mes actual: Q' + totalSales.toFixed(2));

    const previousMonthSales = previousMonthOrders.reduce(
      (sum, o) => sum + (o.totalAmount || o.products.reduce((pSum, p) => pSum + (p.subtotal || 0), 0)),
      0
    );

    console.log('📊 Ventas mes anterior: Q' + previousMonthSales.toFixed(2));

    const productsWithPrices = products.filter(p =>
      p.active && (p.salePrice || 0) > 0 && (p.costPrice || 0) > 0
    );

    const totalMargin = productsWithPrices.reduce((sum, p) => {
      const price = p.salePrice || 0;
      const cost = p.costPrice || 0;
      return sum + ((price - cost) / price) * 100;
    }, 0);

    const averageMargin = productsWithPrices.length > 0
      ? totalMargin / productsWithPrices.length
      : 0;

    const last12MonthsSales = orders
      .filter(o => isFinalized(o))
      .reduce((sum, o) => sum + o.products.reduce((pSum, p) => pSum + (p.quantity || 0), 0), 0);

    const totalInventoryUnits = products.reduce((sum, p) => {
      if (p.hasVariants && p.variants) {
        return sum + p.variants.reduce((vSum, v) => vSum + (v.currentStock || 0), 0);
      }
      return sum + (p.currentStock || 0);
    }, 0);

    const inventoryRotation = totalInventoryUnits > 0
      ? last12MonthsSales / totalInventoryUnits
      : 0;

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

  updateStats(data: DashboardData, products: Product[]) {
    const goalAmount = 20000;
    const progress = (data.totalSales / goalAmount) * 100;

    const salesChange = data.previousMonthSales > 0
      ? ((data.totalSales - data.previousMonthSales) / data.previousMonthSales) * 100
      : 0;

    const salesChangeText = data.previousMonthSales > 0
      ? `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}% vs mes anterior`
      : `${data.totalOrders} órdenes`;

    this.stats = [
      {
        label: 'Ventas del Mes',
        value: `Q${data.totalSales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,
        change: salesChangeText,
        trend: salesChange >= 0 ? 'up' : 'down',
        icon: 'DollarSign',
        color: data.totalSales >= goalAmount ? 'bg-blue-500' : 'bg-orange-500',
        subtitle: `Meta: Q${goalAmount.toLocaleString('es-GT')}`,
        progress: Math.min(progress, 100),
      },
      {
        label: 'Productos Activos',
        value: data.totalProducts.toString(),
        change: `${products.length} total en catálogo`,
        trend: 'up',
        icon: 'ShoppingCart',
        color: 'bg-purple-500',
        subtitle: 'En sistema',
        progress: 0,
      },
      {
        label: 'Clientes Activos',
        value: data.totalClients.toString(),
        change: data.totalClients > 0 ? 'Registrados' : 'Sin clientes',
        trend: 'up',
        icon: 'Users',
        color: 'bg-pink-500',
        subtitle: 'En base de datos',
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
    const productSalesMap = new Map<number, { quantity: number; revenue: number; lastMonthQuantity: number }>();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const isFinalized = (order: Order): boolean => {
      if (!order.status) return false;
      const status = order.status.toUpperCase().trim();
      return status === 'FINALIZED' || status === 'FINALIZADO';
    };

    orders
      .filter(order => {
        if (!order.dateCreated || !isFinalized(order)) return false;
        const orderDate = new Date(order.dateCreated);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .forEach(order => {
        order.products.forEach((productOrder: ProductOrder) => {
          const productId = productOrder.productId || productOrder.product?.id;
          if (productId) {
            const current = productSalesMap.get(productId) || { quantity: 0, revenue: 0, lastMonthQuantity: 0 };
            productSalesMap.set(productId, {
              quantity: current.quantity + (productOrder.quantity || 0),
              revenue: current.revenue + (productOrder.subtotal || 0),
              lastMonthQuantity: current.lastMonthQuantity
            });
          }
        });
      });

    orders
      .filter(order => {
        if (!order.dateCreated || !isFinalized(order)) return false;
        const orderDate = new Date(order.dateCreated);
        return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
      })
      .forEach(order => {
        order.products.forEach((productOrder: ProductOrder) => {
          const productId = productOrder.productId || productOrder.product?.id;
          if (productId) {
            const current = productSalesMap.get(productId) || { quantity: 0, revenue: 0, lastMonthQuantity: 0 };
            productSalesMap.set(productId, {
              ...current,
              lastMonthQuantity: current.lastMonthQuantity + (productOrder.quantity || 0)
            });
          }
        });
      });

    const topProductsData: TopProductDisplay[] = [];

    productSalesMap.forEach((sales, productId) => {
      const product = products.find(p => p.id === productId);
      if (product && sales.quantity > 0) {
        const trend = sales.lastMonthQuantity > 0
          ? ((sales.quantity - sales.lastMonthQuantity) / sales.lastMonthQuantity) * 100
          : sales.quantity > 0 ? 100 : 0;

        topProductsData.push({
          name: product.productName,
          sales: sales.quantity,
          revenue: sales.revenue,
          trend: Number(trend.toFixed(1))
        });
      }
    });

    this.topProducts = topProductsData
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    console.log('🏆 Top 5 productos:', this.topProducts);

    if (this.topProducts.length === 0) {
      this.topProducts = [{
        name: 'Sin ventas este mes',
        sales: 0,
        revenue: 0,
        trend: 0
      }];
    }
  }

  updateLineChartWithRealData(orders: Order[]) {
    if (!this.lineChart) return;

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
        const orderTotal = order.totalAmount ||
                          order.products.reduce((sum, p) => sum + (p.subtotal || 0), 0);
        salesData[monthIndex] += orderTotal;
      }
    });

    const goalsData = [15000, 15000, 16000, 16000, 18000, 20000];

    console.log('📈 Datos de ventas por mes:', salesData);

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

  formatDateToLocalString(date: Date): string {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
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
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
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
    if (!this.pieChart) return;

    const categoryData = this.getCategoryDistribution(products, categories);

    this.pieChart.data.labels = categoryData.labels;
    this.pieChart.data.datasets[0].data = categoryData.values;
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
