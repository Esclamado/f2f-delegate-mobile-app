import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDelegatePage } from './filter-delegate.page';

describe('FilterDelegatePage', () => {
  let component: FilterDelegatePage;
  let fixture: ComponentFixture<FilterDelegatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterDelegatePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterDelegatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
