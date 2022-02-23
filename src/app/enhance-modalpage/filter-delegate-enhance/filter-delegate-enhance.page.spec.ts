import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDelegateEnhancePage } from './filter-delegate-enhance.page';

describe('FilterDelegateEnhancePage', () => {
  let component: FilterDelegateEnhancePage;
  let fixture: ComponentFixture<FilterDelegateEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterDelegateEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterDelegateEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
