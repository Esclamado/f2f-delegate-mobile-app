import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLocationPage } from './event-location.page';

describe('EventLocationPage', () => {
  let component: EventLocationPage;
  let fixture: ComponentFixture<EventLocationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventLocationPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
