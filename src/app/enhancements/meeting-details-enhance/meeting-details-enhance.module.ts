import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PipesModule } from 'src/app/pipes/pipes.module';

import { MeetingDetailsEnhancePage } from './meeting-details-enhance.page';

import { NgCircleProgressModule } from 'ng-circle-progress';

const routes: Routes = [
  {
    path: '',
    component: MeetingDetailsEnhancePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    PipesModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 60,
      space: -20,
      outerStrokeWidth: 20,
      innerStrokeWidth: 20,
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
      lazy: false,
      outerStrokeLinecap: "square",
    })
  ],
  declarations: [MeetingDetailsEnhancePage]
})
export class MeetingDetailsEnhancePageModule {}
