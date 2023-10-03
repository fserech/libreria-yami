import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/shared/services/toast/toast.service';
import { RolesService } from '../../services/roles.service';
import { Role } from '../../models/role';

@Component({
  selector: 'app-new-rol',
  templateUrl: './new-rol.component.html',
  styleUrls: ['./new-rol.component.scss'],
})
export class NewRolComponent implements OnInit {
  title: string = 'Nuevo Rol';
  roleForm: FormGroup;

  selectedPermissions: { [key: string]: boolean } = {};
  load: boolean = false;
  permissions: {
    inventory: any[];
    categories: any[];
    articles: any[];
    sales: any[];
    shopping: any[];
    usersRoles: any[];
    statistics: any[];
    cancellations: any[];
    brands: any[];
    products: any[];
  };

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private rolesService: RolesService // Asegúrate de inyectar el servicio correcto
  ) {
    this.roleForm = this.formBuilder.group({
      name: ['', Validators.required], // Campo de nombre del rol
      // Puedes agregar más campos si es necesario
    });

    // Aquí defines tus permisos, puedes copiar la estructura que proporcionaste
    this.permissions = {
      inventory: [],
      categories: [],
      articles: [],
      sales: [],
      shopping: [],
      usersRoles: [],
      statistics: [],
      cancellations: [],
      brands: [],
      products: [],
    };
  }

  ngOnInit() {
    // Inicializar los permisos aquí si es necesario
    this.initializePermissions();
  }

  // Método para inicializar los permisos, puedes cargarlos desde tu servicio si es necesario
  initializePermissions() {
    // Aquí debes cargar tus permisos desde tu servicio o fuente de datos
    // Por ejemplo, si los permisos vienen del servidor, puedes hacer una solicitud HTTP para obtenerlos
    // Luego, puedes asignar los permisos a this.permissions.inventory, this.permissions.categories, etc.
  }

  // Método para guardar el rol y sus permisos
  saveRoleData() {
    this.load = true;
    if (this.roleForm.valid) {
      const roleName = this.roleForm.value.name;
      const selectedPermissions = this.selectedPermissions;

      // Crear un objeto de rol con el nombre y los permisos seleccionados
      const newRole: Role = {
        key: Date.now().toString(),
        name: roleName,
        label: roleName,
        permissions: []
      };

      // Luego, puedes enviar el objeto `newRole` al servicio para crear el rol en tu sistema
      
    }
  }
}
