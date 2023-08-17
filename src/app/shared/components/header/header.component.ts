import { Component, Input, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
// import { DashboardService } from '../../services/dashboard.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {

  @Input() title: string = 'Title';
  @Input() icon: string = '';
  @Input() showButtonBack: boolean = false;
  @Input() load: boolean = false;
  buttonBackText: string = 'Atras';

  constructor(private menuCtrl: MenuController) {}

  ngOnInit() {}

  showMenu() {
    this.menuCtrl.open();
  }

}
