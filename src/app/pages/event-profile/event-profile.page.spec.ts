import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventProfilePage } from './event-profile.page';

describe('EventProfilePage', () => {
  let component: EventProfilePage;
  let fixture: ComponentFixture<EventProfilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventProfilePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
