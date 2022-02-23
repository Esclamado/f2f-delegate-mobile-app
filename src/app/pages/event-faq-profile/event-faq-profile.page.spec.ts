import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFaqProfilePage } from './event-faq-profile.page';

describe('EventFaqProfilePage', () => {
  let component: EventFaqProfilePage;
  let fixture: ComponentFixture<EventFaqProfilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventFaqProfilePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventFaqProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
