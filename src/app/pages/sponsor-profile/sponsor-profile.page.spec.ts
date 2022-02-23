import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorProfilePage } from './sponsor-profile.page';

describe('SponsorProfilePage', () => {
  let component: SponsorProfilePage;
  let fixture: ComponentFixture<SponsorProfilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SponsorProfilePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SponsorProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
