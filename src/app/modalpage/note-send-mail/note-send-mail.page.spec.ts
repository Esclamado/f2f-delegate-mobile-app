import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteSendMailPage } from './note-send-mail.page';

describe('NoteSendMailPage', () => {
  let component: NoteSendMailPage;
  let fixture: ComponentFixture<NoteSendMailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoteSendMailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteSendMailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
