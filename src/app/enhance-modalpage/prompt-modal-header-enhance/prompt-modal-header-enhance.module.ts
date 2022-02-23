import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PromptModalHeaderEnhancePage } from './prompt-modal-header-enhance.page';

const routes: Routes = [
  {
    path: '',
    component: PromptModalHeaderEnhancePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PromptModalHeaderEnhancePage]
})
export class PromptModalHeaderEnhancePageModule {}
