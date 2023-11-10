import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { REPORTS_SALES_COLLECION_NAME } from 'src/app/shared/constants/collections-name-firebase';
import { DashboardService } from 'src/app/shared/services/dashboard/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast/toast.service';
import { ReportSalesService } from '../../services/report-sales.service';
import { Color } from '@swimlane/ngx-charts';

export var single = [
  {
    "name": "Germany",
    "value": 8940000
  },
  {
    "name": "USA",
    "value": 5000000
  },
  {
    "name": "France",
    "value": 7200000
  }
];

export var multi = [
  {
    "name": "Germany",
    "series": [
      {
        "name": "2010",
        "value": 7300000
      },
      {
        "name": "2011",
        "value": 8940000
      }
    ]
  },

  {
    "name": "USA",
    "series": [
      {
        "name": "2010",
        "value": 7870000
      },
      {
        "name": "2011",
        "value": 8270000
      }
    ]
  },

  {
    "name": "France",
    "series": [
      {
        "name": "2010",
        "value": 5000002
      },
      {
        "name": "2011",
        "value": 5800000
      }
    ]
  }
];

@Component({
  selector: 'app-kpi-earnings',
  templateUrl: './kpi-earnings.component.html',
  styleUrls: ['./kpi-earnings.component.scss'],
})
export class KpiEarningsComponent  implements OnInit, AfterViewChecked {


  barChartData: any[] = [
    // {
    //   name: 'Enero',
    //   value: 50,
    // },
    // {
    //   name: 'Febrero',
    //   value: 75,
    // },
    // {
    //   name: 'Marzo',
    //   value: 30,
    // },
  ];

  data = [
    {
      name: 'Septiembre',
      series: [
        {
          name: 'Semana 1',
          value: 43
        },
        {
          name: 'Semana 2',
          value: 73
        },
        {
          name: 'Semana 3',
          value: 66
        },
        {
          name: 'Semana 4',
          value: 60
        },
      ]
    },
    {
      name: 'Octubre',
      series: [
        {
          name: 'Semana 1',
          value: 48
        },
        {
          name: 'Semana 2',
          value: 68
        },
        {
          name: 'Semana 3',
          value: 56
        },
        {
          name: 'Semana 4',
          value: 34
        },
        {
          name: 'Semana 5',
          value: 78
        },
      ]
    },
    {
      name: 'Noviembre',
      series: [
        {
          name: 'Semana 1',
          value: 55
        },
        {
          name: 'Semana 2',
          value: 44
        },
        {
          name: 'Semana 3',
          value: 32
        },
        {
          name: 'Semana 4',
          value: 60
        },
        {
          name: 'Semana 5',
          value: 45
        }
      ]
    },
  ];
  view: [number, number] = [500, 300];
  yAxisLabel: string = 'Cantidad';
  xAxisLabel: string = 'Semanas';

 constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private dashboardService: DashboardService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private reportSalesService: ReportSalesService) {
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit() {
    this.getSalesLastMonth();
  }

  getSalesLastMonth(){
    const today: Date = new Date();
    const initDate: Date = new Date();
    const endDate: Date = new Date();
    initDate.setMonth(today.getMonth() - 2);
    initDate.setDate(1);

    this.reportSalesService.getSalesLastFewMonths(REPORTS_SALES_COLLECION_NAME, initDate, endDate, 'init', 'WEEK').subscribe({
      next: (response: any[]) => {

        const currentDate: Date = new Date();
        const montLastOneTxt: string = `${currentDate.getFullYear()}-${currentDate.getMonth()}-1`;
        const montLastTwoTxt: string = `${currentDate.getFullYear()}-${currentDate.getMonth()-1}-1`;

        console.log('Noviembre: ', currentDate.getMonth()+1);
        console.log('Octubre: ', montLastOneTxt);
        console.log('Septiembre: ', montLastTwoTxt);
        const currentMonth: Date = new Date();
        const montLastOne: Date = new Date(montLastOneTxt);
        const montLastTwo: Date = new Date(montLastTwoTxt);
        this.barChartData = [];
        this.barChartData[0] = {name: this.getNameMonth(currentMonth), value: 0};
        this.barChartData[1] = {name: this.getNameMonth(montLastOne), value: 0};
        this.barChartData[2] = {name: this.getNameMonth(montLastTwo), value: 0};

        response.forEach((reportWeek: any) => {

          const date: Date = new Date(reportWeek.init.seconds * 1000);

          if(date.getMonth() === currentMonth.getMonth()){
            this.barChartData[0].value += parseFloat(reportWeek.total);
          }
          if(date.getMonth() === montLastOne.getMonth()){
            this.barChartData[1].value += parseFloat(reportWeek.total);
          }
          if(date.getMonth() === montLastTwo.getMonth()){
            this.barChartData[2].value += parseFloat(reportWeek.total);
          }
        });
        console.log(this.barChartData);
      },
      error: (error: any) => {
        this.toastService.error('Ocurrio un error al obtener datos!');
      }
    });
  }

  getNameMonth(date: Date) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    console.log(meses[date.getMonth()]);
    return meses[date.getMonth()];
  }

}
