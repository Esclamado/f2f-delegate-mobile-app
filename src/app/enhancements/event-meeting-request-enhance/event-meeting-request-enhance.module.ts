import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EventMeetingRequestEnhancePage } from './event-meeting-request-enhance.page';

const routes: Routes = [
  {
    path: '',
    component: EventMeetingRequestEnhancePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EventMeetingRequestEnhancePage]
})
export class EventMeetingRequestEnhancePageModule {}
