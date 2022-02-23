import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatboxPage } from './chatbox.page';

describe('ChatboxPage', () => {
  let component: ChatboxPage;
  let fixture: ComponentFixture<ChatboxPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatboxPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatboxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
