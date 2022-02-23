import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorProfileEnhancePage } from './sponsor-profile-enhance.page';

describe('SponsorProfileEnhancePage', () => {
  let component: SponsorProfileEnhancePage;
  let fixture: ComponentFixture<SponsorProfileEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SponsorProfileEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SponsorProfileEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
