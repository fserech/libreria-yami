import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Shopping } from 'src/app/shared/models/shopping';

@Component({
  selector: 'app-new-shopping',
  templateUrl: './new-shopping.component.html',
  styleUrls: ['./new-shopping.component.scss'],
})
export class NewShoppingComponent  implements OnInit {

  title: string = 'Nuevo Compra';
  form: FormGroup;
  load: boolean = false;
  copied: boolean = false;
  record: Shopping = null;
  recordAux: Shopping = null;

  constructor() { }

  ngOnInit() {}

}
