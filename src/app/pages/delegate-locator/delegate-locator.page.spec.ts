import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DelegateLocatorPage } from './delegate-locator.page';

describe('DelegateLocatorPage', () => {
  let component: DelegateLocatorPage;
  let fixture: ComponentFixture<DelegateLocatorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelegateLocatorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DelegateLocatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
