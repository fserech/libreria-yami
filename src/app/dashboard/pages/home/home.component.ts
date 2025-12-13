import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { LucideAngularModule, TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-angular';
import { HeaderComponent } from '../../../shared/components/header/header.component';

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

interface Product {
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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;

  private lineChart?: Chart;
  private pieChart?: Chart;

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

  stats: Stat[] = [
    {
      label: 'Ventas del Mes',
      value: '$23,700',
      change: '+12.5%',
      trend: 'up',
      icon: 'DollarSign',
      color: 'bg-blue-500',
      subtitle: 'Meta: $20,000',
      progress: 118.5,
    },
    {
      label: 'Productos Vendidos',
      value: '1,284',
      change: '+8.2%',
      trend: 'up',
      icon: 'ShoppingCart',
      color: 'bg-purple-500',
      subtitle: 'vs mes anterior',
      progress: 0,
    },
    {
      label: 'Clientes Activos',
      value: '456',
      change: '+18.3%',
      trend: 'up',
      icon: 'Users',
      color: 'bg-pink-500',
      subtitle: '89 nuevos',
      progress: 0,
    },
    {
      label: 'Stock Total',
      value: '3,892',
      change: '-3.1%',
      trend: 'down',
      icon: 'Package',
      color: 'bg-orange-500',
      subtitle: '3 alertas',
      progress: 0,
    },
  ];

  kpis: KPI[] = [
    { label: 'Rotación de Inventario', value: '4.2x', description: 'Veces por año', trend: 'up', change: '+0.3' },
    { label: 'Ticket Promedio', value: '$185', description: 'Por transacción', trend: 'up', change: '+$12' },
    { label: 'Margen de Ganancia', value: '32%', description: 'Margen bruto', trend: 'up', change: '+2%' },
    { label: 'Tasa de Conversión', value: '68%', description: 'Visitantes a clientes', trend: 'down', change: '-1.2%' },
  ];

  topProducts: Product[] = [
    { name: 'Cuaderno Universitario', sales: 234, revenue: 4680, trend: 12 },
    { name: 'Libro de Texto Matemáticas', sales: 156, revenue: 7800, trend: -3 },
    { name: 'Mochila Escolar Premium', sales: 89, revenue: 8900, trend: 25 },
    { name: 'Set de Lápices de Colores', sales: 198, revenue: 3960, trend: 8 },
    { name: 'Regla Metálica 30cm', sales: 312, revenue: 2496, trend: 15 },
  ];

  inventoryAlerts: InventoryAlert[] = [
    { product: 'Bolígrafos Azules', stock: 12, minStock: 25, status: 'critical' },
    { product: 'Libro Matemáticas 5to', stock: 28, minStock: 30, status: 'warning' },
    { product: 'Diccionario Español-Inglés', stock: 23, minStock: 15, status: 'ok' },
  ];

  ngAfterViewInit() {
    setTimeout(() => {
      this.createLineChart();
      this.createPieChart();
    }, 100);
  }

  createLineChart() {
    if (!this.lineChartRef) return;

    this.lineChart = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Ventas',
            data: [12500, 15800, 14200, 18900, 21300, 23700],
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Meta',
            data: [15000, 15000, 16000, 16000, 18000, 20000],
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
          }
        },
        scales: {
          y: {
            beginAtZero: true,
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
        labels: ['Libros', 'Cuadernos', 'Útiles', 'Mochilas', 'Otros'],
        datasets: [{
          data: [456, 892, 1245, 178, 321],
          backgroundColor: [
            'rgb(59, 130, 246)',
            'rgb(139, 92, 246)',
            'rgb(236, 72, 153)',
            'rgb(245, 158, 11)',
            'rgb(16, 185, 129)',
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
          }
        }
      }
    });
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
    return (stock / minStock) * 100;
  }

  getProgressPercentage(sales: number): number {
    return (sales / 320) * 100;
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
