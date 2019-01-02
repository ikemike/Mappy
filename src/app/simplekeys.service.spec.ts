import { TestBed } from '@angular/core/testing';

import { SimplekeysService } from './simplekeys.service';

describe('SimplekeysService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SimplekeysService = TestBed.get(SimplekeysService);
    expect(service).toBeTruthy();
  });
});
