import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { pendingChangesReceiptsGuard } from './pending-changes-receipts.guard';

describe('pendingChangesReceiptsGuard', () => {
  const executeGuard: CanDeactivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => pendingChangesReceiptsGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
