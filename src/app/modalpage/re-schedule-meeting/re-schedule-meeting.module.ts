import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReScheduleMeetingPage } from './re-schedule-meeting.page';

import { IonicSelectableModule } from 'ionic-selectable';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const routes: Routes = [
  {
    path: '',
    component: ReScheduleMeetingPage
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
  declarations: [ReScheduleMeetingPage]
})
export class ReScheduleMeetingPageModule {}
