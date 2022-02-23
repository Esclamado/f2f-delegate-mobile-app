import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMeetingRequestListEnhancePage } from './event-meeting-request-list-enhance.page';

describe('EventMeetingRequestListEnhancePage', () => {
  let component: EventMeetingRequestListEnhancePage;
  let fixture: ComponentFixture<EventMeetingRequestListEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventMeetingRequestListEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventMeetingRequestListEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
