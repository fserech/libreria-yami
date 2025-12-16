import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matAddOutline, matDeleteOutline, matEditOutline, matEmailOutline, matLocationOnOutline, matPhoneOutline, matSearchOutline, matStoreOutline, matVisibilityOutline } from '@ng-icons/material-icons/outline';
import { Branch } from '../../../../shared/interfaces/branch';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-branch-stock',
  standalone: true,
 imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './branch-stock.component.html',
  styleUrl: './branch-stock.component.scss',
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
  viewProviders: [
    provideIcons({
      matAddOutline,
      matEditOutline,
      matDeleteOutline,
      matSearchOutline,
      matLocationOnOutline,
      matPhoneOutline,
      matEmailOutline,
      matStoreOutline,
      matVisibilityOutline
    })
  ]
})
export default class BranchStockComponent implements OnInit{
  branches: Branch[] = [];
  filteredBranches: Branch[] = [];
  searchTerm = '';
  loading = false;

  // Filtros
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  // Estadísticas
  totalBranches = 0;
  activeBranches = 0;
  inactiveBranches = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  async loadBranches(): Promise<void> {
    this.loading = true;
    try {
      const data = await firstValueFrom(
        this.http.get<Branch[]>(`${environment.apiUrl}/api/v1/branches`)
      );
      this.branches = data;
      this.calculateStats();
      this.applyFilters();
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      this.toast.error('Error al cargar sucursales');
    } finally {
      this.loading = false;
    }
  }

  calculateStats(): void {
    this.totalBranches = this.branches.length;
    this.activeBranches = this.branches.filter(b => b.active).length;
    this.inactiveBranches = this.branches.filter(b => !b.active).length;
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredBranches = this.branches.filter(branch => {
      const matchText =
        branch.branchName.toLowerCase().includes(term) ||
        branch.address.toLowerCase().includes(term) ||
        branch.city.toLowerCase().includes(term) ||
        (branch.branchCode?.toLowerCase().includes(term) ?? false);

      const matchStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && branch.active) ||
        (this.statusFilter === 'inactive' && !branch.active);

      return matchText && matchStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  addBranch(): void {
    this.router.navigate(['/dashboard/branches/form/new/0']);
  }

  viewBranch(id: number): void {
    this.router.navigate([`/dashboard/branches/form/view/${id}`]);
  }

  editBranch(id: number): void {
    this.router.navigate([`/dashboard/branches/form/edit/${id}`]);
  }

  async deleteBranch(id: number, branchName: string): Promise<void> {
    if (!confirm(`¿Estás seguro de eliminar la sucursal "${branchName}"?`)) {
      return;
    }

    this.loading = true;
    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/api/v1/branches/${id}`)
      );
      this.toast.success('Sucursal eliminada correctamente');
      this.loadBranches();
    } catch (error: any) {
      console.error('Error al eliminar sucursal:', error);
      this.toast.error(error.error?.message || 'Error al eliminar sucursal');
    } finally {
      this.loading = false;
    }
  }

  async toggleStatus(branch: Branch): Promise<void> {
    try {
      const updatedBranch = { ...branch, active: !branch.active };
      await firstValueFrom(
        this.http.put(`${environment.apiUrl}/api/v1/branches/${branch.id}`, updatedBranch)
      );
      this.toast.success(
        `Sucursal ${updatedBranch.active ? 'activada' : 'desactivada'} correctamente`
      );
      this.loadBranches();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      this.toast.error('Error al cambiar estado de la sucursal');
    }
  }

  getStatusClass(active: boolean): string {
    return active
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }

  getStatusText(active: boolean): string {
    return active ? 'Activa' : 'Inactiva';
  }
}
