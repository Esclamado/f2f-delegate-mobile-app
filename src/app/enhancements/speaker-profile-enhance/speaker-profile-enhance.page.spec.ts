import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakerProfileEnhancePage } from './speaker-profile-enhance.page';

describe('SpeakerProfileEnhancePage', () => {
  let component: SpeakerProfileEnhancePage;
  let fixture: ComponentFixture<SpeakerProfileEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeakerProfileEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeakerProfileEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
