import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FilterDelegateEnhancePage } from './filter-delegate-enhance.page';

const routes: Routes = [
  {
    path: '',
    component: FilterDelegateEnhancePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FilterDelegateEnhancePage]
})
export class FilterDelegateEnhancePageModule {}
