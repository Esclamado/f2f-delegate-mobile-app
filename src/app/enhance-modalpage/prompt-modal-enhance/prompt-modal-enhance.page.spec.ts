import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptModalEnhancePage } from './prompt-modal-enhance.page';

describe('PromptModalEnhancePage', () => {
  let component: PromptModalEnhancePage;
  let fixture: ComponentFixture<PromptModalEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromptModalEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptModalEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
