import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptModalHeaderPage } from './prompt-modal-header.page';

describe('PromptModalHeaderPage', () => {
  let component: PromptModalHeaderPage;
  let fixture: ComponentFixture<PromptModalHeaderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromptModalHeaderPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptModalHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
