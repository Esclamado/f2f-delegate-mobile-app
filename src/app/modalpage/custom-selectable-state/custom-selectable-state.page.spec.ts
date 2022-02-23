import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSelectableStatePage } from './custom-selectable-state.page';

describe('CustomSelectableStatePage', () => {
  let component: CustomSelectableStatePage;
  let fixture: ComponentFixture<CustomSelectableStatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomSelectableStatePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomSelectableStatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
