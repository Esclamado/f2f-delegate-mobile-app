import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { EnvService } from '../lib/env.service';
import { EventService } from '../services/event.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-enhance-tabs',
  templateUrl: './enhance-tabs.page.html',
  styleUrls: ['./enhance-tabs.page.scss'],
})
export class EnhanceTabsPage implements OnInit {
  event_id : any = null;
  selectedTabs: any = 'event-enhance';
  total_unread_notif: any = 0;
  /* total_unread_msg: any = 0; */
  total_unread_meeting: any = 0;
  event: any = null;
  constructor(
    public notificationService: NotificationService,
    public events: Events,
    public env: EnvService,
    public eventService: EventService
    ) { 
      events.subscribe('notification_count', (n_count, time) => {
        
        console.log('notification count should change here!');

        this.env.storage.set('notification_count', n_count);
        this.total_unread_notif = n_count;
      });
  
      events.subscribe('meeting_request_count', (n_count, time) => {
        console.log('ai ai ai', n_count);
        this.env.storage.set('meeting_request_count', n_count);
        this.total_unread_meeting = n_count;
      });
    }

  ngOnInit() {
    this.getEventId();
    //console.log('tabs.page');
    this.env.storage.get('event').then((data) => {
      //console.log('rhan',data);
      if(data){
        this.event = data;
        if(this.event.total_meeting_request){
          console.log('fdsfsfsfasdfasfas');
          this.events.publish('meeting_request_count', this.event.total_meeting_request, Date.now());
        }
      }
    });
  }
 getEventId(){
    let path = window.location.pathname.split("/");
    if(typeof path[3] != 'undefined'){
      this.event_id = path[3];

      let thisGetForm = {
        event_id: this.event_id
      };

      this.notificationService.getUnreadCount(thisGetForm)
      .subscribe(d => {
        if(d.error == 0){

          this.total_unread_notif = d.g_count;

          console.log('total unread notif', d.g_count);
          console.log('total unread notif data', d);

          this.env.storage.set('notification_count', this.total_unread_notif);
          //console.log('notification count test', this.total_unread_notif);
        }
      });
    }
  }

  tabChange(e){
    this.selectedTabs = e.tab;
    let type;
    if(e.tab == 'notification'){
      type = 'notifications';
      this.events.publish('notification_count', 0, Date.now());

      let formData = {
        event_id: this.event_id
      };
      this.notificationService.changeStatusNotification(formData)
      .subscribe(r => {
        console.log(r);
      });
      
    }else if(e.tab == 'chat'){
      type = 'messages';
    }else if(e.tab == 'event-settings'){
      this.env.storage.get('event').then((data) => {
        console.log('rhan',data);
        if(data){
          this.event = data;
          if(this.event.total_meeting_request){
            console.log('fdsfsfsfasdfasfas');
            this.events.publish('meeting_request_count', this.event.total_meeting_request, Date.now());
          }
        }
      });
    }

    if(type){
      let formData = {
        'event_id': this.event_id,
        'type': type,
        'platform': this.env.getPlatform(),
      };

      this.eventService.saveFeatureComparison(formData)
      .subscribe(r => {
        if(r.error == 0){
          console.log('featuecomparison', r);
        }
      });
    }
    /* if(e.tab == 'chat'){
      if(this.env.chatSocket.unread_msg['event_'+this.event_id]){
        this.env.chatSocket.unread_msg['event_'+this.event_id].convos = {};
        this.env.chatSocket.unread_msg['event_'+this.event_id].unread_msg_convo = 0;
      }
    } */ 
  }
}
