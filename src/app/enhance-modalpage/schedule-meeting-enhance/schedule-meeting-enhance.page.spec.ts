import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleMeetingEnhancePage } from './schedule-meeting-enhance.page';

describe('ScheduleMeetingEnhancePage', () => {
  let component: ScheduleMeetingEnhancePage;
  let fixture: ComponentFixture<ScheduleMeetingEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleMeetingEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleMeetingEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
