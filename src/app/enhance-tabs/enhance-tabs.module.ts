import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EnhanceTabsPage } from './enhance-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: EnhanceTabsPage,
    children: [
      { path: 'event-enhance/:event_id', loadChildren: 'src/app/enhancements/event-enhance/event-enhance.module#EventEnhancePageModule' },
      { path: 'chat-enhance/:event_id', loadChildren: 'src/app/enhancements/chat-enhance/chat-enhance.module#ChatEnhancePageModule' },
      { path: 'notification-enhance/:event_id', loadChildren: 'src/app/enhancements/notification-enhance/notification-enhance.module#NotificationEnhancePageModule' },
      { path: 'event-settings-enhance/:event_id', loadChildren: 'src/app/enhancements/event-settings-enhance/event-settings-enhance.module#EventSettingsEnhancePageModule' }
    ]
  }, 
  {
    path:'',
    redirectTo:'./enhancements/event-settings-enhance/event-settings-enhance.module#EventSettingsEnhancePageModule',
    pathMatch:'full'
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EnhanceTabsPage]
})
export class EnhanceTabsPageModule {}
