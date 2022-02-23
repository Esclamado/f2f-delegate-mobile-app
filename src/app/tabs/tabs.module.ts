import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { IonicModule } from '@ionic/angular';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children:[
        //{ path: 'event/:event_id', loadChildren: './pages/event/event.module#EventPageModule' },
        { path: 'event/:event_id', loadChildren: 'src/app/pages/event/event.module#EventPageModule' },
        { path: 'chat/:event_id', loadChildren: 'src/app//pages/chat/chat.module#ChatPageModule' },
        { path: 'notification/:event_id', loadChildren: 'src/app//pages/notification/notification.module#NotificationPageModule' },
        { path: 'event-settings/:event_id', loadChildren: 'src/app//pages/event-settings/event-settings.module#EventSettingsPageModule' }
    ]
  },
  {
    path:'',
    redirectTo:'src/app/pages/event-settings/event-settings.module#EventSettingsPageModule',
    pathMatch:'full'
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FontAwesomeModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
