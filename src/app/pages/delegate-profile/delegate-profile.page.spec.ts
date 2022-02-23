import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DelegateProfilePage } from './delegate-profile.page';

describe('DelegateProfilePage', () => {
  let component: DelegateProfilePage;
  let fixture: ComponentFixture<DelegateProfilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelegateProfilePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DelegateProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
