import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelMeetingRequestEnhancePage } from './cancel-meeting-request-enhance.page';

describe('CancelMeetingRequestEnhancePage', () => {
  let component: CancelMeetingRequestEnhancePage;
  let fixture: ComponentFixture<CancelMeetingRequestEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelMeetingRequestEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelMeetingRequestEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
