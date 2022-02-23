import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventEnhancePage } from './event-enhance.page';

describe('EventEnhancePage', () => {
  let component: EventEnhancePage;
  let fixture: ComponentFixture<EventEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
