import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page-widgets',
  templateUrl: './page-widgets.component.html',
  styleUrls: ['./page-widgets.component.scss'],
})
export class PageWidgetsComponent  implements OnInit {

  widgets: any[] = [];

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    const moduleParam = this.route.snapshot.params['module'];
    console.log('el nombre del modulo es:', moduleParam);
  }
}
