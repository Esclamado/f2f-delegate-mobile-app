import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { SponsorProfileEnhancePage } from './sponsor-profile-enhance.page';

const routes: Routes = [
  {
    path: '',
    component: SponsorProfileEnhancePage
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
  declarations: [SponsorProfileEnhancePage]
})
export class SponsorProfileEnhancePageModule {}
