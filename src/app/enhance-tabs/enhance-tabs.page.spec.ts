import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnhanceTabsPage } from './enhance-tabs.page';

describe('EnhanceTabsPage', () => {
  let component: EnhanceTabsPage;
  let fixture: ComponentFixture<EnhanceTabsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnhanceTabsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnhanceTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
