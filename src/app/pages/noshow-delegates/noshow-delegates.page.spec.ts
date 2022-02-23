import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoshowDelegatesPage } from './noshow-delegates.page';

describe('NoshowDelegatesPage', () => {
  let component: NoshowDelegatesPage;
  let fixture: ComponentFixture<NoshowDelegatesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoshowDelegatesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoshowDelegatesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
