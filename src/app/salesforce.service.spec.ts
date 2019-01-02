import { TestBed } from '@angular/core/testing';

import { SalesforceService } from './salesforce.service';

describe('SalesforceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SalesforceService = TestBed.get(SalesforceService);
    expect(service).toBeTruthy();
  });
});
