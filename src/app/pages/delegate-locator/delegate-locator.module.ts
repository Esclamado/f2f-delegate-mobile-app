import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DelegateLocatorPage } from './delegate-locator.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
//import { SafeHtmlPipe } from 'src/app/safe-html.pipe';
import { PipesModule } from 'src/app/pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: DelegateLocatorPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    PipesModule,
  ],
  declarations: [DelegateLocatorPage]
})
export class DelegateLocatorPageModule {}
