import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SpeakerProfilePage } from './speaker-profile.page';

const routes: Routes = [
  {
    path: '',
    component: SpeakerProfilePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SpeakerProfilePage]
})
export class SpeakerProfilePageModule {}
