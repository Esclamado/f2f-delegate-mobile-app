import { TestBed } from '@angular/core/testing';

import { EventFaqService } from './event-faq.service';

describe('EventFaqService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventFaqService = TestBed.get(EventFaqService);
    expect(service).toBeTruthy();
  });
});
