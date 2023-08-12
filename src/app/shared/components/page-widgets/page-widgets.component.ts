import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocaleFilesJsonService } from '../../services/locale-files-json/locale-files-json.service';
import { Role } from 'src/app/dashboard/users-roles/models/role';
import { ROLES_COLLECTION_NAME } from '../../constants/collections-name-firebase';

@Component({
  selector: 'app-page-widgets',
  templateUrl: './page-widgets.component.html',
  styleUrls: ['./page-widgets.component.scss'],
})
export class PageWidgetsComponent  implements OnInit {

  widgets: any[] = [];
  role: Role;

  constructor(private route: ActivatedRoute, private localFileService: LocaleFilesJsonService) { }

  ngOnInit() {
    // console.log('El módulo obtenido es:', this.getModuleRoute());
    this.getPermissionModuleUser(this.getModuleRoute())
  }

  getModuleRoute(): string{
    return this.route.snapshot.params['module'];
  }

  getPermissionModuleUser(module: string){
    console.log('modue es:', module)
  }


}

// this.localFileService.getAssetFile('super-admin.json').subscribe({
//   next: (role: Role) => {
//     console.log('role', role);
//     this.role = role;
//   },
//   error: error => {console.log(error);}
// })

// saveDocumentFirestore(){
//   this.localFileService.saveDocument(ROLES_COLLECTION_NAME, this.role).then(
//     (response: any) => {console.log('response: ', response)},
//     (error: any) => {console.log('error: ', error)}
//   )
// }
