import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCropperPage } from './image-cropper.page';

describe('ImageCropperPage', () => {
  let component: ImageCropperPage;
  let fixture: ComponentFixture<ImageCropperPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageCropperPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageCropperPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
