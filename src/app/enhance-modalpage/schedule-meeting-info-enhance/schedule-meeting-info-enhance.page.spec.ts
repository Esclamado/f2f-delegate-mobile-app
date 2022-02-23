import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleMeetingInfoEnhancePage } from './schedule-meeting-info-enhance.page';

describe('ScheduleMeetingInfoEnhancePage', () => {
  let component: ScheduleMeetingInfoEnhancePage;
  let fixture: ComponentFixture<ScheduleMeetingInfoEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleMeetingInfoEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleMeetingInfoEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
