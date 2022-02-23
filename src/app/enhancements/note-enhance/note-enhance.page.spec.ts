import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteEnhancePage } from './note-enhance.page';

describe('NoteEnhancePage', () => {
  let component: NoteEnhancePage;
  let fixture: ComponentFixture<NoteEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoteEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
