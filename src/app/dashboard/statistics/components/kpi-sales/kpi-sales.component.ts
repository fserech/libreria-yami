import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-kpi-sales',
  templateUrl: './kpi-sales.component.html',
  styleUrls: ['./kpi-sales.component.scss'],
})
export class KpiSalesComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  openBill(){
    // this.verifyBill('autorizacion', '64441082-AA9D-4E00-9F7D-CDB5C790DCF4', '100446329', '98595180', '02.00');
    this.verifyBill('autorizacion', '2BFF798C-0320-4D6C-B804-A25CF1EFA130', '98595180', '5448204', '6,583.00');
  }

  verifyBill(type: string, number: string, transmitter: string, receiver: string, amount: string) {
    const url = `https://felpub.c.sat.gob.gt/verificador-web/publico/vistas/verificacionDte.jsf?tipo=${type}&numero=${number}&emisor=${transmitter}&receptor=${receiver}&monto=${amount}`;
    window.open(url, '_blank');
  }
}
