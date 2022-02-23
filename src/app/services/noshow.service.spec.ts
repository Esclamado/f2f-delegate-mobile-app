import { TestBed } from '@angular/core/testing';

import { NoshowService } from './noshow.service';

describe('NoshowService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NoshowService = TestBed.get(NoshowService);
    expect(service).toBeTruthy();
  });
});
