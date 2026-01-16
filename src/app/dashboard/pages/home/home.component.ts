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
import { AuthService } from '../../../shared/services/auth.service';
import { CrudService } from '../../../shared/services/crud.service';
import { URL_ORDERS } from '../../../shared/constants/endpoints';

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

// Interfaces para el sistema de metas
interface GoalConfig {
  type: 'fixed' | 'growth' | 'historical_avg' | 'progressive';
  baseAmount?: number;
  growthRate?: number;
  minimumGoal?: number;
  maximumGoal?: number;
}

interface MonthlyGoal {
  month: number;
  year: number;
  amount: number;
  label: string;
  type: 'calculated' | 'manual';
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

  // Sistema de metas dinámicas
  private goalConfig: GoalConfig = {
    type: 'progressive',
    baseAmount: 15000,
    growthRate: 5,
    minimumGoal: 10000,
    maximumGoal: 50000
  };

  private monthlyGoals: MonthlyGoal[] = [];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private crud: CrudService
  ) {}

  async ngOnInit() {
    this.loadGoalConfiguration();
    await this.loadDashboardData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createLineChart();
      this.createPieChart();
    }, 100);
  }

  // ============================================================================
  // SISTEMA DE METAS DINÁMICAS
  // ============================================================================

  private loadGoalConfiguration() {
    const savedConfig = localStorage.getItem('goalConfig');
    if (savedConfig) {
      try {
        this.goalConfig = JSON.parse(savedConfig);
        console.log('🎯 Configuración de metas cargada:', this.goalConfig);
      } catch (e) {
        console.warn('Error cargando configuración de metas, usando valores por defecto');
      }
    }
  }

  saveGoalConfiguration(config: GoalConfig) {
    this.goalConfig = config;
    localStorage.setItem('goalConfig', JSON.stringify(config));
    console.log('💾 Configuración de metas guardada:', config);
  }

  calculateCurrentMonthGoal(orders: Order[]): number {
    switch (this.goalConfig.type) {
      case 'fixed':
        return this.goalConfig.baseAmount || 20000;
      case 'growth':
        return this.calculateGrowthBasedGoal();
      case 'historical_avg':
        return this.calculateHistoricalAverageGoal(orders);
      case 'progressive':
        return this.calculateProgressiveGoal(orders);
      default:
        return this.goalConfig.baseAmount || 20000;
    }
  }

  private calculateGrowthBasedGoal(): number {
    const now = new Date();
    const monthsSinceStart = now.getMonth();
    const baseAmount = this.goalConfig.baseAmount || 15000;
    const growthRate = (this.goalConfig.growthRate || 5) / 100;

    let goal = baseAmount * Math.pow(1 + growthRate, monthsSinceStart);
    goal = Math.max(goal, this.goalConfig.minimumGoal || 10000);
    goal = Math.min(goal, this.goalConfig.maximumGoal || 50000);

    return Math.round(goal);
  }

  private calculateHistoricalAverageGoal(orders: Order[]): number {
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const isFinalized = (order: Order): boolean => {
      if (!order.status) return false;
      const status = order.status.toUpperCase().trim();
      return status === 'FINALIZED' || status === 'FINALIZADO';
    };

    const recentOrders = orders.filter(o => {
      if (!o.dateCreated || !isFinalized(o)) return false;
      const orderDate = new Date(o.dateCreated);
      return orderDate >= threeMonthsAgo && orderDate < now;
    });

    if (recentOrders.length === 0) {
      return this.goalConfig.baseAmount || 20000;
    }

    const salesByMonth = new Map<string, number>();
    recentOrders.forEach(order => {
      const orderDate = new Date(order.dateCreated!);
      const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
      const current = salesByMonth.get(key) || 0;
      salesByMonth.set(key, current + (order.totalAmount || 0));
    });

    const monthsWithSales = Array.from(salesByMonth.values());
    const avgMonthlySales = monthsWithSales.reduce((a, b) => a + b, 0) / monthsWithSales.length;
    const goal = avgMonthlySales * 1.1;

    return Math.round(Math.max(goal, this.goalConfig.minimumGoal || 10000));
  }

  private calculateProgressiveGoal(orders: Order[]): number {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const isFinalized = (order: Order): boolean => {
      if (!order.status) return false;
      const status = order.status.toUpperCase().trim();
      return status === 'FINALIZED' || status === 'FINALIZADO';
    };

    const lastMonthOrders = orders.filter(o => {
      if (!o.dateCreated || !isFinalized(o)) return false;
      const orderDate = new Date(o.dateCreated);
      return orderDate >= lastMonth && orderDate <= lastMonthEnd;
    });

    const lastMonthSales = lastMonthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const savedGoals = localStorage.getItem('monthlyGoalsHistory');
    let lastMonthGoal = this.goalConfig.baseAmount || 20000;

    if (savedGoals) {
      try {
        const goalsHistory: MonthlyGoal[] = JSON.parse(savedGoals);
        const lastGoal = goalsHistory.find(g =>
          g.month === lastMonth.getMonth() && g.year === lastMonth.getFullYear()
        );
        if (lastGoal) {
          lastMonthGoal = lastGoal.amount;
        }
      } catch (e) {
        console.warn('Error leyendo historial de metas');
      }
    }

    let newGoal: number;

    if (lastMonthSales >= lastMonthGoal) {
      newGoal = lastMonthGoal * 1.1;
      console.log(`🎯 Meta cumplida! Aumentando 10%: Q${lastMonthGoal} → Q${newGoal.toFixed(2)}`);
    } else if (lastMonthSales >= lastMonthGoal * 0.9) {
      newGoal = lastMonthGoal;
      console.log(`📊 Casi cumplida (${((lastMonthSales/lastMonthGoal)*100).toFixed(1)}%). Manteniendo meta: Q${lastMonthGoal}`);
    } else {
      newGoal = lastMonthGoal * 0.95;
      console.log(`📉 Meta no cumplida. Ajustando -5%: Q${lastMonthGoal} → Q${newGoal.toFixed(2)}`);
    }

    newGoal = Math.max(newGoal, this.goalConfig.minimumGoal || 10000);
    newGoal = Math.min(newGoal, this.goalConfig.maximumGoal || 50000);

    return Math.round(newGoal);
  }

  calculateLast6MonthsGoals(orders: Order[]): number[] {
    const months = this.getLast6Months();
    const goals: number[] = [];

    months.forEach((monthInfo) => {
      const goal = this.calculateGoalForSpecificMonth(
        monthInfo.month,
        monthInfo.year,
        orders
      );
      goals.push(goal);
    });

    return goals;
  }

  private calculateGoalForSpecificMonth(month: number, year: number, orders: Order[]): number {
    const now = new Date();
    const monthsAgo = (now.getFullYear() - year) * 12 + (now.getMonth() - month);

    if (monthsAgo === 0) {
      return this.calculateCurrentMonthGoal(orders);
    }

    const baseGoal = this.goalConfig.baseAmount || 15000;
    const growthRate = (this.goalConfig.growthRate || 5) / 100;
    const monthsSinceYearStart = month;

    return Math.round(baseGoal * Math.pow(1 + growthRate, monthsSinceYearStart));
  }

  private saveCurrentMonthGoal(goalAmount: number) {
    const now = new Date();
    const currentGoal: MonthlyGoal = {
      month: now.getMonth(),
      year: now.getFullYear(),
      label: this.getLast6Months()[5].label,
      amount: goalAmount,
      type: 'calculated'
    };

    let goalsHistory: MonthlyGoal[] = [];
    const savedGoals = localStorage.getItem('monthlyGoalsHistory');
    if (savedGoals) {
      try {
        goalsHistory = JSON.parse(savedGoals);
      } catch (e) {
        goalsHistory = [];
      }
    }

    const existingIndex = goalsHistory.findIndex(g =>
      g.month === currentGoal.month && g.year === currentGoal.year
    );

    if (existingIndex >= 0) {
      goalsHistory[existingIndex] = currentGoal;
    } else {
      goalsHistory.push(currentGoal);
    }

    goalsHistory = goalsHistory.slice(-12);
    localStorage.setItem('monthlyGoalsHistory', JSON.stringify(goalsHistory));
  }

  private getGoalTypeLabel(): string {
    switch (this.goalConfig.type) {
      case 'fixed': return 'fija';
      case 'growth': return 'crecimiento';
      case 'historical_avg': return 'promedio';
      case 'progressive': return 'progresiva';
      default: return '';
    }
  }

  // Métodos públicos para cambiar tipo de meta
  setFixedGoal(amount: number) {
    this.saveGoalConfiguration({
      type: 'fixed',
      baseAmount: amount
    });
    this.loadDashboardData();
  }

  setGrowthGoal(baseAmount: number, growthRate: number) {
    this.saveGoalConfiguration({
      type: 'growth',
      baseAmount: baseAmount,
      growthRate: growthRate,
      minimumGoal: baseAmount * 0.5,
      maximumGoal: baseAmount * 3
    });
    this.loadDashboardData();
  }

  setHistoricalAverageGoal() {
    this.saveGoalConfiguration({
      type: 'historical_avg',
      baseAmount: 15000,
      minimumGoal: 10000
    });
    this.loadDashboardData();
  }

  setProgressiveGoal(baseAmount: number) {
    this.saveGoalConfiguration({
      type: 'progressive',
      baseAmount: baseAmount,
      minimumGoal: baseAmount * 0.6,
      maximumGoal: baseAmount * 2
    });
    this.loadDashboardData();
  }

  // ============================================================================
  // CARGA DE DATOS DEL DASHBOARD
  // ============================================================================

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
      let ordersWithProducts: Order[] = [];

      try {
        this.crud.baseUrl = URL_ORDERS;

        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        let filter = '';
        filter += `&dateCreatedInit=${startDate.toISOString()}`;
        filter += `&dateCreatedEnd=${endDate.toISOString()}`;

        const userData = this.auth.getUserData();
        if (userData && userData.role === 'ROLE_USER') {
          filter += `&userId=${userData.id}`;
        }

        console.log('🔍 Consultando órdenes desde:', startDate.toLocaleDateString(), 'hasta:', endDate.toLocaleDateString());

        const response: any = await this.crud.getPage('asc', 'id', 10000, 1, filter);
        orders = response?.content || [];

        console.log('📋 Total órdenes recibidas:', orders.length);

        if (orders.length > 0) {
          const firstOrder = orders[0];

          if (!firstOrder.products) {
            console.warn('⚠️ Las órdenes no incluyen productos. Cargando detalles...');

            const ordersWithDetailsPromises = orders.map(order =>
              firstValueFrom(this.crud.getId(order.id)).catch(err => {
                console.error(`Error cargando orden ${order.id}:`, err);
                return order;
              })
            );

            ordersWithProducts = await Promise.all(ordersWithDetailsPromises);
            console.log('✅ Órdenes con detalles cargadas:', ordersWithProducts.length);
          } else {
            ordersWithProducts = orders;
          }

          const statusCount = orders.reduce((acc: any, order) => {
            const status = order.status || 'SIN_STATUS';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
          console.log('📊 Órdenes por status:', statusCount);
        }

      } catch (e) {
        console.error('⚠️ Error cargando órdenes:', e);
      }

      const dashboardData = this.calculateDashboardMetrics(products, orders, clients);

      console.log('💰 Métricas calculadas:', dashboardData);

      this.updateStats(dashboardData, products, orders);
      this.updateKPIs(dashboardData, orders);
      this.calculateTopProductsFromOrders(ordersWithProducts, products);

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

    const totalSales = currentMonthOrders.reduce((sum, order) => {
      return sum + getOrderTotal(order);
    }, 0);

    const previousMonthSales = previousMonthOrders.reduce((sum, order) => {
      return sum + getOrderTotal(order);
    }, 0);

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
      .reduce((sum, o) => {
        if (!o.products || !Array.isArray(o.products)) return sum;
        return sum + o.products.reduce((pSum, p) => pSum + (p.quantity || 0), 0);
      }, 0);

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

  updateStats(data: DashboardData, products: Product[], orders: Order[]) {
    const goalAmount = this.calculateCurrentMonthGoal(orders);
    const progress = (data.totalSales / goalAmount) * 100;

    const salesChange = data.previousMonthSales > 0
      ? ((data.totalSales - data.previousMonthSales) / data.previousMonthSales) * 100
      : 0;

    const salesChangeText = data.previousMonthSales > 0
      ? `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}% vs mes anterior`
      : `${data.totalOrders} órdenes`;

    this.saveCurrentMonthGoal(goalAmount);

    this.stats = [
      {
        label: 'Ventas del Mes',
        value: `Q${data.totalSales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,
        change: salesChangeText,
        trend: salesChange >= 0 ? 'up' : 'down',
        icon: 'DollarSign',
        color: data.totalSales >= goalAmount ? 'bg-blue-500' : 'bg-orange-500',
        subtitle: `Meta ${this.getGoalTypeLabel()}: Q${goalAmount.toLocaleString('es-GT')}`,
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
    const productSalesMap = new Map<number, {
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
      if (!order.products || !Array.isArray(order.products)) {
        return;
      }

      order.products.forEach((productOrder: ProductOrder) => {
        let productId: number | undefined;

        if (productOrder.productId) {
          productId = productOrder.productId;
        } else if (productOrder.product?.id) {
          productId = productOrder.product.id;
        }

        if (!productId) {
          return;
        }

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
      });
    });

    const topProductsData: TopProductDisplay[] = [];

    productSalesMap.forEach((sales, productId) => {
      const product = products.find(p => p.id === productId);

      if (!product) {
        return;
      }

      topProductsData.push({
        name: product.productName,
        sales: sales.quantity,
        revenue: sales.revenue,
        trend: sales.ordersCount
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

    const goalsData = this.calculateLast6MonthsGoals(orders);

    console.log('📈 Datos de ventas por mes:', salesData);
    console.log('🎯 Metas por mes:', goalsData);

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
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const dataset = data.datasets[0];
                    return {
                      text: label as string,
                      fillStyle: dataset.backgroundColor[i] as string,
                      hidden: false,
                      index: i,
                      strokeStyle: dataset.backgroundColor[i] as string,
                      pointStyle: 'circle'
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
