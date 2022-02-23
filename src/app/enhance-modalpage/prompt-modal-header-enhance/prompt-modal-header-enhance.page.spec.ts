import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptModalHeaderEnhancePage } from './prompt-modal-header-enhance.page';

describe('PromptModalHeaderEnhancePage', () => {
  let component: PromptModalHeaderEnhancePage;
  let fixture: ComponentFixture<PromptModalHeaderEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromptModalHeaderEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptModalHeaderEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
