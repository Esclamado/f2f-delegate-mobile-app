import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReScheduleMeetingEnhancePage } from './re-schedule-meeting-enhance.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const routes: Routes = [
  {
    path: '',
    component: ReScheduleMeetingEnhancePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    IonicSelectableModule,
    FontAwesomeModule
  ],
  declarations: [ReScheduleMeetingEnhancePage]
})
export class ReScheduleMeetingEnhancePageModule {}
