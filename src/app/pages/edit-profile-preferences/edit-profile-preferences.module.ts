import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EditProfilePreferencesPage } from './edit-profile-preferences.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// Import ng-circle-progress
import { NgCircleProgressModule } from 'ng-circle-progress';
import { IonicSelectableModule } from 'ionic-selectable';

const routes: Routes = [
  {
    path: '',
    component: EditProfilePreferencesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 60,
      space: -10,
      outerStrokeWidth: 10,
      innerStrokeWidth: 10,
      title: "3 of 3",
      animateTitle: false,
      animationDuration: 1000,
      showSubtitle: false,
      showUnits: false,
      showBackground: false,
      clockwise: true,
      startFromZero: false,
      showZeroOuterStroke: false,
      responsive: true,
      lazy: false
    }),
    IonicSelectableModule
  ],
  declarations: [EditProfilePreferencesPage]
})
export class EditProfilePreferencesPageModule {}
