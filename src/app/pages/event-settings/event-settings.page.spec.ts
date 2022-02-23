import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSettingsPage } from './event-settings.page';

describe('EventSettingsPage', () => {
  let component: EventSettingsPage;
  let fixture: ComponentFixture<EventSettingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventSettingsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
