import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationEnhancePage } from './notification-enhance.page';

describe('NotificationEnhancePage', () => {
  let component: NotificationEnhancePage;
  let fixture: ComponentFixture<NotificationEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
