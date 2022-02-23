import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PromptModalHeaderPage } from './prompt-modal-header.page';

const routes: Routes = [
  {
    path: '',
    component: PromptModalHeaderPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PromptModalHeaderPage]
})
export class PromptModalHeaderPageModule {}
