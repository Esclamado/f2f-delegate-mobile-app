import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFloorplanPage } from './event-floorplan.page';

describe('EventFloorplanPage', () => {
  let component: EventFloorplanPage;
  let fixture: ComponentFixture<EventFloorplanPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventFloorplanPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventFloorplanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
