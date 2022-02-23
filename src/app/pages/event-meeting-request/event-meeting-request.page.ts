import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, Events } from '@ionic/angular';
import { SchedulesService } from 'src/app/services/schedules.service';
import { EventMeetingRequestListPage } from 'src/app/modalpage/event-meeting-request-list/event-meeting-request-list.page';

@Component({
  selector: 'app-event-meeting-request',
  templateUrl: './event-meeting-request.page.html',
  styleUrls: ['./event-meeting-request.page.scss'],
})
export class EventMeetingRequestPage implements OnInit {

  /**
   * holds the event id
   */
  event_id:any = null;

  /**
   * holds which the the selected tabs
   */
  selectedtab: string = '';

  /**
   * holds the event data from storage
   */
  event: any = null;

  /** 
   * hold the selected event day
   */
  selected_ms_date: any = null;

  monthName: any = null;

  days:any = null;

  meeting_request = {
    received: null,
    sent: null
  }

  request_count = {
    received: 0,
    sent: 0
  }

  haveRequest: any = null;

  skeleton_loader: any = [
    { id: '1'},
    { id: '2'},
    { id: '3'}
  ]; 

  constructor(
    protected _route: ActivatedRoute,
    private sched: SchedulesService,
    public modalCtrl: ModalController,
    public events: Events
  ) {
  }

  ngOnInit() {
    this._route.paramMap.subscribe( url_param =>{
      this.event_id = url_param.get('event_id');

      this.days = null;
      this.sched.env.storage.get('event')
        .then(s => {
          this.event = s;
       });

      setTimeout(() => {
        this.selectTab('received');
      }, 1000);
       
      this.selectTab('sent', true);
    });
  }

  /**
   * set the selected tab
   * @param tab 
   */
  selectTab(tab, firstLoad=false){
    this.days = null;
    this.selectedtab = tab;
    this.haveRequest = 'pending';

    // if(!this.meeting_request[tab]){
      this.sched.getMeetingRequest(this.event_id, tab)
        .subscribe(r => {
          if(r.error == 0){
            this.days = r.data;
            this.meeting_request[tab] = r.data;
            this.request_count[tab] = 0;
            if(!firstLoad){
              this.setMSDay();
              this.setMSmonths();
              console.log('dsadsadsadaa',this.days);
            }
            this.countRequests(tab);
          } else {
            this.sched.env.toast(r.message);
          }
        });
    // } else {
    //   this.days = this.meeting_request[tab];
    //   this.setMSmonths();
    //   this.setMSDay();
    // }
  }

  /**
   * count the total request the save into a variable
   */
  countRequests(tab){
    let req = this.meeting_request[tab];
    req.forEach(day => {
      let slots = day.timeslots;
      slots.forEach(slot => {
        this.request_count[tab] += slot.meeting_schedule_count;
      });
    });
  }

  /**
   * set the selected day
   */
  selectDay(dayMilisec){
    this.selected_ms_date = dayMilisec;
    console.log('days',this.days);
  }

    /**
   * this will set the month to be diaplayed 
   * on meeting schedules
   */
  setMSmonths(){
    let days = this.days;


    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let first = new Date(days[0].milisec * 1000);
    let last = new Date(days[days.length - 1].milisec * 1000);
    
    let mon = '';
    if(first.getMonth() == last.getMonth()){
      mon += months[first.getMonth()];
    } else {
      mon += months[first.getMonth()] + " - " + months[last.getMonth()];
    }

    this.monthName = mon;
  }

  /**
   * set the days that will be used as days tabs
   */
  setMSDay(){
    let days = this.days;
    days.forEach((val, key) => {

      if(val.timeslots.length > 0){
        val.timeslots.forEach((timeslot, key1) => {
          if(timeslot.meeting_schedule_count > 0){
            val['can_dispay'] = true;
            this.haveRequest = true;
            
            if(!this.selected_ms_date){
              this.selected_ms_date = val.milisec;
            }
          }
        });
      }

      //let _date = new Date(val.milisec * 1000);
      let _date = new Date(val.formatted_date);

      let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      val.day_name = dayNames[_date.getDay()];
      val.date = _date.getDate();

      this.days[key] = val;
    });

    if(this.haveRequest == 'pending'){
      setTimeout(() => {
        this.haveRequest = false;
      }, 10);
    }
  }

  /**
   * open a modal
   * the list of request for particular timeslot
   */
  async showRequestListModal(day, timeslot) {
    console.log('day',day);
    console.log('timeslot',timeslot);

    if(timeslot.meeting_schedule_count > 0){
      const modal = await this.modalCtrl.create({
        component: EventMeetingRequestListPage,
        componentProps: {
          day: day,
          timeslot: timeslot,
          request_type: this.selectedtab
        }
      });

      modal.present();
      const { data } = await modal.onDidDismiss();
      if(data){
        this.meeting_request[this.selectedtab] = null;
        this.request_count[this.selectedtab] = 0;
        
        setTimeout(f=>{
          this.selectTab(this.selectedtab);
        }, 10);
      }
    }
  }
}
