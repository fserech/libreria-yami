import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../../../shared/components/header/header.component";
import { SearchInputTextComponent } from '../../../../shared/components/search-input-text/search-input-text.component';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { NgClass } from '@angular/common';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ChatBubbleComponent } from '../../../../shared/components/chat-bubble/chat-bubble.component';
import { bootstrapChevronLeft, bootstrapChevronRight, bootstrapChevronBarLeft, bootstrapChevronBarRight } from '@ng-icons/bootstrap-icons';
import { matSearchOutline, matFilterAltOutline, matAddOutline, matArrowDownwardOutline, matArrowUpwardOutline, matDeleteOutline, matEditOutline, matVisibilityOutline } from '@ng-icons/material-icons/outline';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import BaseForm from '../../../../shared/classes/base-form';
import { URL_BRANCHES } from '../../../../shared/constants/endpoints';
import { OptionsChatBubble } from '../../../../shared/interfaces/options-chat-bubble';
import { CrudService } from '../../../../shared/services/crud.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { ACTIONS_GRID_MAIN_ADMIN } from '../../../../shared/constants/actions-menu';
import { BranchesFiltersDialogComponent } from '../branches-filters-dialog/branches-filters-dialog.component';
import { Branch } from '../../../../shared/interfaces/branch';

@Component({
  selector: 'app-branches-grid-main',
  standalone: true,
  templateUrl: './branches-grid-main.component.html',
  styleUrl: './branches-grid-main.component.scss',
  imports: [
    HeaderComponent,
    SearchInputTextComponent,
    NgIcon,
    ChatBubbleComponent,
    NgClass,
    DialogModule,
    FormsModule
  ],
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
      matVisibilityOutline,
      bootstrapChevronLeft,
      bootstrapChevronRight,
      bootstrapChevronBarLeft,
      bootstrapChevronBarRight
    })
  ]
})
export default class BranchesGridMainComponent extends BaseForm implements OnInit {
  form: FormGroup;
  users: { label: string, value: number }[] = [];
  actionsGrid: OptionsChatBubble[] = [];
  branches: Branch[] = [];

  constructor(
    private crud: CrudService,
    private toast: ToastService,
    private router: Router,
    public dialog: Dialog,
    private auth: AuthService,
    private bpo: BreakpointObserver
  ) {
    super(crud, toast, auth, bpo);
    this.sortConfig.sortBy = 'name';
    this.sortConfig.sortOrder = 'asc';
    this.crud.baseUrl = URL_BRANCHES;

    this.form = new FormGroup({
      id: new FormControl(),
      name: new FormControl(),
    });

    this.setupActionMenu();

    if (this.isAdmin()) {
      this.getUsers();
    }
  }

  ngOnInit(): void {
    this.initializePage();
  }

  private initializePage(): void {
    this.load = true;
    if (!this.isAdmin()) {
      this.filters = `&idUser=${this.getUserId()}`;
    }
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, this.filters);
  }

  private setupActionMenu(): void {
    if (this.isAdmin()) {
      this.actionsGrid = [
        { id: 0, action: 'view', label: 'Ver', icon: 'matVisibilityOutline' },
        { id: 0, action: 'edit', label: 'Editar', icon: 'matEditOutline' },
        { id: 0, action: 'delete', label: 'Eliminar', icon: 'matDeleteOutline' }
      ];
    } else {
      this.actionsGrid = [
        { id: 0, action: 'view', label: 'Ver', icon: 'matVisibilityOutline' },
        { id: 0, action: 'edit', label: 'Editar', icon: 'matEditOutline' }
      ];
    }
  }

  async openDialog(): Promise<void> {
    const darkmode = localStorage.getItem('theme');
    const dialogRef = this.dialog.open(BranchesFiltersDialogComponent, {
      backdropClass: ['bg-black/60', 'dark:bg-white'],
      panelClass: darkmode === 'dark' ?
        ['bg-slate-900', 'rounded-lg', 'text-gray-200', 'p-4'] :
        ['bg-white', 'rounded-lg', 'text-gray-500', 'p-4', 'border-b', 'border-slate-900'],
      width: this.getDialogWidth(),
      closeOnDestroy: true,
      data: {
        title: 'Filtros de sucursales',
        users: this.users
      },
    });

    try {
      const result: { name?: string, id?: number, idUser?: number } = await firstValueFrom(dialogRef.closed);
      if (result && (result.name || result.id || result.idUser)) {
        if (!this.isAdmin()) {
          result.idUser = this.getUserId();
        }
        this.filter(result.name, result.id, result.idUser);
      }
    } catch (error: any) {
      console.error('Error en diálogo de filtros:', error);
      this.toast.error('Error al aplicar filtros');
    }
  }

  initPage(): void {
    this.form.reset();
    let idUser: string = '';
    if (!this.isAdmin()) {
      idUser = `&idUser=${this.getUserId()}`;
    }
    this.filters = idUser;
    this.page = 1;
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, idUser);
  }

  selectOption(option: OptionsChatBubble): void {
    switch (option.action) {
      case 'delete':
        this.deleteId(option.id);
        break;
      case 'edit':
        this.edit(option.id);
        break;
      case 'view':
        this.view(option.id);
        break;
      default:
        console.warn('Acción no reconocida:', option.action);
    }
  }

  view(id: number): void {
    this.router.navigate([`/dashboard/branches/detail/view/${id}`]);
  }

  edit(id: number): void {
    this.router.navigate([`/dashboard/branches/detail/edit/${id}`]);
  }

  add(): void {
    this.router.navigate([`/dashboard/branches/detail/new`]);
  }

  introSearch(): void {
    const name: string = this.form.controls['name'].value;
    const idUser: number = !this.isAdmin() ? this.getUserId() : null;

    if (name && name.trim() !== '') {
      this.filter(name.trim(), null, idUser);
    } else {
      this.toast.info('Ingrese un nombre para buscar');
    }
  }

  filter(name?: string, id?: number, idUser?: number): void {
    let filter = '';

    if (id) {
      filter += `&id=${id}`;
    }
    if (name) {
      filter += `&name=${encodeURIComponent(name)}`;
    }
    if (idUser) {
      filter += `&idUser=${idUser}`;
    }

    this.filters = filter;
    this.page = 1; // Reiniciar a la primera página al filtrar
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, filter);
  }

  changeSortOrderBy(field: string): void {
    if (field === this.sortConfig.sortBy) {
      this.sortConfig.sortOrder = this.sortConfig.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortConfig.sortBy = field;
      this.sortConfig.sortOrder = 'asc';
    }
    this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, this.filters);
  }

  override async deleteId(id: number): Promise<void> {
    const confirmed = confirm('¿Está seguro que desea eliminar esta sucursal? Esta acción no se puede deshacer.');

    if (!confirmed) {
      return;
    }

    this.load = true;
    try {
      await firstValueFrom(await this.crud.deleteId(id));
      this.toast.success('Sucursal eliminada exitosamente');

      // Si eliminamos el último item de la página y no es la primera página, ir a la anterior
      if (this.ItemsList.length === 1 && this.page > 1) {
        this.page--;
      }

      this.getPageItems(this.sortConfig.sortOrder, this.sortConfig.sortBy, this.page, this.pageSize, this.filters);
    } catch (error: any) {
      console.error('Error al eliminar sucursal:', error);
      this.toast.error(error.error?.message || 'Error al eliminar la sucursal');
    } finally {
      this.load = false;
    }
  }

  isAdmin(): boolean {
    return this.auth?.getUserData()?.role === 'ROLE_ADMIN';
  }

  getUsers(): void {
    this.crud
      .getUsersForClients()
      .then((users: any[]) => {
        if (users && users.length > 0) {
          this.users = users.map((user: {
            email: string,
            id_users: number,
            name: string,
            role: string
          }) => ({
            label: user.name,
            value: user.id_users
          }));
        }
      })
      .catch((error: any) => {
        console.error('Error al obtener usuarios:', error);
        this.toast.error(error.error?.message || 'Error al cargar usuarios');
      });
  }

  getUserBranchTable(id: number): string {
    if (!id) return 'N/A';

    if (this.users.length > 0) {
      const user = this.users.find((user) => user.value === id);
      return user ? user.label : 'Usuario no encontrado';
    }
    return 'Cargando...';
  }

  getUserId(): number {
    return this.auth?.getUserData()?.id;
  }

  // Métodos auxiliares para el template
  get hasData(): boolean {
    return this.ItemsList && this.ItemsList.length > 0;
  }

  get isFirstPage(): boolean {
    return this.page === 1;
  }

  get isLastPage(): boolean {
    return this.page === this.totalPages;
  }
}
