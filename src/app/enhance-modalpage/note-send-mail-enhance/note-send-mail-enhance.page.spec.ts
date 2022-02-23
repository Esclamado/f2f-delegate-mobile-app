import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteSendMailEnhancePage } from './note-send-mail-enhance.page';

describe('NoteSendMailEnhancePage', () => {
  let component: NoteSendMailEnhancePage;
  let fixture: ComponentFixture<NoteSendMailEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoteSendMailEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteSendMailEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
