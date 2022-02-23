import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialMediaPage } from './social-media.page';

describe('SocialMediaPage', () => {
  let component: SocialMediaPage;
  let fixture: ComponentFixture<SocialMediaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocialMediaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialMediaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
