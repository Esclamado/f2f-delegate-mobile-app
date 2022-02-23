import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMeetingRequestListPage } from './event-meeting-request-list.page';

describe('EventMeetingRequestListPage', () => {
  let component: EventMeetingRequestListPage;
  let fixture: ComponentFixture<EventMeetingRequestListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventMeetingRequestListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventMeetingRequestListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
