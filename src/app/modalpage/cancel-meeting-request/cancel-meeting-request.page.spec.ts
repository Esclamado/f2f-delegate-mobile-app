import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelMeetingRequestPage } from './cancel-meeting-request.page';

describe('CancelMeetingRequestPage', () => {
  let component: CancelMeetingRequestPage;
  let fixture: ComponentFixture<CancelMeetingRequestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelMeetingRequestPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelMeetingRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
