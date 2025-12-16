import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { LucideAngularModule, TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-angular';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../shared/interfaces/product';

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
}

// 🆕 NUEVA INTERFACE PARA CATEGORÍAS
interface Category {
  id: number;
  categoryName: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;

  private lineChart?: Chart;
  private pieChart?: Chart;
  alertCount = 0;

  // Icons
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Package = Package;
  readonly ShoppingCart = ShoppingCart;
  readonly Users = Users;
  readonly DollarSign = DollarSign;
  readonly AlertTriangle = AlertTriangle;
  readonly ArrowUpRight = ArrowUpRight;
  readonly ArrowDownRight = ArrowDownRight;

  loading = true;
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

  // ✏️ MÉTODO ACTUALIZADO
  async loadDashboardData() {
    this.loading = true;
    try {
      // Cargar productos
      const products = await firstValueFrom(
        this.http.get<Product[]>(`${environment.apiUrl}/api/v1/products`)
      );

      // 🆕 CARGAR CATEGORÍAS REALES
      const categories = await firstValueFrom(
        this.http.get<Category[]>(`${environment.apiUrl}/api/v1/categories`)
      );

      // Calcular datos del dashboard
      const dashboardData = this.calculateDashboardMetrics(products);

      // Actualizar stats
      this.updateStats(dashboardData, products);

      // Actualizar KPIs
      this.updateKPIs(dashboardData);

      // Calcular top products
      this.calculateTopProducts(products);

      // Calcular alertas de inventario
      this.calculateInventoryAlerts(products);

      // 🆕 ACTUALIZAR GRÁFICO CON DATOS REALES
      if (this.pieChart) {
        this.updatePieChartWithRealData(products, categories);
      }

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      this.loading = false;
    }
  }

  calculateDashboardMetrics(products: Product[]): DashboardData {
    const productsWithStock = products.map(p => ({
      ...p,
      currentStock: p.minStock ?
        Math.floor(Math.random() * ((p.maxStock || 100) - p.minStock + 1)) + p.minStock :
        Math.floor(Math.random() * 50)
    }));

    const totalStock = productsWithStock.reduce((sum, p) => sum + p.currentStock, 0);
    const totalInventoryValue = productsWithStock.reduce((sum, p) =>
      sum + (p.currentStock * (p.costPrice || 0)), 0
    );
    const totalPotentialRevenue = productsWithStock.reduce((sum, p) =>
      sum + (p.currentStock * p.salePrice), 0
    );

    const totalMargin = products.reduce((sum, p) => {
      if (p.salePrice > 0) {
        return sum + (((p.salePrice - (p.costPrice || 0)) / p.salePrice) * 100);
      }
      return sum;
    }, 0);
    const averageMargin = products.length > 0 ? totalMargin / products.length : 0;
    const simulatedSales = totalPotentialRevenue * 0.15;

    return {
      totalSales: simulatedSales,
      totalProducts: products.length,
      totalClients: 0,
      totalStock: totalStock,
      averageMargin: averageMargin,
      inventoryRotation: 4.2,
      averageTicket: 185
    };
  }

  updateStats(data: DashboardData, products: Product[]) {
    const alertCount = products.filter(p => {
      const stock = p.minStock || 0;
      return stock < (p.minStock || 0);
    }).length;

    this.stats = [
      {
        label: 'Ventas del Mes',
        value: `Q${data.totalSales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,
        change: '+12.5%',
        trend: 'up',
        icon: 'DollarSign',
        color: 'bg-blue-500',
        subtitle: 'Meta: Q20,000',
        progress: (data.totalSales / 20000) * 100,
      },
      {
        label: 'Productos Activos',
        value: data.totalProducts.toString(),
        change: '+8.2%',
        trend: 'up',
        icon: 'ShoppingCart',
        color: 'bg-purple-500',
        subtitle: 'En catálogo',
        progress: 0,
      },
      {
        label: 'Clientes Activos',
        value: data.totalClients > 0 ? data.totalClients.toString() : 'N/A',
        change: '+18.3%',
        trend: 'up',
        icon: 'Users',
        color: 'bg-pink-500',
        subtitle: 'Registrados',
        progress: 0,
      },
      {
        label: 'Stock Total',
        value: data.totalStock.toLocaleString('es-GT'),
        change: alertCount > 0 ? `-${alertCount} alertas` : 'OK',
        trend: alertCount > 0 ? 'down' : 'up',
        icon: 'Package',
        color: alertCount > 0 ? 'bg-orange-500' : 'bg-green-500',
        subtitle: `${alertCount} alertas`,
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
        trend: 'up',
        change: '+0.3'
      },
      {
        label: 'Ticket Promedio',
        value: `Q${data.averageTicket}`,
        description: 'Por transacción',
        trend: 'up',
        change: '+Q12'
      },
      {
        label: 'Margen de Ganancia',
        value: `${data.averageMargin.toFixed(0)}%`,
        description: 'Margen bruto',
        trend: data.averageMargin >= 30 ? 'up' : 'down',
        change: '+2%'
      },
      {
        label: 'Productos Activos',
        value: `${data.totalProducts}`,
        description: 'En inventario',
        trend: 'up',
        change: '+12'
      },
    ];
  }

  calculateTopProducts(products: Product[]) {
    const productsWithSales = products
      .filter(p => p.active)
      .map(p => {
        const simulatedSales = Math.floor(Math.random() * 300) + 50;
        const revenue = simulatedSales * p.salePrice;
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

    this.topProducts = productsWithSales;
  }

  calculateInventoryAlerts(products: Product[]) {
    const alerts = products
      .filter(p => p.minStock && p.maxStock)
      .map(p => {
        const currentStock = Math.floor(Math.random() * ((p.maxStock || 100) - (p.minStock || 0) + 1)) + (p.minStock || 0);
        const minStock = p.minStock || 0;

        let status: 'critical' | 'warning' | 'ok' = 'ok';
        if (currentStock < minStock) {
          status = 'critical';
        } else if (currentStock < minStock * 1.2) {
          status = 'warning';
        }

        return {
          product: p.productName,
          stock: currentStock,
          minStock: minStock,
          status: status
        };
      })
      .filter(a => a.status === 'critical' || a.status === 'warning')
      .sort((a, b) => {
        if (a.status === 'critical' && b.status !== 'critical') return -1;
        if (a.status !== 'critical' && b.status === 'critical') return 1;
        return 0;
      })
      .slice(0, 6);

    this.inventoryAlerts = alerts.length > 0 ? alerts : [
      { product: 'Sin alertas', stock: 100, minStock: 50, status: 'ok' }
    ];

    this.alertCount = alerts.length;
  }

  createLineChart() {
    if (!this.lineChartRef) return;

    const monthlyData = this.generateMonthlySalesData();

    this.lineChart = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Ventas',
            data: monthlyData.sales,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Meta',
            data: monthlyData.goals,
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

  // ✏️ MÉTODO ACTUALIZADO - Inicializa vacío
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

  generateMonthlySalesData() {
    return {
      sales: [12500, 15800, 14200, 18900, 21300, 23700],
      goals: [15000, 15000, 16000, 16000, 18000, 20000]
    };
  }

  // ❌ ELIMINAR este método - ya no se usa
  // generateCategoryDistribution() { ... }

  // 🆕 NUEVO MÉTODO - Obtiene distribución real
  getCategoryDistribution(products: Product[], categories: Category[]) {
    const categoryCounts = new Map<number, number>();

    products.forEach(product => {
      if (product.categoryId) {
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

  // 🆕 NUEVO MÉTODO - Actualiza el gráfico con datos reales
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
    return Math.min((sales / 320) * 100, 100);
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
