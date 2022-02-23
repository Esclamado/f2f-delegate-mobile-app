import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EditProfileInfoPage } from './edit-profile-info.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Import ng-circle-progress
import { NgCircleProgressModule } from 'ng-circle-progress';

const routes: Routes = [
  {
    path: '',
    component: EditProfileInfoPage
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
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 60,
      space: -10,
      outerStrokeWidth: 10,
      innerStrokeWidth: 10,
      title: "1 of 3",
      animateTitle: false,
      animation: true,
      animationDuration: 1000,
      showSubtitle: false,
      showUnits: false,
      showBackground: false,
      clockwise: true,
      startFromZero: false,
      showZeroOuterStroke: false,
      responsive: true,
      lazy: false
    })
  ],
  declarations: [EditProfileInfoPage]
})
export class EditProfileInfoPageModule {}
