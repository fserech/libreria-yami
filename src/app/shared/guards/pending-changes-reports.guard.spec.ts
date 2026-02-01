import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { pendingChangesReportsGuard } from './pending-changes-reports.guard';

describe('pendingChangesReportsGuard', () => {
  const executeGuard: CanDeactivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => pendingChangesReportsGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
