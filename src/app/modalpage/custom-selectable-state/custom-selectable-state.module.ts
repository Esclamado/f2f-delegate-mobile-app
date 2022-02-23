import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CustomSelectableStatePage } from './custom-selectable-state.page';

const routes: Routes = [
  {
    path: '',
    component: CustomSelectableStatePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FontAwesomeModule
  ],
  declarations: [CustomSelectableStatePage]
})
export class CustomSelectableStatePageModule {}
