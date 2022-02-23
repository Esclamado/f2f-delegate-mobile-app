import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EventPage } from './event.page';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HideHeaderDirective } from "src/app/hide-header.directive"
import { PipesModule } from 'src/app/pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: EventPage
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
    
  ],
  declarations: [EventPage, HideHeaderDirective]
})
export class EventPageModule {}
