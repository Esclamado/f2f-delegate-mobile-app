import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EventNotesEnhancePage } from './event-notes-enhance.page';
import { NgxMasonryModule } from 'ngx-masonry';

const routes: Routes = [
  {
    path: '',
    component: EventNotesEnhancePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NgxMasonryModule
  ],
  declarations: [EventNotesEnhancePage]
})
export class EventNotesEnhancePageModule {}
