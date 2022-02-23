import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileOptionPage } from './file-option.page';

describe('FileOptionPage', () => {
  let component: FileOptionPage;
  let fixture: ComponentFixture<FileOptionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileOptionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileOptionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
