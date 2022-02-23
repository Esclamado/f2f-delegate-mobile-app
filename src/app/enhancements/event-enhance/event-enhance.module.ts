import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EventEnhancePage } from './event-enhance.page';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HideHeaderDirective } from "src/app/hide-header.directive"
import { PipesModule } from 'src/app/pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: EventEnhancePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    PipesModule
  ],
  declarations: [EventEnhancePage]
})
export class EventEnhancePageModule {}
