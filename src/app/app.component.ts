import { Component } from '@angular/core';

import { Platform, ModalController, Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { EnvService } from 'src/app/lib/env.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { Storage } from '@ionic/storage';
import { FCM } from '@ionic-native/fcm/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Badge } from '@ionic-native/badge/ngx';
import { EventMeetingRequestListPage } from 'src/app/modalpage/event-meeting-request-list/event-meeting-request-list.page';
import { ChatboxPage } from 'src/app/modalpage/chatbox/chatbox.page';
import { SchedulesService } from 'src/app/services/schedules.service';
import { NotificationService } from 'src/app/services/notification.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private env: EnvService,
    private router: Router,
    private screenOrientation: ScreenOrientation,
    private storage: Storage,
    public fcm: FCM,
    private network: Network,
    private badge: Badge,
    public modalController: ModalController,
    public sched: SchedulesService,
    public notificationService : NotificationService,
    private events: Events,
    private eventService: EventService,
  ) {
    this.initializeApp();
  }

  /**
   * update message badge count
   * by event id
   */
  messageBadgeCount(data){
    if(data.push_action == 'message'){
      /** todo update msg badge count */
      let thisData = JSON.parse(data.data);

      console.log('pumasok sa message badge count', data);

      if(!this.env.unread_msg['event_'+thisData.event_id]){
        this.env.unread_msg['event_'+thisData.event_id] = {
          convos: {},
          unread_msg_convo: 0
        }
      }
      let convoId = thisData.chat_conversation_id;

      console.log('if sa badge', this.env.unread_msg['event_'+thisData.event_id].convos['convo_'+convoId]);
      if(!this.env.unread_msg['event_'+thisData.event_id].convos['convo_'+convoId]){
        this.env.unread_msg['event_'+thisData.event_id].convos['convo_'+convoId] = true;
        this.env.unread_msg['event_'+thisData.event_id].unread_msg_convo++;
      }
      this.storage.set('unread_msg', this.env.unread_msg);
      console.log('unread msg received from push', this.env.unread_msg);
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.storage.ready().then(() => {

        if(this.env.production_mode){
          this.badge.clear();

          console.log('push production_mode',this.env.production_mode);
          this.fcm.onNotification().subscribe(data => {
            console.log('push notif',data);
            //this.storage.set('toastClicked', 1);
            let thisData = JSON.parse(data.data);

            this.messageBadgeCount(data);
            this.badge.increase(1);
            this.getSchedules(thisData.event_id);

            if(data.wasTapped == true){
              console.log("Received in background");

              if(data.push_action == 'message'){

                // var a = new Promise(resolve => {
                //   this.router.navigate(['/']);
                //   this.router.navigate(['tabs/event/'+thisData.event_id]);
                  
                //   setInterval(f => {
                //     if()
                //   }, 500);

                //   resolve(true);
                // });
                //this.router.navigate(['/']);
                console.log('fdsfsdfsfsds',thisData);
                this.router.navigate(['/']);

                // setTimeout(() => {
                //   this.router.navigate(['tabs/event/'+thisData.event_id]);
                // }, 1000);
                setTimeout(() => {
                  if(data.event_type && data.event_type == 2){

                    this.router.navigate(['enhance-tabs/event-enhance/'+thisData.event_id]);
    
                  }else{
  
                    this.router.navigate(['tabs/event/'+thisData.event_id]);
  
                  }

                  this.showChatbox(thisData);

                }, 2000);

              }else{
                //this.router.navigate(['tabs/notification/'+thisData.event_id]);
                if((data.data_type == 'set_meeting_request' || data.data_type == 'reschedule_meeting_request') && (thisData.meeting_schedule && thisData.meeting_schedule.status == '2')){
                  this.env.storage.get('meeting_request_count').then((count) => {
                    this.events.publish('meeting_request_count', count++, Date.now());
                  });
                }

                console.log('fdsfsdfsfsds',thisData);
                this.router.navigate(['/']);

                if(data.event_type && data.event_type == 2){

                  this.router.navigate(['enhance-tabs/event-enhance/'+thisData.event_id]);


                }else{

                  this.router.navigate(['tabs/event/'+thisData.event_id]);

                }


                this.env.storage.get('notification_count').then((count) => {
                  if(count > 0){
                    this.events.publish('notification_count', count++, Date.now());
                  }else{
                    this.events.publish('notification_count', 1, Date.now());
                  }
                });

                setTimeout(() => {
                  this.redirectPage(thisData, data.data_type, data.push_action);
                }, 2000);

                //this.router.navigate(['/']);
              }

            } else {
              console.log("Received in foreground");
              let url;
              if(data.push_action == 'message'){

                this.storage.get('chatbox_active').then((cbox) => {

                  url = 'tabs/chat/'+thisData.event_id;

                  if(cbox){

                    this.env.presentToastWobutton(data.body);

                  }else{

                    this.env.presentToastWithOptions(data.body, url, data);

                    this.events.subscribe('toast_chat_clicked', (res, time) => {
                      this.storage.get('toastClicked').then((count) => {
                        console.log('toastClicked', count);
                        console.log('push_click_counter', this.env.push_click_counter);
                        if(this.env.push_click_counter == 0){
                          this.env.push_click_counter++;
                          if(count){
                            console.log('rrrre  chat',thisData);

                            setTimeout(() => {
                              this.storage.remove('toastClicked');

                              if(thisData.event_type && thisData.event_type == 2){
                                
                                this.router.navigate(['enhance-tabs/event-enhance/'+thisData.event_id]);
                                
                              }else{

                                this.router.navigate(['tabs/chat/'+thisData.event_id]);

                              }
                              this.router.navigate(['tabs/chat/'+thisData.event_id]);
                              this.showChatbox(thisData);
                            }, 500);

                          }
                        }
                      });
                    });
                  }
                });

              }else{

                url = 'tabs/notification/'+thisData.event_id;
                this.env.presentToastWithOptions(data.body, url, data);
                
                if((data.data_type == 'set_meeting_request' || data.data_type == 'reschedule_meeting_request') && (thisData.meeting_schedule && thisData.meeting_schedule.status == '2')){
                  this.env.storage.get('meeting_request_count').then((count) => {
                    this.events.publish('meeting_request_count', count++, Date.now());
                  });
                }

                this.env.storage.get('notification_count').then((count) => {
                  if(count > 0){
                    this.events.publish('notification_count', count++, Date.now());
                  }else{
                    this.events.publish('notification_count', 1, Date.now());
                  }
                });

                console.log('navigate_fore',thisData);

                this.events.subscribe('toast_notif_clicked', (res, time) => {
                  this.storage.get('toastClicked').then((count) => {
                    console.log('toastClicked', count);
                    if(count){
                      setTimeout(() => {
                        if(thisData.event_type && thisData.event_type == 2){
                                
                          this.router.navigate(['enhance-tabs/event-enhance/'+thisData.event_id]);
                          
                        }else{

                          this.router.navigate(['tabs/chat/'+thisData.event_id]);

                        }
                         this.redirectPage(thisData, data.data_type, data.push_action);
                      }, 500);
                    }
                  });
                });
              }
            };
          });
        }

        // watch network for a disconnection
        this.network.onDisconnect().subscribe(() => {
          console.log('network was disconnected :-(');
          this.env.toast('No internet connection');
        });

        // watch network for a connection
        this.network.onConnect().subscribe(() => {
          console.log('network connected!');
          // this.env.toast('Connected to a network', 'toastsuccess');
          // We just got a connection but we need to wait briefly
           // before we determine the connection type. Might need to wait.
          // prior to doing any api requests as well.
          setTimeout(() => {
            if (this.network.type === 'wifi') {
              console.log('we got a wifi connection, woohoo!');
            }
          }, 2000);
        });

        this.storage.get('token').then((token) => {
          console.log('appcomponenttoken',token);
          if(token){
            this.storage.get('Devicetoken').then((devicetoken) => {
              console.log('appcomponentdevicetoken',devicetoken);
              if(devicetoken){
                this.env.devicetoken = devicetoken;
                this.env.token = token;
                this.storage.get('delegate').then((data) => {
                  if(data){

                    /** get the unread message from from */
                    this.storage.get('unread_msg').then((unread_msg) => {
                      console.log('unread_msg initializeApp', unread_msg);
                      if(unread_msg){
                        this.env.unread_msg = unread_msg;
                      }
                    });

                    if(data.last_page == '1'){
                      this.env.redirect('/changepassword');
                    }else if(data.last_page == '2'){
                      this.env.redirect('/edit-profile-info');
                    }else{
                      this.env.redirect('/');
                    }
                  } else {
                    this.storage.remove('token');
                    this.router.navigate(['/login']);
                  }
                });
              }
            });
          } else {
            this.env.removeAllStorage().then(data => {
              this.router.navigate(['/login']);
            });
          }
        });

        setTimeout(f => {
          this.statusBar.styleDefault();
          this.statusBar.backgroundColorByHexString("#ffffff");
          this.splashScreen.hide();
        }, 3000);

        // set to landscape
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      });
    });
  }

  redirectPage(data, data_type, type){
    // if(data.status == '2'){
      
    //   let formData = {
    //     id: data.id
    //   };
      
    //   this.notificationService.changeStatusNotification(formData)
    //   .subscribe(r => {
    //     data.status = '1';

    //     this.env.storage.get('notification_count').then((count) => {
    //       this.events.publish('notification_count', count--, Date.now());
    //     });
    //   });
    // }
    
    this.storage.remove('toastClicked');
    this.env.storage.get('notification_count').then((count) => {
      if(count > 0){
        this.events.publish('notification_count', count--, Date.now());
      }
    });

    if((data_type == 'set_meeting_request' || data_type == 'reschedule_meeting_request') && (data.meeting_schedule && data.meeting_schedule.status == '2')){
      this.showRequestListModal(data);
    }else if(data.meeting_schedule){
      if(data.meeting_schedule.status == '1'){
        if(data_type == 'delegate_pending_noshow') {

          let thisData = {
            id: data.meeting_schedule.time_slot_id,
            date: data.time_slot.milli_date
          };

          this.env.storage.set('notif_date_milli', data.time_slot.milli_date);
          this.router.navigate(['/tabs/event/'+data.event_id]);
          setTimeout(() => {
            this.events.publish('tabs-scheduled-timeslot',thisData, Date.now());
          }, 500);
        } 
        else if(data_type == 'approve_noshow') {
          this.router.navigate(['/noshow-delegates/' + data.event_id]);
        }
        else {
          this.gotoDelegateMeetingDetails(data.meeting_schedule);
          // let thisData = {
          //   id: data.meeting_schedule.time_slot_id,
          //   date: data.time_slot.milli_date
          // };
          // //this.env.storage.set('from_notification', true);
          // this.env.storage.set('notif_date_milli', data.time_slot.milli_date);
          // this.router.navigate(['/tabs/event/'+data.event_id]);
          // setTimeout(() => {
          //   this.events.publish('tabs-scheduled-timeslot',thisData, Date.now());
          // }, 500);
        }
      }else if(data.meeting_schedule.status == '6'){
        this.env.toast('The meeting schedule is reschedule to other timeslot.');
      }else if(data.meeting_schedule.status == '8'){
        this.env.toast('The meeting schedule is occupied by the other delegate');
      } else {

        let thisData = {
          id: data.meeting_schedule.time_slot_id,
          date: data.time_slot.milli_date
        };
        //this.env.storage.set('from_notification', true);
        if(data.inline_link.link){
          this.router.navigate([data.inline_link.link]);
        }else{
          this.router.navigate(['/tabs/event/'+data.event_id]);
        }
        this.env.storage.set('notif_date_milli', data.time_slot.milli_date);
        setTimeout(() => {
          this.events.publish('tabs-scheduled-timeslot',thisData, Date.now());
        }, 500);

      }
    }else if(type == 'time_slot'){
      let thisData = {
        id: data.time_slot.id,
        date: data.time_slot.milli_date
      };

      this.env.storage.set('notif_date_milli', data.time_slot.milli_date);
      this.router.navigate(['/tabs/event/'+data.event_id]);
      setTimeout(() => {
        this.events.publish('tabs-scheduled-timeslot',thisData, Date.now());
      }, 500);

    }else if(type == 'meeting_notes'){
      this.env.storage.remove('from_meeting_details');
      this.router.navigate([data.url]);
    }else if(type == 'cancel_meeting'){

      let thisData = {
        id: data.meeting_schedule.time_slot_id,
        date: data.time_slot.milli_date
      };
      //this.env.storage.set('from_notification', true);
      this.env.storage.set('notif_date_milli', data.time_slot.milli_date);
      this.router.navigate(['/tabs/event/'+data.event_id]);
      setTimeout(() => {
        this.events.publish('tabs-scheduled-timeslot',thisData, Date.now());
      }, 500);

    }else{
      //this.env.toast(data.data.data_type);
    }
  }

  getSchedules(event_id){
    this.sched.getSchedules(event_id)
    .subscribe(r => {
      if(r.error == 0){
        this.env.storage.set('event_schedules', r.data);
      }
    });
  }
  /**
  * open a modal
  * the list of request for particular timeslot
  */
  async showRequestListModal(data) {
    let meeting_schedule = data.meeting_schedule;
    let ts = data.time_slot;

    if(meeting_schedule){
      let day = {
        'formatted': ts.formated_date
      };

      let timeslot = {
        'id': meeting_schedule.time_slot_id,
        'start_time': ts.formated_start_time,
        'end_time': ts.formated_end_time,
      };

      const modal = await this.modalController.create({
        component: EventMeetingRequestListPage,
        componentProps: {
          day: day,
          timeslot: timeslot,
          from_page: 'notification'
        }
      });

      modal.present();
      const { data } = await modal.onDidDismiss();
      if(data){
      }
    }
  }

  async showChatbox(data){
    
    this.storage.remove('toastClicked');
    console.log('showChatbox');

    if(data.my_id && data.chat_with_id){

      /** 
       * decrement the number of unread messages 
       * and set it on storage
       */
      console.log('this.env.unread_msg',this.env.unread_msg['event_'+data.event_id]);
      if(this.env.unread_msg['event_'+data.event_id]){
        console.log(this.env.unread_msg['event_'+data.event_id].convos['convo_'+data.chat_conversation_id]);
        if(this.env.unread_msg['event_'+data.event_id].convos['convo_'+data.chat_conversation_id]){
          delete this.env.unread_msg['event_'+data.event_id].convos['convo_'+data.chat_conversation_id];
          this.env.unread_msg['event_'+data.event_id].unread_msg_convo--;

          this.env.storage.set('unread_msg', this.env.unread_msg);
        }
      }

      console.log('rhan',this.env.chatSocket.convo);
    
      const modal = await this.modalController.create({
        component: ChatboxPage,
        componentProps: {
          my_id: data.chat_with_id,
          chat_with_id: data.my_id,
          event_id: data.event_id,
          convo: data.chat_conversation_id
        }
      });
  
      modal.present();
    }
  }

  gotoDelegateMeetingDetails(meeting_schedule){
    this.env.storage.get('event_schedules').then((schedule) => {

      let meeting_details = null;
      let data = null;
      schedule.forEach((sched, idx) => {
        sched.filter_date = this.getDateFormat(sched);
        if(sched.schedules){
          sched.schedules.forEach((timeslot) => {
            if(timeslot.data){
              if(timeslot.data.id == meeting_schedule.time_slot_id){
                meeting_details = timeslot.data;
                data = sched;
                
                meeting_details.filter_date = this.getDateFormat(data);
                meeting_details.milisec = data.milisec;

                let edid = meeting_details.meeting_schedule.delegate1;
                if(meeting_details.meeting_schedule.delegate1 == meeting_details.event_delegate_id){
                  edid = meeting_details.meeting_schedule.delegate2;
                }
                let delegate = {
                  edid: edid,
                  fullname: meeting_details.meeting_schedule.delegate_fullname
                }

                let event = {
                  schedules: schedule,
                  event_id: meeting_details.event_id,
                  delegate_id: meeting_details.event_delegate_id,
                  delegate: delegate
                }

                this.eventService.env.storage.set('event_other_info', event);
                this.eventService.env.storage.set('meeting-details', meeting_details);
              
                let navigationExtras = {
                  queryParams: {
                    previous_page: 'notification_page'
                  }
                };
                this.router.navigate(['meeting-details'], navigationExtras);
              }
            }
          });
        }
      });
    });
  }

  getDateFormat(val){
    let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    let d = val.milisec * 1000;
    if(val.date){
      d = val.date
    }

    let _date = new Date(d);
    let month = months[_date.getMonth()];
    let day_name = dayNames[_date.getDay()];
    let date = _date.getDate();
    let year = _date.getFullYear();

    return day_name+', '+month+' '+date+', '+year;
  }
}
