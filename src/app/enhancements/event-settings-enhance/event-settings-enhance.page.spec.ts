import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSettingsEnhancePage } from './event-settings-enhance.page';

describe('EventSettingsEnhancePage', () => {
  let component: EventSettingsEnhancePage;
  let fixture: ComponentFixture<EventSettingsEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventSettingsEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSettingsEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
