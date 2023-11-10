/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ReportSalesService } from './report-sales.service';

describe('Service: ReportSales', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportSalesService]
    });
  });

  it('should ...', inject([ReportSalesService], (service: ReportSalesService) => {
    expect(service).toBeTruthy();
  }));
});
