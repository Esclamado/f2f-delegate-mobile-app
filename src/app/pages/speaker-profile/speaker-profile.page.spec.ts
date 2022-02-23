import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakerProfilePage } from './speaker-profile.page';

describe('SpeakerProfilePage', () => {
  let component: SpeakerProfilePage;
  let fixture: ComponentFixture<SpeakerProfilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeakerProfilePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeakerProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
