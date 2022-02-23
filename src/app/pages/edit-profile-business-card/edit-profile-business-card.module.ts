import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EditProfileBusinessCardPage } from './edit-profile-business-card.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// Import ng-circle-progress
import { NgCircleProgressModule } from 'ng-circle-progress';

const routes: Routes = [
  {
    path: '',
    component: EditProfileBusinessCardPage
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
      title: "2 of 3",
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
    })
  ],
  declarations: [EditProfileBusinessCardPage]
})
export class EditProfileBusinessCardPageModule {}
