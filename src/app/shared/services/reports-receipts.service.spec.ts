import { TestBed } from '@angular/core/testing';

import { ReportsReceiptsService } from './reports-receipts.service';

describe('ReportsReceiptsService', () => {
  let service: ReportsReceiptsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportsReceiptsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
