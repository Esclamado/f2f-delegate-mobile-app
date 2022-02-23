import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReScheduleMeetingEnhancePage } from './re-schedule-meeting-enhance.page';

describe('ReScheduleMeetingEnhancePage', () => {
  let component: ReScheduleMeetingEnhancePage;
  let fixture: ComponentFixture<ReScheduleMeetingEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReScheduleMeetingEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReScheduleMeetingEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
