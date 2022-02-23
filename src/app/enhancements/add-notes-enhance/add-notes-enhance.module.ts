import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AddNotesEnhancePage } from './add-notes-enhance.page';

const routes: Routes = [
  {
    path: '',
    component: AddNotesEnhancePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AddNotesEnhancePage]
})
export class AddNotesEnhancePageModule {}
