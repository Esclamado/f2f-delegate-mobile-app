import { TestBed } from '@angular/core/testing';

import { EventFeedbackService } from './event-feedback.service';

describe('EventFeedbackService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventFeedbackService = TestBed.get(EventFeedbackService);
    expect(service).toBeTruthy();
  });
});
