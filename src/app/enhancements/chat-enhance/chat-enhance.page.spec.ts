import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatEnhancePage } from './chat-enhance.page';

describe('ChatEnhancePage', () => {
  let component: ChatEnhancePage;
  let fixture: ComponentFixture<ChatEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
