import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptModalPage } from './prompt-modal.page';

describe('PromptModalPage', () => {
  let component: PromptModalPage;
  let fixture: ComponentFixture<PromptModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromptModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
