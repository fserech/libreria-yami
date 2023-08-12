/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LocaleFilesJsonService } from './locale-files-json.service';

describe('Service: LocaleFilesJson', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocaleFilesJsonService]
    });
  });

  it('should ...', inject([LocaleFilesJsonService], (service: LocaleFilesJsonService) => {
    expect(service).toBeTruthy();
  }));
});
