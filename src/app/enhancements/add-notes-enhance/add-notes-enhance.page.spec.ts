import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNotesEnhancePage } from './add-notes-enhance.page';

describe('AddNotesEnhancePage', () => {
  let component: AddNotesEnhancePage;
  let fixture: ComponentFixture<AddNotesEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNotesEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNotesEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
