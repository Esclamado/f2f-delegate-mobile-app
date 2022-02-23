import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, Events } from '@ionic/angular';
import { SchedulesService } from 'src/app/services/schedules.service';
import { EventMeetingRequestListPage } from 'src/app/modalpage/event-meeting-request-list/event-meeting-request-list.page';
import { EnvService } from 'src/app/lib/env.service';
import { TimezoneService } from 'src/app/services/timezone.service';
import { ClockService } from 'src/app/lib/clock.service';

@Component({
  selector: 'app-event-meeting-request-enhance',
  templateUrl: './event-meeting-request-enhance.page.html',
  styleUrls: ['./event-meeting-request-enhance.page.scss'],
})
export class EventMeetingRequestEnhancePage implements OnInit {

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
  
  delegate: any = null;

  d1_timezoneOffset: string = 'qweqweq';
  d2_timezoneOffset: string = '';

  d1_timezone: string = '';
  d2_timezone: string = '';  
  
  userTimezone: string = '';
  eventTinezone: string = '';

  clockService: any = null;

  constructor(
    protected _route: ActivatedRoute,
    private sched: SchedulesService,
    public modalCtrl: ModalController,
    public eventListener: Events,
    private env: EnvService,
    public timezoneService: TimezoneService,
  ) {

    this.clockService = new ClockService();

    eventListener.subscribe('update_delegate_profile', (res, time) => {
      console.log('eventListener', res);
      this.d1_timezoneOffset = this.setTimezoneOffset(res.timezone);
      this.d1_timezone = this.setTimezone(res.timezone);
      this.delegate = res;

      this.userTimezone = this.timezoneService.getTimezoneName(res.timezone);
      this.eventTinezone = this.timezoneService.getTimezoneName(this.event.time_zone);
    });

    this.setTimezones();
  }

  ngOnInit() {
    this.setTimezones();

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
      this.sched.getMeetingRequest(this.event_id, tab, true)
        .subscribe(r => {
          if(r.error == 0){
            this.days = r.data;
            this.meeting_request[tab] = r.data;
            this.request_count[tab] = 0;
            if(!firstLoad){
              this.setMSmonths();
              this.modifyDays();
              this.setMSDay();
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
  setMSmonths() {
    if (this.event) {
      let days = this.event.days;

      let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      //let firstConverted = new Date(days[0].milisec * 1000).toLocaleString('en-US', {timeZone: this.d1_timezone});
      //let firstConverted = new Date(days[0].a_date_orig + " " + this.event.start_time).toLocaleString('en-US', {timeZone: this.d1_timezone});

      let first = new Date(days[0].a_date_orig + " " + this.event.start_time);

      //let lastConverted = new Date(days[days.length - 1].milisec * 1000).toLocaleString('en-US', {timeZone: this.d1_timezone});
      //let lastConverted = new Date(days[days.length - 1].a_date_orig + " " + this.event.start_time).toLocaleString('en-US', {timeZone: this.d1_timezone});

      let last = new Date(days[days.length - 1].a_date_orig + " " + this.event.start_time);

      // let first = new Date(firstConverted);
      // let last = new Date(lastConverted);

      this.clockService = new ClockService();
      let first1 = new Date(days[0].a_date_orig + "T" + this.clockService.convertTo24Hrs(this.event.start_time) + ':00Z');
      let last1 = new Date(days[days.length - 1].a_date_orig + "T" + this.clockService.convertTo24Hrs(this.event.start_time) + ':00Z');

      let mon = '';
      if (first1.getMonth() == last1.getMonth()) {
        mon += months[first1.getMonth()];
      } else {
        mon += months[first1.getMonth()] + " - " + months[last1.getMonth()];
      }

      this.monthName = mon;
    }

    console.log('monthName', this.monthName);
  }

  /**
   * set the days that will be used as days tabs
  */
  setMSDay() {
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

  modifyDays() {
    console.log('old day', this.days);
    let counter = 0;
    console.log("event days after format", this.d1_timezone);
    console.log("event days after format", this.event);
    let newArray = [];
    let array = this.days.forEach(res => {
      let date = new Date(res.a_date_orig + " " + this.event.start_time).toLocaleString('en-US', { timeZone: this.d1_timezone });
      let convertedDate = new Date(date);
      let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      let day = days[convertedDate.getDay()];
      this.days[counter]['dayNameV'] = day;
      this.days[counter]['dateV'] = convertedDate.getDate();
      counter++;
    });
    console.log('new day', this.days);
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
  
  setTimezones() {
    console.log('pumasok sa setTimezones');
    this.env.storage.get('delegate').then((data) => {
      console.log('setTimezones setTimezones',data);
      this.d1_timezoneOffset = this.setTimezoneOffset(data.timezone);
      this.d1_timezone = this.setTimezone(data.timezone);
    });
  }

  setTimezonesIOS(ss) {
    this.env.storage.get('delegate').then((data) => {
    });
  }

  setTimezoneOffset(timezone) {
    timezone = timezone.split('(');
    let timezoneOffset = timezone[1].slice(4, -1);
    return timezoneOffset;
  }

  setTimezone(timezone) {
    timezone = timezone.split(":");
    timezone = timezone[0].trim();
    return timezone;
  }
}