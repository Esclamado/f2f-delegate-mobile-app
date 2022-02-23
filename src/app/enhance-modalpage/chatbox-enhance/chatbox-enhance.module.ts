import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChatboxEnhancePage } from './chatbox-enhance.page';

const routes: Routes = [
  {
    path: '',
    component: ChatboxEnhancePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ChatboxEnhancePage]
})
export class ChatboxEnhancePageModule {}
