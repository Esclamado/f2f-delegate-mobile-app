import { Component, OnInit } from '@angular/core';

import { NotificationService } from 'src/app/services/notification.service';
import { EventService } from 'src/app/services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvService } from 'src/app/lib/env.service';
import { ModalController } from '@ionic/angular';
import { EventMeetingRequestListPage } from 'src/app/modalpage/event-meeting-request-list/event-meeting-request-list.page';
import { Events } from '@ionic/angular';
import { SchedulesService } from 'src/app/services/schedules.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  public event_id: any = 0;

  notifications: any = null;
  notification_current_page: any = 1;
  notification_total_page: any = 0;
  total_notification_count: any = 0;
  notification_infiniteScroll: any;
  moreNotification: boolean = true;

  constructor(
    public notificationService : NotificationService,
    protected _route: ActivatedRoute,
    private env: EnvService,
    private eventService: EventService,
    private router: Router,
    public modalController: ModalController,
    private events: Events,
    private sched: SchedulesService,
  ) { }

  ngOnInit() {
    this.env.storage.set('notif_active', true);
    this._route.paramMap.subscribe( url_param =>{
      this.event_id = url_param.get('event_id');
      this.getSchedules();
      this.getNotification();
    });
  }

  doRefresh(e) {
    this.getSchedules();
    this.notifications = null;
    this.notification_current_page = 1;
    this.notification_total_page = 0;
    this.total_notification_count = 0;
    this.getNotification(null, e);
  }

  getNotification(infiniteScroll?, refresher?){
    let thisGetForm = {
      event_id: this.event_id,
      page: this.notification_current_page,
    };

    this.notificationService.getNotification(thisGetForm)
    .subscribe(d => {
      console.log('notifs: ', d);
      if(d.error == 0){
        this.notification_current_page = d.data.current_page;
        this.notification_total_page = d.data.total_page;
        this.total_notification_count = d.data.total_count;

        if(!infiniteScroll) {
          this.notifications = []; 
        }

        if(d['data']['datas'].length > 0){
          d['data']['datas'].forEach((cat, idx) => {
            this.notifications.push(cat);
          });
        }

        if(refresher){
          refresher.target.complete();
        }

        if(infiniteScroll){
          this.notification_infiniteScroll.target.complete();
        }
      }
    });
  }

  loadData(){
    this.notification_infiniteScroll = event;
    this.notification_current_page += 1;
    if(this.notification_current_page <= this.notification_total_page) {
      this.moreNotification = true;
      this.getNotification(this.notification_infiniteScroll);
    } else {
      this.moreNotification = false;
    } 
  }

  redirectPage(data){
    if(data.status == '2'){
      
      let formData = {
        id: data.id
      };
      
      this.notificationService.changeStatusNotification(formData)
      .subscribe(r => {
        data.status = '1';

        this.env.storage.get('notification_count').then((count) => {
          if(count > 0){
            this.events.publish('notification_count', count--, Date.now());
          }
        });
      });
    }
    
    if((data.data.data_type == 'set_meeting_request' || data.data.data_type == 'reschedule_meeting_request') && (data.meeting_schedule && data.meeting_schedule.status == '2')){
      this.showRequestListModal(data);
    
    }else if(data.meeting_schedule){
      if(data.meeting_schedule.status == '1'){
        if(data.data.data_type == 'delegate_pending_noshow') {
          this.router.navigate([data.url]);
        } 
        else if(data.data.data_type == 'approve_noshow') {
          this.router.navigate(['/noshow-delegates/' + data.data.event_id]);
        }
        else {
          this.gotoDelegateMeetingDetails(data.meeting_schedule);
          // let thisData = {
          //   id: data.meeting_schedule.time_slot_id,
          //   date: data.time_slot.milli_date
          // };
          // //this.env.storage.set('from_notification', true);
          // this.env.storage.set('notif_date_milli', data.time_slot.milli_date);
          // this.router.navigate(['/tabs/event/'+data.data.event_id]);
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
          this.router.navigate(['/tabs/event/'+data.data.event_id]);
        }
        this.env.storage.set('notif_date_milli', data.time_slot.milli_date);
        setTimeout(() => {
          this.events.publish('tabs-scheduled-timeslot',thisData, Date.now());
        }, 500);

      }
    
    }else if(data.type == 'time_slot'){
      let thisData = {
        id: data.time_slot.id,
        date: data.time_slot.milli_date
      };

      this.env.storage.set('notif_date_milli', data.time_slot.milli_date);
      this.router.navigate(['/tabs/event/'+data.data.event_id]);
      setTimeout(() => {
        this.events.publish('tabs-scheduled-timeslot',thisData, Date.now());
      }, 500);

    }else if(data.type == 'meeting_notes'){
      this.env.storage.remove('from_meeting_details');
      this.router.navigate([data.url]);
    }else if(data.type == 'cancel_meeting'){

      let thisData = {
        id: data.meeting_schedule.time_slot_id,
        date: data.time_slot.milli_date
      };
      //this.env.storage.set('from_notification', true);
      this.env.storage.set('notif_date_milli', data.time_slot.milli_date);
      this.router.navigate(['/tabs/event/'+data.data.event_id]);
      setTimeout(() => {
        this.events.publish('tabs-scheduled-timeslot',thisData, Date.now());
      }, 500);
    }else{
      //this.env.toast(data.data.data_type);
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
                  event_id: this.event_id,
                  delegate_id: meeting_details.event_delegate_id,
                  delegate: delegate
                }

                this.eventService.env.storage.set('event_other_info', event);
                this.eventService.env.storage.set('meeting-details', meeting_details);
                
                console.log('meeting_details', meeting_details);
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

  getSchedules(){
    this.sched.getSchedules(this.event_id)
    .subscribe(r => {
      if(r.error == 0){
        this.eventService.env.storage.set('event_schedules', r.data);
      }
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
