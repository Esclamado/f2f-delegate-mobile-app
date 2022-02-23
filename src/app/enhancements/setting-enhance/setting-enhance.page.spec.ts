import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingEnhancePage } from './setting-enhance.page';

describe('SettingEnhancePage', () => {
  let component: SettingEnhancePage;
  let fixture: ComponentFixture<SettingEnhancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingEnhancePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingEnhancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
