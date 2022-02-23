import { Component, OnInit, Input } from '@angular/core';
import { ModalController, LoadingController, Events } from '@ionic/angular';
import { SchedulesService } from 'src/app/services/schedules.service';
import { PromptModalEnhancePage } from 'src/app/enhance-modalpage/prompt-modal-enhance/prompt-modal-enhance.page';
import { PromptModalHeaderEnhancePage } from 'src/app/enhance-modalpage/prompt-modal-header-enhance/prompt-modal-header-enhance.page';
import { ReScheduleMeetingEnhancePage } from 'src/app/enhance-modalpage/re-schedule-meeting-enhance/re-schedule-meeting-enhance.page';
import { EnvService } from 'src/app/lib/env.service';
import { ClockService } from 'src/app/lib/clock.service';

@Component({
  selector: 'app-schedule-meeting-info-enhance',
  templateUrl: './schedule-meeting-info-enhance.page.html',
  styleUrls: ['./schedule-meeting-info-enhance.page.scss'],
})
export class ScheduleMeetingInfoEnhancePage implements OnInit {

  @Input() timeslot: any = null;
  @Input() delegate: any = null;
  @Input() delegate_id: any = null;
  @Input() schedules: any = null;
  @Input() event: any = null;
  @Input() event_id: any = null;

  dateTime: any = null;
  dateTime2: any = null;
  dateTime2end: any = null;
  requestMessage: string = '';
  counter: any = 0;

  d1_timezoneOffset: string = 'qweqweq';
  d2_timezoneOffset: string = '';

  d1_timezone: string = 'Asia/Manila';
  d2_timezone: string = '';

  d1_timezone_full: string = '';

  clockService: any = null;

  constructor(
    public modalCtrl: ModalController,
    public sched: SchedulesService,
    public loadingCtrl: LoadingController,
    public events: Events,
    private env: EnvService
  ) { 
    this.clockService =  new ClockService();
  }

  ngOnInit() {

    //console.log("try if delegate will print", this.delegate);

    this.setTimezones();
    if(this.timeslot){
      this.formatDateTime();
    }
    
    
  }

  async setTimezones(){
    
    this.env.storage.get('delegate').then((data) => {
      this.d1_timezoneOffset = this.setTimezoneOffset(data.timezone);
      this.d1_timezone = this.setTimezone(data.timezone);
      this.d1_timezone_full = data.timezone;
      // console.log(this.d1_timezoneOffset + this.d2_timezoneOffset);
      // console.log('perfect', this.d1_timezone);
    });
    this.d2_timezoneOffset = this.setTimezoneOffset(this.delegate.timezone);    
    this.d2_timezone = this.setTimezone(this.delegate.timezone);

    let timezone = this.delegate.timezone;
    timezone = timezone.split(":");
    return timezone = timezone[0].trim();
  }
  dismiss(data=null){
    this.modalCtrl.dismiss(data);
  }
   /**
   * will format the time so that we can get 
   * the right formating for display
   */

  setTimezoneOffset(timezone){
      // Europe/Berlin : (UTC +02:00)
      if(timezone){
        timezone = timezone.split('(');
        let timezoneOffset = timezone[1].slice(4, -1);
        //this.d1_timezoneOffset = timezoneOffset;
        return timezoneOffset;
      }
  } 

  setTimezone(timezone){
    timezone = timezone.split(":");
    timezone = timezone[0].trim();
    return timezone;
  }

  formatDateTime(){   
    this.setTimezones();
    // console.log("timeslot info", this.d1_timezone + ' ' + this.d2_timezone);
    // console.log("timeslot data", this.timeslot);

    let dateToConvert = new Date(this.timeslot.date + "T" + this.timeslot.original_start_time).toLocaleString('en-US', {timeZone: this.d1_timezone});
    let date = new Date(dateToConvert);  

    //console.log('date to evaluate', date); 

    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    this.dateTime = {
      mon: months[date.getMonth()],
      day: days[date.getDay()],
      date: date.getDate(),
      year: date.getFullYear(),
    }

    let date22 = new Date(this.timeslot.date + "T" + this.timeslot.original_start_time).toLocaleString('en-US', {timeZone: this.d2_timezone});
    let endTime = new Date(this.timeslot.date + "T" + this.timeslot.original_end_time).toLocaleString('en-US', {timeZone: this.d2_timezone});
    let date2 = new Date(date22);  
    let end2 = new Date(endTime);
    console.log('date1', date22); 
    console.log('date22', date2); 
    console.log('endTime', endTime); 

    this.dateTime2 = {
      mon: months[date2.getMonth()],
      day: days[date2.getDay()],
      date: date2.getDate(),
      year: date2.getFullYear(),
      start_time: this.hoursToString(date2.getHours()) + ':' + this.minutesToString(date2.getMinutes()) + ':00'
    }

    this.dateTime2end = {
      end_time: this.hoursToString(end2.getHours()) + ':' + this.minutesToString(end2.getMinutes()) + ':00'

    }

    console.log('dateTime', this.dateTime);
    console.log('dateTime2', this.dateTime2);
  }

  public hoursToString(hours){
    if(hours < 10){
      return '0' + hours;
    }else{
      return hours;
    }
  }
  public minutesToString(minutes){
    if(minutes == '0'){
      return '00';
    }else if(minutes == '5'){
      return '05';
    }else{
      return minutes;
    }
  }

  /**
   * open a confirmation modal to cancel scheduling
   * of meeting
   */
  async confirmDismiss(){
    const modal = await this.modalCtrl.create({
      component: PromptModalHeaderEnhancePage,
      cssClass:'my-custom-modal-css',
      componentProps: {
        title: 'Cancel Scheduling',
        msg: 'Quit without scheduling a meeting?',
        btn_cancel: 'No, go back.',
        btn_save: 'Yes, cancel'
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();

    if(data){
      setTimeout(f => {
        this.modalCtrl.dismiss();
      }, 10);
    }
  }

    /**
   * start scheduling a meeting,
   * make request to server api to save meeting schedule
   */
  async startScheduling(){
    // let canSet;
    // if(this.event.meeting_request == 2 && this.requestMessage.length == 0){
    //   canSet = false;
    //   this.sched.env.toast('Please add a meeting request message');
    // } else {
    //   canSet = true;
    // }
    //if(canSet) {

    if(this.timeslot){
      
      let loading = await this.loadingCtrl.create({
        message: 'Processing...'
      });
      await loading.present();
        
      this.counter++;
      if(this.counter == 1){
        this.counter++;   

        let formData = new FormData();

        formData.append('event_id', this.timeslot.event_id);
        formData.append('time_slot_id', this.timeslot.id);
        formData.append('delegate_1', this.delegate_id);
        formData.append('delegate_2', this.delegate.edid == undefined ? this.delegate.ed_id : this.delegate.edid);
        formData.append('setter', 'delegate1');
        formData.append('request_message', this.requestMessage);

        this.sched.virtualMeeting(formData)
          .subscribe(r => {
            loading.dismiss(); /* dismiss loading */
            this.counter = 0;
            if(r.error == 0){
              this.showPostRequestResult(r.table);
            } else {
              this.sched.env.toast(r.message)
            }
          });
       }

      const { role, data } = await loading.onDidDismiss();
    }
    //}
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

    const modal = await this.modalCtrl.create({
      component: PromptModalEnhancePage,
      cssClass:'my-custom-modal-css',
      componentProps: {
        img_src: '/assets/icon/success-popup.png',
        title: 'Meeting successfully scheduled',
        msgHtml: `
          <div class="text-default tC fs-15 i-flex">We have assigned this meeting on</div> 
         
          <div class="text-default tC fs-15 i-flex">Please make sure to look presentable and be there on time.</div>`,
        btn_txt: 'Okay',
      }
      /*  <div class="chip `+tableBadge+` i-flex">`+tableName+` `+table.table_no+`</div>  */
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    //console.log('phampiiiii',data);
    if(data == 'closed' || !data){
      setTimeout(f => {
        if(this.event.meeting_request == 1){
          this.modalCtrl.dismiss('autoapproved-meeting-scheduled-success');
        }else{

          this.sched.env.storage.get('meeting_request_count').then((count) => {
            // console.log(count);
            // console.log(count++);
             this.events.publish('meeting_request_count', count++, Date.now());
          });

          this.modalCtrl.dismiss('meeting-scheduled-success');
        }
      }, 10);
    }
  }

   /**
   * open the reschedule meeting modal
   */
  async reSchedMeeting(){
    const modal = await this.modalCtrl.create({
      component:ReScheduleMeetingEnhancePage,
      componentProps: {
        schedules: this.schedules,
        delegate: this.delegate,
        event_id: this.event_id,
        delegate_id: this.delegate_id,
        dateTime: this.dateTime,
        timeslot: this.timeslot,
        delegate_timezone: this.d1_timezone_full
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    if(data){
      setTimeout(f => {
        this.timeslot = data;
        this.formatDateTime();
      }, 10);
    }
  }
  
}