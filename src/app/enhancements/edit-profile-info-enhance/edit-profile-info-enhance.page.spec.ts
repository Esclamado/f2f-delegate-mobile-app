import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfileInfoEnhancePage } from './edit-profile-info-enhance.page';

describe('EditProfileInfoEnhancePage', () => {
  let component: EditProfileInfoEnhancePage;
  let fixture: ComponentFixture<EditProfileInfoEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditProfileInfoEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProfileInfoEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
