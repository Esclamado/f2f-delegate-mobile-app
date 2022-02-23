import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventItineraryPage } from './event-itinerary.page';

describe('EventItineraryPage', () => {
  let component: EventItineraryPage;
  let fixture: ComponentFixture<EventItineraryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventItineraryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventItineraryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
