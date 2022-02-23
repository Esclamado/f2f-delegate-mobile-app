import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatboxEnhancePage } from './chatbox-enhance.page';

describe('ChatboxEnhancePage', () => {
  let component: ChatboxEnhancePage;
  let fixture: ComponentFixture<ChatboxEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatboxEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatboxEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
