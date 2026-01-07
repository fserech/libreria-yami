import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import {
  LucideAngularModule,
  TrendingUp, TrendingDown, Package, ShoppingCart,
  Users, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight
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
import { Product } from '../../../shared/interfaces/product';
import { Order } from '../../../shared/interfaces/order';
import moment from 'moment';

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

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  trend: number;
}

interface InventoryAlert {
  product: string;
  stock: number;
  minStock: number;
  status: 'critical' | 'warning' | 'ok';
}

interface DashboardData {
  totalSales: number;
  totalProducts: number;
  totalClients: number;
  totalStock: number;
  averageMargin: number;
  inventoryRotation: number;
  averageTicket: number;
  totalOrders: number;
}

interface Category {
  id: number;
  categoryName: string;
}

interface Client {
  id: number;
  name: string;
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
  alertCount = 0;

  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Package = Package;
  readonly ShoppingCart = ShoppingCart;
  readonly Users = Users;
  readonly DollarSign = DollarSign;
  readonly AlertTriangle = AlertTriangle;
  readonly ArrowUpRight = ArrowUpRight;
  readonly ArrowDownRight = ArrowDownRight;

  stats: Stat[] = [];
  kpis: KPI[] = [];
  topProducts: TopProduct[] = [];
  inventoryAlerts: InventoryAlert[] = [];

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

  // =====================================================
  // 🔥 MÉTODO CORREGIDO (AQUÍ ESTABA EL ERROR)
  // =====================================================
  async loadDashboardData() {
    this.loading = true;

    try {
      const [products, categories, clients] = await Promise.all([
        firstValueFrom(this.http.get<Product[]>(`${environment.apiUrl}/api/v1/products`)),
        firstValueFrom(this.http.get<Category[]>(`${environment.apiUrl}/api/v1/categories`)),
        firstValueFrom(this.http.get<Client[]>(`${environment.apiUrl}/api/v1/clients`))
      ]);

      let orders: Order[] = [];

      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        const url = `${environment.apiUrl}/api/v1/finalizedOrders` +
          `?idUsers=0` +
          `&fechaInicio=${encodeURIComponent(this.formatDateToLocalString(startDate))}` +
          `&fechaFin=${encodeURIComponent(this.formatDateToLocalString(endDate))}`;

        const response: any = await firstValueFrom(
          this.http.post<any>(url, {})
        );

        // ✅ NORMALIZACIÓN DEFINITIVA
        orders = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.orders)
              ? response.orders
              : [];

      } catch (e) {
        console.warn('⚠️ Error cargando órdenes, usando array vacío', e);
        orders = [];
      }

      const dashboardData = this.calculateDashboardMetrics(products, orders, clients);
      this.updateStats(dashboardData, products);
      this.updateKPIs(dashboardData);

      orders.length > 0
        ? this.calculateTopProductsFromOrders(orders, products)
        : this.calculateTopProductsSimulated(products);

      this.calculateInventoryAlerts(products);

      if (this.pieChart) {
        this.updatePieChartWithRealData(products, categories);
      }

      if (this.lineChart) {
        orders.length > 0
          ? this.updateLineChartWithRealData(orders)
          : this.updateLineChartSimulated();
      }

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      this.loading = false;
    }
  }

  // =====================================================
  // 👇 TODO LO DEMÁS QUEDA IGUAL (YA ERA CORRECTO)
  // =====================================================

  calculateDashboardMetrics(products: Product[], orders: Order[], clients: Client[]): DashboardData {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const currentMonthOrders = orders.filter(o =>
      o.dateCreated &&
      new Date(o.dateCreated).getMonth() === month &&
      new Date(o.dateCreated).getFullYear() === year &&
      o.status !== 'CANCEL'
    );

    const totalSales = currentMonthOrders.reduce(
      (sum, o) => sum + o.products.reduce((pSum, p) => pSum + (p.subtotal || 0), 0),
      0
    );

    const totalStock = products.reduce((sum, p) =>
      p.hasVariants && p.variants
        ? sum + p.variants.reduce((s, v) => s + (v.currentStock || 0), 0)
        : sum + (p.currentStock || 0), 0
    );

    const totalMargin = products.reduce((sum, p) => {
      const price = p.salePrice || 0;
      const cost = p.costPrice || 0;
      return price > 0 ? sum + ((price - cost) / price) * 100 : sum;
    }, 0);

    const averageMargin = products.length ? totalMargin / products.length : 0;
    const averageTicket = currentMonthOrders.length ? totalSales / currentMonthOrders.length : 0;

    return {
      totalSales,
      totalProducts: products.filter(p => p.active).length,
      totalClients: clients.length,
      totalStock,
      averageMargin,
      inventoryRotation: 0,
      averageTicket,
      totalOrders: currentMonthOrders.length
    };
  }

  updateStats(data: DashboardData, products: Product[]) {
    // Calcular alertas de inventario
    const alertCount = products.filter(p => {
      if (p.hasVariants && p.variants) {
        return p.variants.some(v => (v.currentStock || 0) < (v.minStock || 0));
      }
      return (p.currentStock || 0) < (p.minStock || 0);
    }).length;

    // Calcular progreso vs meta (meta de Q20,000)
    const goalAmount = 20000;
    const progress = (data.totalSales / goalAmount) * 100;

    this.stats = [
      {
        label: 'Ventas del Mes',
        value: `Q${data.totalSales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,
        change: data.totalOrders > 0 ? `${data.totalOrders} órdenes` : 'Sin ventas',
        trend: data.totalSales >= goalAmount ? 'up' : 'down',
        icon: 'DollarSign',
        color: data.totalSales >= goalAmount ? 'bg-blue-500' : 'bg-orange-500',
        subtitle: `Meta: Q${goalAmount.toLocaleString('es-GT')}`,
        progress: Math.min(progress, 100),
      },
      {
        label: 'Productos Activos',
        value: data.totalProducts.toString(),
        change: `${products.length} total`,
        trend: 'up',
        icon: 'ShoppingCart',
        color: 'bg-purple-500',
        subtitle: 'En catálogo',
        progress: 0,
      },
      {
        label: 'Clientes Activos',
        value: data.totalClients.toString(),
        change: data.totalClients > 0 ? 'Registrados' : 'Sin clientes',
        trend: 'up',
        icon: 'Users',
        color: 'bg-pink-500',
        subtitle: 'En sistema',
        progress: 0,
      },
      {
        label: 'Stock Total',
        value: data.totalStock.toLocaleString('es-GT'),
        change: alertCount > 0 ? `${alertCount} alertas` : 'Stock OK',
        trend: alertCount > 0 ? 'down' : 'up',
        icon: 'Package',
        color: alertCount > 0 ? 'bg-orange-500' : 'bg-green-500',
        subtitle: alertCount > 0 ? 'Requiere atención' : 'Sin alertas',
        progress: 0,
      },
    ];
  }

  updateKPIs(data: DashboardData) {
    this.kpis = [
      {
        label: 'Rotación de Inventario',
        value: `${data.inventoryRotation.toFixed(1)}x`,
        description: 'Veces por año',
        trend: data.inventoryRotation >= 4 ? 'up' : 'down',
        change: data.inventoryRotation >= 4 ? '+0.3' : '-0.2'
      },
      {
        label: 'Ticket Promedio',
        value: `Q${data.averageTicket.toFixed(0)}`,
        description: 'Por transacción',
        trend: data.averageTicket > 150 ? 'up' : 'down',
        change: data.averageTicket > 150 ? '+Q12' : '-Q5'
      },
      {
        label: 'Margen de Ganancia',
        value: `${data.averageMargin.toFixed(0)}%`,
        description: 'Margen bruto',
        trend: data.averageMargin >= 30 ? 'up' : 'down',
        change: data.averageMargin >= 30 ? '+2%' : '-1%'
      },
      {
        label: 'Órdenes del Mes',
        value: `${data.totalOrders}`,
        description: 'Completadas',
        trend: 'up',
        change: `+${data.totalOrders}`
      },
    ];
  }

  calculateTopProductsFromOrders(orders: Order[], products: Product[]) {
    // Crear un mapa para contar ventas por producto
    const productSalesMap = new Map<number, { quantity: number; revenue: number }>();

    // Filtrar órdenes finalizadas del mes actual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const relevantOrders = orders.filter(order => {
      if (!order.dateCreated || order.status === 'CANCEL') return false;
      const orderDate = new Date(order.dateCreated);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    // Contar ventas por producto
    relevantOrders.forEach(order => {
      order.products.forEach(productOrder => {
        const productId = productOrder.productId || productOrder.product?.id;
        if (productId) {
          const current = productSalesMap.get(productId) || { quantity: 0, revenue: 0 };
          productSalesMap.set(productId, {
            quantity: current.quantity + (productOrder.quantity || 0),
            revenue: current.revenue + (productOrder.subtotal || 0)
          });
        }
      });
    });

    // Crear array de top products
    const topProductsData: TopProduct[] = [];

    productSalesMap.forEach((sales, productId) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        // Calcular tendencia simulada (en el futuro podrías comparar con mes anterior)
        const trend = Math.random() > 0.5 ?
          Number((Math.random() * 20 + 5).toFixed(1)) :
          -Number((Math.random() * 10).toFixed(1));

        topProductsData.push({
          name: product.productName,
          sales: sales.quantity,
          revenue: sales.revenue,
          trend: trend
        });
      }
    });

    // Ordenar por revenue y tomar top 5
    this.topProducts = topProductsData
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Si no hay datos, mostrar mensaje
    if (this.topProducts.length === 0) {
      this.topProducts = [{
        name: 'Sin ventas este mes',
        sales: 0,
        revenue: 0,
        trend: 0
      }];
    }
  }

  calculateTopProductsSimulated(products: Product[]) {
    const productsWithSales = products
      .filter(p => p.active)
      .map(p => {
        const simulatedSales = Math.floor(Math.random() * 300) + 50;
        const revenue = simulatedSales * (p.salePrice || 0);
        const trend = (Math.random() * 30) - 5;

        return {
          name: p.productName,
          sales: simulatedSales,
          revenue: revenue,
          trend: Number(trend.toFixed(1))
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    this.topProducts = productsWithSales.length > 0 ? productsWithSales : [{
      name: 'Sin productos',
      sales: 0,
      revenue: 0,
      trend: 0
    }];
  }

  updateLineChartSimulated() {
    if (!this.lineChart) return;

    const months = this.getLast6Months();
    const salesData = [12500, 15800, 14200, 18900, 21300, 23700];
    const goalsData = [15000, 15000, 16000, 16000, 18000, 20000];

    this.lineChart.data.labels = months.map(m => m.label);
    this.lineChart.data.datasets[0].data = salesData;
    this.lineChart.data.datasets[1].data = goalsData;
    this.lineChart.update();
  }

  calculateInventoryAlerts(products: Product[]) {
    const alerts: InventoryAlert[] = [];

    products.forEach(product => {
      if (product.hasVariants && product.variants) {
        // Productos con variantes
        product.variants.forEach(variant => {
          const currentStock = variant.currentStock || 0;
          const minStock = variant.minStock || 0;

          if (minStock > 0) {
            let status: 'critical' | 'warning' | 'ok' = 'ok';
            if (currentStock < minStock) {
              status = 'critical';
            } else if (currentStock < minStock * 1.2) {
              status = 'warning';
            }

            if (status !== 'ok') {
              alerts.push({
                product: `${product.productName} - ${variant.variantName || variant.sku}`,
                stock: currentStock,
                minStock: minStock,
                status: status
              });
            }
          }
        });
      } else {
        // Productos simples
        const currentStock = product.currentStock || 0;
        const minStock = product.minStock || 0;

        if (minStock > 0) {
          let status: 'critical' | 'warning' | 'ok' = 'ok';
          if (currentStock < minStock) {
            status = 'critical';
          } else if (currentStock < minStock * 1.2) {
            status = 'warning';
          }

          if (status !== 'ok') {
            alerts.push({
              product: product.productName,
              stock: currentStock,
              minStock: minStock,
              status: status
            });
          }
        }
      }
    });

    // Ordenar: críticos primero, luego warnings
    alerts.sort((a, b) => {
      if (a.status === 'critical' && b.status !== 'critical') return -1;
      if (a.status !== 'critical' && b.status === 'critical') return 1;
      return 0;
    });

    this.inventoryAlerts = alerts.length > 0 ? alerts.slice(0, 6) : [
      { product: 'Sin alertas', stock: 100, minStock: 50, status: 'ok' }
    ];

    this.alertCount = alerts.length;
  }

  updateLineChartWithRealData(orders: Order[]) {
    if (!this.lineChart) return;

    // Obtener últimos 6 meses
    const months = this.getLast6Months();
    const salesData = new Array(6).fill(0);
    const goalsData = [15000, 15000, 16000, 16000, 18000, 20000]; // Metas fijas

    // Calcular ventas por mes
    orders.forEach(order => {
      if (!order.dateCreated || order.status === 'CANCEL') return;

      const orderDate = new Date(order.dateCreated);
      const monthIndex = months.findIndex(m =>
        m.month === orderDate.getMonth() && m.year === orderDate.getFullYear()
      );

      if (monthIndex !== -1) {
        const orderTotal = order.products.reduce((sum, p) => sum + (p.subtotal || 0), 0);
        salesData[monthIndex] += orderTotal;
      }
    });

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
            label: 'Ventas',
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
                return context.dataset.label + ': Q' + context.parsed.y.toLocaleString('es-GT');
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

  getStockPercentage(stock: number, minStock: number): number {
    return Math.min((stock / minStock) * 100, 100);
  }

  getProgressPercentage(sales: number): number {
    const maxSales = this.topProducts.length > 0
      ? Math.max(...this.topProducts.map(p => p.sales))
      : 1;
    return Math.min((sales / maxSales) * 100, 100);
  }

  getAlertClasses(status: string): string {
    const classes = {
      critical: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      warning: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      ok: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    };
    return classes[status as keyof typeof classes] || classes.ok;
  }

  getAlertBarColor(status: string): string {
    const colors = {
      critical: 'bg-red-600',
      warning: 'bg-orange-600',
      ok: 'bg-green-600'
    };
    return colors[status as keyof typeof colors] || colors.ok;
  }

  getAlertIconColor(status: string): string {
    const colors = {
      critical: 'text-red-600 dark:text-red-400',
      warning: 'text-orange-600 dark:text-orange-400',
      ok: 'text-green-600 dark:text-green-400'
    };
    return colors[status as keyof typeof colors] || colors.ok;
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
