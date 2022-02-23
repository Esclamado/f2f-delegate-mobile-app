import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventProfileEnhancePage } from './event-profile-enhance.page';

describe('EventProfileEnhancePage', () => {
  let component: EventProfileEnhancePage;
  let fixture: ComponentFixture<EventProfileEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventProfileEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventProfileEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
