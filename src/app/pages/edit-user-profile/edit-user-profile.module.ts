import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IonicSelectableModule } from 'ionic-selectable';
import { ImageCropperModule } from 'ngx-image-cropper';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";

import { EditUserProfilePage } from './edit-user-profile.page';

const routes: Routes = [
  {
    path: '',
    component: EditUserProfilePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    IonicSelectableModule,
    ImageCropperModule,
    GooglePlaceModule
  ],
  declarations: [EditUserProfilePage]
})
export class EditUserProfilePageModule {}
