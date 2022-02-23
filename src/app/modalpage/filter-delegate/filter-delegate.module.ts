import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FilterDelegatePage } from './filter-delegate.page';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IonicSelectableModule } from 'ionic-selectable';

const routes: Routes = [
  {
    path: '',
    component: FilterDelegatePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    IonicSelectableModule
  ],
  declarations: [FilterDelegatePage]
})
export class FilterDelegatePageModule {}
