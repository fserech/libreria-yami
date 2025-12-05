import { TestBed } from '@angular/core/testing';

import { CrudClientsService } from './crud-clients.service';

describe('CrudClientsService', () => {
  let service: CrudClientsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrudClientsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
