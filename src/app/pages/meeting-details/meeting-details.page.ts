import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, LoadingController, Platform, Events} from '@ionic/angular';

import { EnvService } from 'src/app/lib/env.service';
import { EventService } from 'src/app/services/event.service';
import { ReScheduleMeetingPage } from 'src/app/modalpage/re-schedule-meeting/re-schedule-meeting.page';
import { PromptModalHeaderPage } from 'src/app/modalpage/prompt-modal-header/prompt-modal-header.page';
import { CancelMeetingRequestPage } from 'src/app/modalpage/cancel-meeting-request/cancel-meeting-request.page';
import { PromptModalPage } from 'src/app/modalpage/prompt-modal/prompt-modal.page';
import { NotesService } from 'src/app/services/notes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SchedulesService } from 'src/app/services/schedules.service';

import { ClockService } from 'src/app/lib/clock.service';
import { NoshowService } from 'src/app/services/noshow.service';
import { ChatboxPage } from 'src/app/modalpage/chatbox/chatbox.page';
import { NoteSendMailPage } from 'src/app/modalpage/note-send-mail/note-send-mail.page';

@Component({
  selector: 'app-meeting-details',
  templateUrl: './meeting-details.page.html',
  styleUrls: ['./meeting-details.page.scss'],
})
export class MeetingDetailsPage implements OnInit {

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

  constructor(
    public modalCtrl: ModalController,
    private eventService: EventService,
    private noshowService: NoshowService,
    public env: EnvService,
    private notesService: NotesService,
    private route: ActivatedRoute, 
    private router: Router,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public schedulesService: SchedulesService,
    public platform : Platform,
    public events: Events
  ) { }

  ngOnInit() {
    this.env.requireLogIn();

    this.route.queryParams.subscribe(params => {
      // console.log('previous_page',params);
      if (params && params.previous_page) {
        this.previous_page = params.previous_page;
      }

      this.eventService.env.storage.get('meeting-details').then((data) => {
        this.meeting = data;
        console.log('meeting',this.meeting);
        this.my_id = this.meeting.event_delegate_id;
        this.meeting_with_id = this.meeting.meeting_schedule.delegate1;
        if(this.my_id == this.meeting.meeting_schedule.delegate1){
          this.meeting_with_id = this.meeting.meeting_schedule.delegate2;
        }

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
    console.log('sddd',this.meeting);
    let add_note_delegate_info = {
      d2_profile_photo: this.meeting.meeting_schedule.delegate_profile_photo,
      d2_company_name: this.meeting.meeting_schedule.delegate_company_name,
      d2_fullname: this.meeting.meeting_schedule.delegate_fullname
    }
    this.eventService.env.storage.set('from_meeting_details', true);
    this.eventService.env.storage.set('add_note_delegate_info', add_note_delegate_info).then(r => {

      this.eventService.env.storage.set('note_prev_page', '/meeting-details');
      this.eventService.env.redirect('/add-notes/'+this.meeting_with_id+'/'+this.meeting.meeting_schedule.id);
    })
  }
  
  myBackButton(){
    this.env.location.back();
  }

  /**
   * open the reschedule meeting modal
   */
  async reSchedMeeting(){

    console.log(this.meeting.start_time_stamp + ' > ' +this.env.getnowDate(this.event_details, 'resched'));

    if(this.meeting.start_time_stamp > this.env.getnowDate(this.event_details, 'resched')){

      this.showWarningMessage = false;
      this.warningMessage = null;

      this.event['re_sched_request'] = true;
      this.event['meeting'] = this.meeting;
      this.event['event_details'] = this.event_details;

      const modal = await this.modalCtrl.create({
        component: ReScheduleMeetingPage,
        componentProps: this.event,
      });

      modal.present();

    }else{

      this.showWarningMessage = true;
      this.warningMessage = 'Rescheduling a meeting is prohibited 2 hrs before the scheduled meeting.';
    }
  }

  // getnowDate(type){
  //   let y = this.clockService.today.getFullYear();
  //   let m = this.clockService.checkTime(this.clockService.today.getMonth() + 1);
  //   let d = this.clockService.today.getDate();

  //   let hours;
  //   if(type == 'resched'){
  //     hours = this.clockService.checkTime(this.clockService.today.getHours() + 2);
  //   }else{
  //     hours = this.clockService.checkTime(this.clockService.today.getHours());
  //   }

  //   let min;
  //   if(type == 'cancel'){
  //     min = this.clockService.today.getMinutes() + 30;
  //     if(min > 60){
  //       console.log('bhours',hours);
  //       hours = parseInt(hours) + 1;
  //       console.log('ahours',hours);
  //       min = min - 60;
  //     }
  //   }else{
  //     min = this.clockService.today.getMinutes();
  //   }

  //   let s = this.clockService.today.getSeconds(); 
  //   min = this.clockService.checkTime(min);
  //   s = this.clockService.checkTime(s);
  //   d = this.clockService.checkTime(d);
  //   return y+'-'+m+'-'+d+' '+hours+':'+min+':'+s;
  // }

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

    console.log(this.meeting.start_time_stamp + ' > ' +this.env.getnowDate(this.event_details, 'cancel'));

    if(this.meeting.start_time_stamp > this.env.getnowDate(this.event_details, 'cancel')){

      if(meeting.event_delegate_id == meeting.meeting_schedule.cancel_requested_by){
        this.showWarningMessage = true;
        this.warningMessage = 'Sorry but your request for cancellation has been declined. You have to attend this meeting.';

      }else{

        this.showWarningMessage = false;
        this.warningMessage = null;

        if(this.event_details && this.event_details.cancellation_request == '2'){

          const modal = await this.modalCtrl.create({
            component: CancelMeetingRequestPage,
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
      component: PromptModalPage,
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
      this.router.navigate(['tabs/event/'+this.event_details.id]);
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
      component: PromptModalHeaderPage,
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
      component: PromptModalHeaderPage,
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
      component: PromptModalPage,
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
    this.env.redirect('/tabs/event/'+this.event.event_id);
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
      component: NoteSendMailPage,
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
      component: PromptModalHeaderPage,
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
}