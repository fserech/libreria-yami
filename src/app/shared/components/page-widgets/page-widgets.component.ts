import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-widgets',
  templateUrl: './page-widgets.component.html',
  styleUrls: ['./page-widgets.component.scss'],
})
export class PageWidgetsComponent  implements OnInit {

  @Input() widgets: any[];

  constructor() { }

  ngOnInit() {}

}
