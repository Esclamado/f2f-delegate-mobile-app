import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFilterPage } from './event-filter.page';

describe('EventFilterPage', () => {
  let component: EventFilterPage;
  let fixture: ComponentFixture<EventFilterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventFilterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventFilterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
