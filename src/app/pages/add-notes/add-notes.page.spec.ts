import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNotesPage } from './add-notes.page';

describe('AddNotesPage', () => {
  let component: AddNotesPage;
  let fixture: ComponentFixture<AddNotesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNotesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNotesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
