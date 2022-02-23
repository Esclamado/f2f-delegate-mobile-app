import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PromptModalEnhancePage } from './prompt-modal-enhance.page';

const routes: Routes = [
  {
    path: '',
    component: PromptModalEnhancePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PromptModalEnhancePage]
})
export class PromptModalEnhancePageModule {}
