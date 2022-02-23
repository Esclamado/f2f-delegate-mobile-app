import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventNotesPage } from './event-notes.page';

describe('EventNotesPage', () => {
  let component: EventNotesPage;
  let fixture: ComponentFixture<EventNotesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventNotesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventNotesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
