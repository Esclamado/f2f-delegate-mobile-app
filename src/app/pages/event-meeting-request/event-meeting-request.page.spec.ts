import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMeetingRequestPage } from './event-meeting-request.page';

describe('EventMeetingRequestPage', () => {
  let component: EventMeetingRequestPage;
  let fixture: ComponentFixture<EventMeetingRequestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventMeetingRequestPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventMeetingRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
