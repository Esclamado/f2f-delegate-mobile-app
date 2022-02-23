import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';
import { SchedulesService } from 'src/app/services/schedules.service';
import { PromptModalEnhancePage } from 'src/app/enhance-modalpage/prompt-modal-enhance/prompt-modal-enhance.page';
import { last } from 'rxjs/operators';
import { EnvService } from 'src/app/lib/env.service';
import { ClockService } from 'src/app/lib/clock.service';

@Component({
  selector: 'app-re-schedule-meeting-enhance',
  templateUrl: './re-schedule-meeting-enhance.page.html',
  styleUrls: ['./re-schedule-meeting-enhance.page.scss'],
})
export class ReScheduleMeetingEnhancePage implements OnInit {

    /** var for re-scheduling of meeting the making a request */
    @Input() re_sched_request: boolean = false;
    @Input() meeting: any = null; /** this is actually the timeslot */
    @Input() event_details: any = null; /** this is actually event_details */
    
    selectedSlot: any = {id: null};
    filter_date: any = {id: null};
    /** end var for re-scheduling of meeting the making a request */
    
  
    @Input() schedules: any = null;
    @Input() delegate: any = null;
    @Input() event_id: any = null;
    @Input() delegate_id: any = null;
    @Input() dateTime: any = null;
    @Input() timeslot: any = null;
    @Input() delegate_timezone: any = null;
    
  
    collectingData: boolean = null;
    selectedDay: any = null;
    timeslots: any = [];

    delegateTimezone: string = '';
    timezoneOffset: string = '';
    
    counter: any = 0;
    clockService: any = null;

  constructor(
    public modalCtrl: ModalController,
    public sched: SchedulesService,
    public events: Events,
    public env: EnvService,
  ) { 
   this.clockService =  new ClockService();
  }

  ngOnInit() {
    let _date = null;
    if(this.meeting){
      _date = this.meeting.date;
      this.timeslot = this.meeting;
    }

    this.formatCurrentDate(_date);
    
    if(this.schedules){
      
      
      let sched = [];
      this.setTimezone(this.delegate_timezone);
      //console.log("this is the regrouped schedule", this.sched.regroupSchedule(this.schedules, this.delegateTimezone));
      //this.schedules = this.sched.regroupSchedule(this.schedules, this.delegateTimezone);
      this.schedules.forEach(val => {
        if(this.dateTime === val.date){
          this.selectedDay = val;
          this.selectableChange({value: val}, 'event_date');
        }
        
        if(val.event_current_date <= val.milisec && val.schedules[0] != undefined){
          //console.log('this is the datetime to be converted', val.filter_dateV);
          val.filter_dateV = this.formatDateTime(val.date);
          sched.push(val);
        }
      });
      this.schedules = sched;
      //console.log('list of schedules',this.schedules);
      //console.log('delegate data', this.schedules);

      
    }

    this.setTimezoneOffset(this.delegate_timezone);
  }


  setTimezone(fullTimezone){
    fullTimezone = fullTimezone.split(':');
    fullTimezone = fullTimezone[0].trim();
    this.delegateTimezone = fullTimezone;
  }

  setTimezoneOffset(timezone){
    // Europe/Berlin : (UTC +02:00)
    timezone = timezone.split('(');
    let timezoneOffset = timezone[1].slice(4, -1);
    this.timezoneOffset = timezoneOffset;
    //console.log("timezone offset", this.timezoneOffset);
  }

  formatDateTime(dateToConvert){
    let timezone = this.delegate_timezone;
    //console.log("delegate's timezone", timezone);
    timezone = timezone.split(':');
    timezone = timezone[0].trim();
    this.delegateTimezone = timezone;

    //console.log(timezone);

    // let date = new Date(dateToConvert).toLocaleString('en-US', {timeZone: timezone});
    // let newdate = new Date(date);

    let newdate = new Date(dateToConvert);

    //console.log(date);

    let months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let dateTimeVirtual = {
      mon: months[newdate.getMonth()],
      day: days[newdate.getDay()],
      date: newdate.getDate(),
      year: newdate.getFullYear(),
    }

    let datestring = dateTimeVirtual['day'] + ", " + dateTimeVirtual['mon'] + " " + dateTimeVirtual['date'] + ", " + dateTimeVirtual['year'] + " " + timezone;
    
    return datestring;
  }

  //for reschedule date
  formatDateTime2 (dateToConvert){
    let timezone = this.delegate_timezone;
    //console.log("delegate's timezone", timezone);
    timezone = timezone.split(':');
    timezone = timezone[0].trim();
    this.delegateTimezone = timezone;

    //console.log(timezone);

    let date = new Date(dateToConvert).toLocaleString('en-US', {timeZone: timezone});
    let newdate = new Date(date);

    //let newdate = new Date(dateToConvert);

    //console.log(date);

    let months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let dateTimeVirtual = {
      mon: months[newdate.getMonth()],
      day: days[newdate.getDay()],
      date: newdate.getDate(),
      year: newdate.getFullYear(),
    }

    let datestring = dateTimeVirtual['day'] + ", " + dateTimeVirtual['mon'] + " " + dateTimeVirtual['date'] + ", " + dateTimeVirtual['year'] + " " + timezone;
    
    return datestring;
  }

    /**
   * format the current selected date before this 
   * re-schedule
   */
  formatCurrentDate(_date_:any = null){
    if(this.dateTime){
      let _date = this.dateTime.mon + ' ' + this.dateTime.date + ' ' + this.dateTime.year;
      let d = new Date(_date);

      this.dateTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }
    if(_date_ && !this.dateTime){
      this.dateTime = _date_;
    }
  }

  dismiss(data=null){
    this.modalCtrl.dismiss(data);
  }


  selectableChange(e, event_date) {

    console.log('what is this e?', e);

    let dateMili = e.value.milisec;
    let edid = 0;

    if(typeof this.delegate.ed_id != 'undefined'){
      edid = this.delegate.ed_id;
    }
    if(typeof this.delegate.edid != 'undefined'){
      edid = this.delegate.edid;
    }

    let param = {
      date: dateMili,
      event_id: this.event_id,
      delegate1: this.delegate_id,
      delegate2: edid,
    }

    this.filter_date = e.value.filter_date

    this.timeslots = [];
    this.collectingData = e;

    this.sched.getAvailableTimeSlots(param)
      .subscribe(r => {
        this.setAvailables(r.data, e.value);
        this.collectingData = false;
      });
  }

  /**
   * set all the available slots
   */
  setAvailables(data, selectedDay){
    let event_current_time = selectedDay.event_current_time;
    let event_date = selectedDay.milisec;
    let scheds = selectedDay.schedules;
    // console.log("this is the data were looking for",data);
    // console.log("this is the selected day were looking for",selectedDay);
    data.forEach(as => {
      let availableTSid = as.id;
      //console.log("this is the scheds were looking for",scheds);
      scheds.forEach(val => {
        if(val.type == 'timeslot'){
          let ts = val.data;
          if(availableTSid == ts.id){
            //console.log('availability', event_current_time + "<" + ts.event_start_time_milisec);
            if(event_current_time < ts.event_start_time_milisec){
              if(!ts.meeting_schedule){
                 this.timeslots.push(ts);
               }
            }
          }
        }
      });
    });
    //this.setTimezoneOffset();
    //console.log('timeslots', this.timeslots);
  }

    /**
   * will set the selected timeslot
   * @param slot 
   */
  setTimeslot(slot){
    if(!this.re_sched_request){
      this.dismiss(slot);
    } else {
      this.selectedSlot = slot;
    }
  }

  /**
   * start re-schduling the meeting
   * will make a request to server
   */
  startScheduling(){

    //console.log(this.meeting);
    //console.log(this.meeting.start_time_stamp + ' > ' +this.sched.env.getnowDate(this.event_details, 'resched'));

    if(this.meeting.start_time_stamp > this.sched.env.getnowDate(this.event_details, 'resched')){

      this.counter++;
      if(this.counter == 1){
        this.counter++;   

        let formData = new FormData();
        formData.append('event_id', this.event_id);
        formData.append('time_slot_id', this.selectedSlot.id);
        formData.append('delegate_1', this.meeting.meeting_schedule.delegate1);
        formData.append('delegate_2', this.meeting.meeting_schedule.delegate2);
        formData.append('sched_id', this.meeting.meeting_schedule.id);
        formData.append('setter', this.meeting.meeting_schedule._setter);


        this.sched.virtualMeeting(formData)
          .subscribe(r => {
            this.counter = 0;
            if(r.error == 0){
              this.meeting.id = this.selectedSlot.id;
              this.meeting.created_at = this.selectedSlot.created_at;
              this.meeting.date = this.selectedSlot.date;
              this.meeting.end_time = this.selectedSlot.end_time;
              this.meeting.end_time_milisec = this.selectedSlot.end_time_milisec;
              this.meeting.filter_date = this.filter_date;
              this.meeting.start_time = this.selectedSlot.start_time;
              this.meeting.start_time_milisec = this.selectedSlot.start_time_milisec;

              this.showPostRequestResult(r.table);
            } else {
              this.sched.env.toast(r.message);
            }
        });
      }

    }else{

      this.sched.env.toast('Rescheduling a meeting is prohibited 2 hrs before the scheduled meeting.');
    }
  }

    /**
   * display the post request result
   */
  async showPostRequestResult(table) {
    let tableBadge = 'table text-white';
    let tableName = 'Table';

    if(table.type === "Booth"){
      tableBadge = 'table-booth text-white';
      tableName = 'Booth';
    }
    else if(table.type === "VIP"){
      tableBadge = 'table-vip text-default';
      tableName = 'VIP';
    }

    let ttl = 'Meeting successfully scheduled';
    if(this.re_sched_request){
      ttl = 'Meeting successfully rescheduled';
    }

    const modal = await this.modalCtrl.create({
      component: PromptModalEnhancePage,
      cssClass:'my-custom-modal-css',
      componentProps: {
        img_src: '/assets/icon/success-popup.png',
        title: ttl,
        msgHtml: `      
          <div class="text-default tC fs-15 i-flex">Please make sure to look presentable and be there on time.</div>`,
        btn_txt: 'Okay',
      }

      // <div class="text-default tC fs-15 i-flex">We have assigned this meeting on</div> 
      // <div class="chip `+tableBadge+` i-flex">`+tableName+` `+table.table_no+`</div> 
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    if(data == 'closed'){
      setTimeout(f => {
        if(this.event_details.meeting_request == 2){
          this.sched.env.storage.get('meeting_request_count').then((count) => {
            this.events.publish('meeting_request_count', count++, Date.now());
          });
        }
        this.dismiss();
      }, 10);
    }
  }

}
