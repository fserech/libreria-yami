import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Target, Settings, X, TrendingUp, BarChart3, Zap } from 'lucide-angular';
import { Order } from '../../../../../shared/interfaces/order';
import { ToastService } from '../../../../../shared/services/toast.service';

export interface GoalConfig {
  type: 'fixed' | 'growth' | 'historical_avg' | 'progressive';
  baseAmount?: number;
  growthRate?: number;
  minimumGoal?: number;
  maximumGoal?: number;
}

export interface MonthlyGoal {
  month: number;
  year: number;
  amount: number;
  label: string;
  type: 'calculated' | 'manual';
}

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit {
  @Input() orders: Order[] = [];
  @Output() goalCalculated = new EventEmitter<number>();
  @Output() goalConfigChanged = new EventEmitter<GoalConfig>();

  readonly Target = Target;
  readonly Settings = Settings;
  readonly X = X;
  readonly TrendingUp = TrendingUp;
  readonly BarChart3 = BarChart3;
  readonly Zap = Zap;

  Math = Math;
  showGoalConfigurator = false;
  selectedGoalType: 'fixed' | 'growth' | 'historical_avg' | 'progressive' = 'progressive';
  fixedAmount = 20000;
  growthBase = 15000;
  growthRate = 8;
  progressiveBase = 18000;

  private goalConfig: GoalConfig = {
    type: 'progressive',
    baseAmount: 15000,
    growthRate: 5,
    minimumGoal: 10000,
    maximumGoal: 50000
  };

  private monthlyGoals: MonthlyGoal[] = [];

  goalTypes = [
    {
      id: 'fixed' as const,
      name: 'Meta Fija',
      icon: 'target',
      description: 'Mismo monto todos los meses',
      color: 'bg-blue-500',
      example: 'Ej: Q20,000 cada mes'
    },
    {
      id: 'growth' as const,
      name: 'Meta con Crecimiento',
      icon: 'trendingUp',
      description: 'Aumenta un % cada mes',
      color: 'bg-green-500',
      example: 'Ej: +8% mensual desde Q15,000'
    },
    {
      id: 'historical_avg' as const,
      name: 'Meta Histórica',
      icon: 'barChart',
      description: 'Basada en promedio de ventas',
      color: 'bg-purple-500',
      example: 'Ej: Promedio últimos 3 meses +10%'
    },
    {
      id: 'progressive' as const,
      name: 'Meta Progresiva',
      icon: 'zap',
      description: 'Auto-ajustable según desempeño',
      color: 'bg-orange-500',
      example: 'Ej: Sube 10% si cumples, baja 5% si no'
    }
  ];

  constructor(private toast: ToastService) {}

  ngOnInit() {
    this.loadGoalConfiguration();
  }

  toggleGoalConfigurator() {
    this.showGoalConfigurator = !this.showGoalConfigurator;
  }

  getGoalIcon(iconName: string) {
    const icons: any = {
      target: this.Target,
      trendingUp: this.TrendingUp,
      barChart: this.BarChart3,
      zap: this.Zap,
    };
    return icons[iconName];
  }

  applyGoalConfiguration() {
    switch (this.selectedGoalType) {
      case 'fixed':
        this.setFixedGoal(this.fixedAmount);
        this.toast.success(`Meta Fija configurada: Q${this.fixedAmount.toLocaleString('es-GT')}`);
        break;
      case 'growth':
        this.setGrowthGoal(this.growthBase, this.growthRate);
        this.toast.success(`Meta con Crecimiento: Q${this.growthBase.toLocaleString('es-GT')} +${this.growthRate}%/mes`);
        break;
      case 'historical_avg':
        this.setHistoricalAverageGoal();
        this.toast.success('Meta Histórica configurada basada en promedio de ventas');
        break;
      case 'progressive':
        this.setProgressiveGoal(this.progressiveBase);
        this.toast.success(`Meta Progresiva: Base Q${this.progressiveBase.toLocaleString('es-GT')}`);
        break;
    }
    this.showGoalConfigurator = false;

    // Emitir la nueva meta calculada
    const newGoal = this.calculateCurrentMonthGoal(this.orders);
    this.goalCalculated.emit(newGoal);
  }

  private loadGoalConfiguration() {
    const savedConfig = localStorage.getItem('goalConfig');
    if (savedConfig) {
      try {
        this.goalConfig = JSON.parse(savedConfig);
        this.selectedGoalType = this.goalConfig.type;
        if (this.goalConfig.baseAmount) {
          this.fixedAmount = this.goalConfig.baseAmount;
          this.growthBase = this.goalConfig.baseAmount;
          this.progressiveBase = this.goalConfig.baseAmount;
        }
        if (this.goalConfig.growthRate) {
          this.growthRate = this.goalConfig.growthRate;
        }
      } catch (e) {
        console.warn('Error cargando configuración de metas, usando valores por defecto');
      }
    }
  }

  private saveGoalConfiguration(config: GoalConfig) {
    this.goalConfig = config;
    localStorage.setItem('goalConfig', JSON.stringify(config));
    this.goalConfigChanged.emit(config);
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
    } else if (lastMonthSales >= lastMonthGoal * 0.9) {
      newGoal = lastMonthGoal;
    } else {
      newGoal = lastMonthGoal * 0.95;
    }

    newGoal = Math.max(newGoal, this.goalConfig.minimumGoal || 10000);
    newGoal = Math.min(newGoal, this.goalConfig.maximumGoal || 50000);
    return Math.round(newGoal);
  }

  calculateLast6MonthsGoals(orders: Order[]): number[] {
    const months = this.getLast6Months();
    const goals: number[] = [];
    months.forEach((monthInfo) => {
      const goal = this.calculateGoalForSpecificMonth(monthInfo.month, monthInfo.year, orders);
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

  saveCurrentMonthGoal(goalAmount: number) {
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

  getGoalTypeLabel(): string {
    switch (this.goalConfig.type) {
      case 'fixed': return 'fija';
      case 'growth': return 'crecimiento';
      case 'historical_avg': return 'promedio';
      case 'progressive': return 'progresiva';
      default: return '';
    }
  }

  private getLast6Months() {
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

  setFixedGoal(amount: number) {
    this.saveGoalConfiguration({
      type: 'fixed',
      baseAmount: amount
    });
  }

  setGrowthGoal(baseAmount: number, growthRate: number) {
    this.saveGoalConfiguration({
      type: 'growth',
      baseAmount: baseAmount,
      growthRate: growthRate,
      minimumGoal: baseAmount * 0.5,
      maximumGoal: baseAmount * 3
    });
  }

  setHistoricalAverageGoal() {
    this.saveGoalConfiguration({
      type: 'historical_avg',
      baseAmount: 15000,
      minimumGoal: 10000
    });
  }

  setProgressiveGoal(baseAmount: number) {
    this.saveGoalConfiguration({
      type: 'progressive',
      baseAmount: baseAmount,
      minimumGoal: baseAmount * 0.6,
      maximumGoal: baseAmount * 2
    });
  }
}
