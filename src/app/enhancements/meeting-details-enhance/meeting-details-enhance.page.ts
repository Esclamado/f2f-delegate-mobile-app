import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController, AlertController, LoadingController, Events } from '@ionic/angular';
import { EventService } from 'src/app/services/event.service';
import { NoshowService } from 'src/app/services/noshow.service';
import { EnvService } from 'src/app/lib/env.service';
import { NotesService } from 'src/app/services/notes.service';
import { SchedulesService } from 'src/app/services/schedules.service';
import { ClockService } from 'src/app/lib/clock.service';
import { PromptModalEnhancePage } from 'src/app/enhance-modalpage/prompt-modal-enhance/prompt-modal-enhance.page';
import { PromptModalHeaderEnhancePage } from 'src/app/enhance-modalpage/prompt-modal-header-enhance/prompt-modal-header-enhance.page';
import { ReScheduleMeetingEnhancePage } from 'src/app/enhance-modalpage/re-schedule-meeting-enhance/re-schedule-meeting-enhance.page';
import { CancelMeetingRequestEnhancePage } from 'src/app/enhance-modalpage/cancel-meeting-request-enhance/cancel-meeting-request-enhance.page';
import { NoteSendMailEnhancePage } from 'src/app/enhance-modalpage/note-send-mail-enhance/note-send-mail-enhance.page';
import { ChatboxEnhancePage } from 'src/app/enhance-modalpage/chatbox-enhance/chatbox-enhance.page';
import { ChatboxPage } from 'src/app/modalpage/chatbox/chatbox.page';
import { DelegateService } from 'src/app/services/delegate.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';

@Component({
  selector: 'app-meeting-details-enhance',
  templateUrl: './meeting-details-enhance.page.html',
  styleUrls: ['./meeting-details-enhance.page.scss'],
})
export class MeetingDetailsEnhancePage implements OnInit {


  meeting : any = null;
  notes : any = null;
  note_edited: any;
  clockService: any = null;

  event : any = null;
  event_details : any = null;
  reporter_delegate_id : any = null;
  reported_delegate_id : any = null;
  delegate_name : any = null;

  meeting_with_id: any = null;
  my_id: any = null;
  time: any;
  runTimer: any;
  remainingTime: any;
  displayTime: any;
  remainingCountdown: string;
  hasFinished: boolean;
  hasStarted: boolean;
  timeInSeconds: any;
  totalTimeInSeconds: any;
  previous_page: any;

  showWarningMessage: boolean = false;
  warningMessage: any = null;

  limit: any = 2;
  current_page: any = 1;
  total_page: any = 0;
  total_other_delegate: any = 0;

  delegateTimezone: any = "Hi!";

  event_id: any = '';
    /**
   *  hold the id on the delegate that is different
   * from the one that is loged in
   */
  delegate_id: any = null;
  imageBase64: any = '';

  /**
   * this hold the data of the delegate
   * either the loged in or the other delegate that
   * the loged in delegate visits with
   */
  delegate: any = null;

  /**
   * hold the data of delegates from the company
   */
  other_delegate: any = null;

  /**
   * hold the data of current delegate
   */
  _delegate: any = null;

    /**
   * hold the milisec of the event date and time
   */
  eventTimezoneMiliTime: number = 0;

  /**
   * holds the monthe name that will be displayed on
   * meeting schedule
   */
  monthName: any = '';

  /**
   * holds which meeting schedule date is selected
   */
  selected_ms_date: any = null;
  
  /** 
   * holds business card temp photo
   *
  */ 

  d1_timezoneOffset: string = 'qweqweq';
  d2_timezoneOffset: string = '';

  d1_timezone: string = 'Asia/Manila';
  d2_timezone: string = '';

  d1_timezone_full: string = '';

  newDateTime: any  = null;

  delegate2SocialId: any = null;
  delegateZoomSocialId: any = null;

  constructor(
    private router: Router,
    public modalCtrl: ModalController,
    private eventService: EventService,
    private noshowService: NoshowService,
    public env: EnvService,
    private notesService: NotesService,
    private route: ActivatedRoute,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public schedulesService: SchedulesService,
    public events: Events,
    public delegateService: DelegateService,
    public clipboard: Clipboard,
    
    ) { 
      this.clockService = new ClockService();
    }

  ngOnInit() {

    this.env.requireLogIn();

    this.route.queryParams.subscribe(params => {
      console.log('previous_page',params);
      if (params && params.previous_page) {
        this.previous_page = params.previous_page;
      }

      this.eventService.env.storage.get('meeting-details').then((data) => {
        this.meeting = data;
        console.log('meeting_nero',this.meeting);
        this.newDateTime = this.formatDateTime();
        this.my_id = this.meeting.event_delegate_id;
        this.meeting_with_id = this.meeting.meeting_schedule.delegate1;
        if(this.my_id == this.meeting.meeting_schedule.delegate1){
          this.meeting_with_id = this.meeting.meeting_schedule.delegate2;
        }
        let delegateParameters = {
          byParam: 'id',
          valParam : this.meeting.meeting_schedule.delegate_id
        }
        //console.log('meeting with id', this.meeting.meeting_schedule.delegate_id);
        this.delegateService.getDelegate(delegateParameters).subscribe((res) => {
          let sm = JSON.parse(res.data.datas[0].social_media_links);
          console.log("meeting with delegate data", sm.skype); 
          //zoomId = zoomId.zoom;
          let skypeId = sm.skype;
          let zoomId = sm.zoom;
          this.delegate2SocialId = skypeId;
          this.delegateZoomSocialId = zoomId;
        });



        this.timeInSeconds = data.time_countdown;
        this.totalTimeInSeconds = data.total_time_countdown;
        if(this.timeInSeconds){
          this.initTimer();
          this. startTimer();
        }

        this.getNotes();
      });
    });

    this.eventService.env.storage.get('event_other_info').then((data) => {
      this.event = data;
    });

    this.eventService.env.storage.get('event').then((data) => {
      if(data){
        this.event_details = data;
        this.clockService = new ClockService();
        this.clockService.setDateTime(data).startTime(); 
      }
    });

    this.getData();
 /*   this.getOtherDelegate(); */

    // get the delegate timezone
    this.setTimezones();
    
   
  }

  formatDateTime(){   
    if(this.meeting){
      //console.log("timeslot info", this.d1_timezone);
      let dateToConvert = new Date(this.meeting.date + "T" + this.clockService.convertTo24Hrs(this.meeting.start_time)).toLocaleString('en-US', {timeZone: this.d1_timezone});
      let date = new Date(dateToConvert);

      //console.log('date to evaluate', date); 

      let months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      let dateTime = {
        mon: months[date.getMonth()],
        day: days[date.getDay()],
        date: date.getDate(),
        year: date.getFullYear(),
      }
      let dateString = dateTime['day'] + ", " + dateTime['mon'] + " " + dateTime['date'] + ", " + dateTime['year'];
      //console.log("date string for new date", dateString);
      return dateString;
    }
  }

  async setTimezones(){
    
    this.env.storage.get('delegate').then((data) => {
      this.d1_timezoneOffset = this.setTimezoneOffset(data.timezone);
      this.d1_timezone = this.setTimezone(data.timezone);
      this.d1_timezone_full = data.timezone;
      // console.log(this.d1_timezoneOffset + this.d2_timezoneOffset);
      //console.log('perfect', this.d1_timezone);
    });
    // this.d2_timezoneOffset = this.setTimezoneOffset(this.delegate.timezone);    
    // this.d2_timezone = this.setTimezone(this.delegate.timezone);

    // let timezone = this.delegate.timezone;
    // timezone = timezone.split(":");
    // return timezone = timezone[0].trim();
  }

  setTimezoneOffset(timezone){
    // Europe/Berlin : (UTC +02:00)
    timezone = timezone.split('(');
    let timezoneOffset = timezone[1].slice(4, -1);
    //this.d1_timezoneOffset = timezoneOffset;
    return timezoneOffset;
  } 

  setTimezone(timezone){
    timezone = timezone.split(":");
    timezone = timezone[0].trim();
    return timezone;
  }
  
  doRefresh(e) {
    setTimeout(() => {
      // console.log('Async operation has ended');
      e.target.complete();
    }, 1000);
  }

    /**
   * redirect to add note page but save the variable needed first
   */
  addNote(){
    //console.log('sddd',this.meeting);
    let add_note_delegate_info = {
      d2_profile_photo: this.meeting.meeting_schedule.delegate_profile_photo,
      d2_company_name: this.meeting.meeting_schedule.delegate_company_name,
      d2_fullname: this.meeting.meeting_schedule.delegate_fullname
    }
    this.eventService.env.storage.set('from_meeting_details', true);
    this.eventService.env.storage.set('add_note_delegate_info', add_note_delegate_info).then(r => {

      this.eventService.env.storage.set('note_prev_page', '/meeting-details-enhance');
      this.eventService.env.redirect('/add-notes-enhance/'+this.meeting_with_id+'/'+this.meeting.meeting_schedule.id);
    
    })
  }
  
  myBackButton(){
    this.env.location.back();
  }

    /**
   * open the reschedule meeting modal
   */
  async reSchedMeeting(){

    //console.log("delegate timezone from services", this.delegateTimezone);
    //console.log(this.meeting.start_time_stamp + ' > ' +this.env.getnowDate(this.event_details, 'resched'));

    console.log(this.meeting);

    if(this.meeting.start_time_stamp > this.env.getnowDate(this.event_details, 'resched')){

      this.showWarningMessage = false;
      this.warningMessage = null;

      this.event['re_sched_request'] = true;
      this.event['meeting'] = this.meeting;
      this.event['newDate'] = this.newDateTime;
      this.event['event_details'] = this.event_details;
      this.event['delegate_timezone'] = this.d1_timezone_full;

      const modal = await this.modalCtrl.create({
        component: ReScheduleMeetingEnhancePage,
        componentProps: this.event,
      });

      modal.present();

    }else{

      this.showWarningMessage = true;
      this.warningMessage = 'Rescheduling a meeting is prohibited 2 hrs before the scheduled meeting.';
    }
  }


  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Cancel meeting schedule..',
      duration: 1000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();

    let formData = new FormData();

    formData.append('meeting_schedule_id', this.meeting.meeting_schedule.id);
    formData.append('edid', this.meeting.event_delegate_id);

    this.schedulesService.makeCancelationRequest(formData)
    .subscribe(r => {
      if(r.error == 0){
        let data = {
          meeting_sched_id : this.meeting.meeting_schedule.id,
          event_id : this.meeting.event_id,
        }
        this.schedulesService.env.chatSocket.emit('cancellation request', data);
        this.presentSuccessCancelModal();
      } else {
        this.schedulesService.env.toast(r.message)
      }
    });
  }


  async cancelRequestModal(meeting) {

    //console.log(this.meeting.start_time_stamp + ' > ' +this.env.getnowDate(this.event_details, 'cancel'));

    if(this.meeting.start_time_stamp > this.env.getnowDate(this.event_details, 'cancel')){

      if(meeting.event_delegate_id == meeting.meeting_schedule.cancel_requested_by){
        this.showWarningMessage = true;
        this.warningMessage = 'Sorry but your request for cancellation has been declined. You have to attend this meeting.';

      }else{

        this.showWarningMessage = false;
        this.warningMessage = null;

        if(this.event_details && this.event_details.cancellation_request == '2'){

          const modal = await this.modalCtrl.create({
            component: CancelMeetingRequestEnhancePage,
            componentProps: {
              meeting: this.meeting,
              event_details: this.event_details
            }
          });
      
          modal.present();
          const { data } = await modal.onDidDismiss();
          if(data == 'canceled'){
            setTimeout(f => {
              this.meeting.meeting_schedule.status = 3
            }, 10);
          }

        }else{
          this.alertSheet();
        }
      }

    }else{

      this.showWarningMessage = true;
      this.warningMessage = 'Cancellation of meeting is prohibited 30 mins before the scheduled meeting.';
    }
  }

  async alertSheet(){
    const alert = await this.alertController.create({
      header: 'Cancel Meeting',
      message: 'Are you sure you want to <strong>cancel</strong> meeting schedule?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            // console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.presentLoading();
          }
        }
      ]
    }); 
    
    await alert.present();
  }

  async presentSuccessCancelModal() {
    const modal = await this.modalCtrl.create({
      component: PromptModalEnhancePage,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        img_src: '/assets/icon/success-popup.png',
        title: 'Succesfully cancelled meeting schedule',
        msg: 'You have successfully cancelled your meeting schedule.', 
        btn_txt: 'Okay, Thanks!'
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    if(data == 'closed'){
      this.router.navigate(['enhance-tabs/event-enhance/'+this.event_details.id]);
    }
  }

  /**
   * open a confirmation modal to report as no show
   * 
   */
  async reportAsNoshow(meeting){
    // console.log('meeting',meeting);
    this.delegate_name = meeting.meeting_schedule.delegate_fullname
    let meeting_schedule_id = meeting.meeting_schedule.id

    let a = this;

    this.env.storage.get('delegate').then((d) => {
      if(d){
        // console.log('d',d);
         this.reporter_delegate_id = meeting.event_delegate_id;

         if(meeting.meeting_schedule.delegate1 == this.reporter_delegate_id){
          this.reported_delegate_id = meeting.meeting_schedule.delegate2;
         }else{
          this.reported_delegate_id = meeting.meeting_schedule.delegate1;
         }
      }
    });

    const modal = await this.modalCtrl.create({
      component: PromptModalHeaderEnhancePage,
      cssClass:'my-custom-modal-css',
      componentProps: {
        title: 'Report as no show',
        msg: 'Are you sure you want to report ' + a.delegate_name + ' as no show? This will notify the admin and will be validated first before approval.',
        btn_cancel: 'Cancel',
        btn_save: 'Report'
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();

    if(data == 'save'){
        this.noshowService.reportAsNoshow(meeting.meeting_schedule.event_id ,meeting_schedule_id,this.reporter_delegate_id,this.reported_delegate_id).subscribe(r => {
          if(r.error == 0){

            let emitData = {
              meeting_sched_id : meeting.meeting_schedule.id,
              event_id : meeting.event_id,
            }
            this.env.chatSocket.emit('noshow request', emitData);

            let msg = 'You have successfully reported '+a.delegate_name+' as no show.';
            this.presentSuccessModal(msg);
            this.meeting['no_show'] = r.data;
            this.eventService.env.storage.set('meeting-details', this.meeting);
          }else{
            this.env.toast(r.message);
          }
        }); 
    }
  }

  async cancelRequest(noshow, meeting){

    // console.log('meeting',meeting);
    this.delegate_name = meeting.meeting_schedule.delegate_fullname

    let a = this;

    const modal = await this.modalCtrl.create({
      component: PromptModalHeaderEnhancePage,
      cssClass:'my-custom-modal-css',
      componentProps: {
        title: 'Cancel No Show Report',
        msg: 'Are you sure you want to cancel the no show report for ' + a.delegate_name + '? This will be remove the report permanently.',
        btn_cancel: 'Not now',
        btn_save: 'Cancel'
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();

    let thisData = {
      id: noshow.id,
      status: noshow.status
    };

    if(data == 'save'){
        this.noshowService.removeNoshowReport(thisData).subscribe(r => {
          if(r.error == 0){

            let emitData = {
              meeting_sched_id : meeting.meeting_schedule.id,
              event_id : meeting.event_id,
            }
            this.env.chatSocket.emit('noshow request', emitData);

            let msg = 'You have successfully cancel the no show report for '+a.delegate_name+'.';
            this.presentSuccessModal(msg);
            meeting['no_show'] = null;
            this.eventService.env.storage.set('meeting-details', meeting);
          }else{
            this.env.toast(r.message);
          }
        }); 
    }
  }

  async presentSuccessModal(msg) {
    const modal = await this.modalCtrl.create({
      component: PromptModalEnhancePage,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        img_src: '/assets/icon/success-popup.png',
        title: 'Success',
        msg: msg, 
        btn_txt: 'Okay!'
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
  }

  getNotes(){
    // console.log('aaaa');
    let params = {
      msid: this.meeting.meeting_schedule.id,
      myedid: this.my_id,
      other_deid: this.meeting_with_id,
    }
    // console.log(params);
    this.notesService.getNote(params)
      .subscribe(r => {
        if(r.error == 0){
          // console.log('rhan',r);
          this.notes = r.data;
          this.formatEditData();
        }else{
          this.notes = 'not_found';
        }
      });
  }

  formatEditData(){
    //let editDate = new Date(this.notes.updated_at);
    
    let editDate = new Date(this.notes.updated_at.replace(' ', 'T'));

    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let mon = months[editDate.getMonth()];
    let date = editDate.getDate();
    let year = editDate.getFullYear();

    this.note_edited = mon + ' ' + date + ', ' + year;
  }
  
  initTimer() {
    // Pomodoro is usually for 25 minutes
   this.time = this.timeInSeconds;
   this.runTimer = false;
   this.hasStarted = false;
   this.hasFinished = false;
   this.remainingTime = this.timeInSeconds;
   
   this.displayTime = this.getSecondsAsDigitalClock(this.remainingTime);
   this.remainingCountdown = this.getPercentage(this.remainingTime, this.totalTimeInSeconds);
 }

 startTimer() {
  this.runTimer = true;
 this.hasStarted = true;
 this.timerTick();
}

pauseTimer() {
 this.runTimer = false;
}

timerTick() {
  setTimeout(() => {
    if (!this.runTimer) { return; }
    this.remainingTime--;
    this.displayTime = this.getSecondsAsDigitalClock(this.remainingTime);
    this.remainingCountdown = this.getPercentage(this.remainingTime, this.totalTimeInSeconds);
    if (this.remainingTime <= 0) {
      this.hasFinished = true;
    } else {
      this.hasFinished = false;
      this.timerTick();
    }
  }, 1000);
}

backButton(){
  this.remainingTime = 0;
  this.env.redirect('/enhance-tabs/event-enhance/'+this.event.event_id);
}

getPercentage(num1, num2){
  if(num1 && num2){
    num1 = this.totalTimeInSeconds - num1;
    let que = num1 / num2;
    //parseFloat
    //Math.floor(1.6);
    return Math.floor(que*100).toString();
  }
}

getSecondsAsDigitalClock(inputSeconds: number) {
  var sec_num = parseInt(inputSeconds.toString(), 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);
  var hoursString = '';
  var minutesString = '';
  var secondsString = '';
  hoursString = (hours < 10) ? "0" + hours : hours.toString();
  minutesString = (minutes < 10) ? "0" + minutes : minutes.toString();
  secondsString = (seconds < 10) ? "0" + seconds : seconds.toString();

  let label = '';
  if(hours > 1){
    label = "hours left";
  }
  else if(hours == 1){
    label = "hour left";
  }
  else if(minutes > 1){
    label = "minutes left";
  }
  else if(minutes == 1){
    label = "minute left";
  }
  else if(seconds > 1){
    label = "seconds left";
  }
  else if(seconds == 1){
    label = "second left";
  }
  else if(seconds == 0){
    label = "The meeting is finished";
  }

  let time = '';
  time = hoursString + ':' + minutesString + ':' + secondsString;
  if(hours == 0){
    time = minutesString + ':' + secondsString;
  }

  let data_time = {
    time: time,
    label: label
  };

  return data_time;
}


async openChatBox(){
  const modal = await this.modalCtrl.create({
    component: ChatboxPage,
    componentProps: {
      my_id: this.env.payload.jti,
      chat_with_id: this.meeting.meeting_schedule.delegate_id,
      event_id: this.meeting.event_id,
    }
  });

  modal.present();
}

 async sendModal() {
  const modal = await this.modalCtrl.create({
    component: NoteSendMailEnhancePage,
    cssClass:'my-custom-modal-css',
    componentProps: {
      note: this.notes,
      event_id: this.meeting.event_id
    }
  });

  modal.present();
}

async deleteConfirmModal() {
  const modal = await this.modalCtrl.create({
    component: PromptModalHeaderEnhancePage,
    cssClass:'my-custom-modal-css',
    componentProps: {
      title: 'Delete Note',
      msg: 'Are you sure you want to delete your note with ' + this.notesService.env.capitalizeText(this.notes.d2_fullname) + '?',
      btn_cancel: 'No, Close',
      btn_save: 'Delete Note',
    }
  });

  modal.present();
  const { data } = await modal.onDidDismiss();
  if(data == 'save'){
    setTimeout(f => {
      this.deleteNote()
    }, 10);
  }
}

deleteNote(){
  let params = {note_id: this.notes.id}
  this.notesService.deleteNote(params)
  .subscribe(r => {
    if(r.error == 0){
      this.notesService.env.toast('Your note has been deleted', 'toastsuccess');
      this.notes = 'not_found';
    }else{
      this.notesService.env.toast(r.message);
    }
  })
}

  goBackHome(){
    this.router.navigate(['/enhance-tabs/event-enhance']);
  }
/* 
  getData(refresher?){
    this.env.storage.get('delegate').then((d) => {
      if(d){

        this._delegate = d;
        let data = {
          by: 'id',
          isApp: true,
          event_id: this.event_id
        }

        if(!this.delegate_id){
          data['delegate'] = d.id;
        } else {
          data['delegate'] = this.delegate_id;
        }

        this.delegateService.getDelegate(data)
        .subscribe(r => {
          console.log('del', r);
          this.delegate = r.data;
          if(!this.delegate_id){
            this.env.storage.set('delegate', r.data);
          }

          console.log('del', this.delegate);

          if(this.delegate){
            this.getOtherDelegate();    
            this.getMeetingSchedule(this.delegate.id, this.event_id);
          }
          
          if(refresher){
            refresher.target.complete();
          }
        });
      }
    });
  } */
  
  getData(){
    this.env.storage.get('delegate').then((d)=>{
      //console.log('dd', d);
    })
  }

  getOtherDelegate(infiniteScroll=null){
    let thisGetForm = {
      id: this.delegate.id,
      byParam : 'company_id',
      valParam: this.delegate.company_id,
      limit: this.limit,
      page: this.current_page
    };

    this.delegateService.getDelegate(thisGetForm)
    .subscribe(d => {
      //console.log("other delegate",d);
      if(d.error == 0){
        this.current_page = d.data.current_page;
        this.total_page = d.data.total_page;
        this.total_other_delegate = d.data.total_count;

        if(!infiniteScroll) {
          this.other_delegate = []; 
        }

        d['data']['datas'].forEach((cat, idx) => {
          this.other_delegate.push(cat);
        });

        if(infiniteScroll){
          infiniteScroll.target.complete();
        }
      }
    });
  }

  /**
   * make request, for the meeting schedule
   * of current delegate, return only the timeslot that
   * has a meeting scheduled
   * @param did the delegate's id
   * @param eid the event'd id
   */
  getMeetingSchedule(did, eid){
    let data = {
      delegate: did,
      event: eid,
    }
    this.delegateService.getMeetingSchedule(data)
      .subscribe(r => {
        this.event = r.data;
       
        this.setMSmonths();
        this.setMSDay();
      });
  }

    /**
   * set the selected day
   */
  selectDay(dayMilisec){
    this.selected_ms_date = dayMilisec;
  }

    /**
   * this will set the month to be diaplayed 
   * on meeting schedules
   */
  setMSmonths(){
    if(this.event){
      let days = this.event.days;

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
  }

  /**
   * set the days that will be used as days tabs
   */
  setMSDay(){
    if(this.event){
      let days = this.event.days;
      let day_counter = 0;
      days.forEach((val, key) => {
        // if(!this.selected_ms_date){
        //   this.selected_ms_date = val.milisec;
        // }
        if(day_counter == 0){
          if(val.milisec == val.e_current_date){
            this.selected_ms_date = val.milisec;
            this.selectDay(val.milisec);
            day_counter++;
          }else{
            this.selected_ms_date = days[0].milisec;
            this.selectDay(days[0].milisec);
          }
        }

        //let _date = new Date(val.milisec * 1000);
        let _date = new Date(val.formatted_date);

        let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        val.day_name = dayNames[_date.getDay()];
        val.date = _date.getDate();

        this.event.days[key] = val;
      });
    }
  }

  gotoZoomLink(meeting_details){
    let url;
    if(meeting_details.delegate_email == meeting_details.d2_email){
      //start
      url = meeting_details.zoom_meeting_link_1;
    }else{
      //join
      url = meeting_details.zoom_meeting_link_2;
    }

    this.env.iab.create(url, `_system`);
  }

  copyZoomLink(meeting_details){
    console.log(meeting_details);
    let url;
    if(meeting_details.delegate_email == meeting_details.d2_email){
      //start
      this.clipboard.copy(meeting_details.zoom_meeting_link_1);
    }else{
      //join
      this.clipboard.copy(meeting_details.zoom_meeting_link_2);
    }
    this.env.toast('Copy to Clipboard', 'toastsuccess');
  }
}