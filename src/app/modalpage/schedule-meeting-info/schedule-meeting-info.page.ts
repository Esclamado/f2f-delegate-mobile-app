import { Component, OnInit, Input } from '@angular/core';
import { ModalController, LoadingController, Events } from '@ionic/angular';
import { SchedulesService } from 'src/app/services/schedules.service';
import { PromptModalPage } from 'src/app/modalpage/prompt-modal/prompt-modal.page';
import { PromptModalHeaderPage } from 'src/app/modalpage/prompt-modal-header/prompt-modal-header.page';
import { ReScheduleMeetingPage } from 'src/app/modalpage/re-schedule-meeting/re-schedule-meeting.page';



@Component({
  selector: 'app-schedule-meeting-info',
  templateUrl: './schedule-meeting-info.page.html',
  styleUrls: ['./schedule-meeting-info.page.scss'],
})
export class ScheduleMeetingInfoPage implements OnInit {

  @Input() timeslot: any = null;
  @Input() delegate: any = null;
  @Input() delegate_id: any = null;
  @Input() schedules: any = null;
  @Input() event: any = null;
  @Input() event_id: any = null;

  dateTime: any = null;
  requestMessage: string = '';
  counter: any = 0;

  constructor(
    public modalCtrl: ModalController,
    public sched: SchedulesService,
    public loadingCtrl: LoadingController,
    public events: Events
  ) { 
  }

  ngOnInit() {
    if(this.timeslot){
      this.formatDateTime();
    }
  }

  dismiss(data=null){
    this.modalCtrl.dismiss(data);
  }

  /**
   * will format the time so that we can get 
   * the right formating for display
   */
  formatDateTime(){
    let date = new Date(this.timeslot.date);

    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    this.dateTime = {
      mon: months[date.getMonth()],
      day: days[date.getDay()],
      date: date.getDate(),
      year: date.getFullYear(),
    }
  }

  /**
   * open a confirmation modal to cancel scheduling
   * of meeting
   */
  async confirmDismiss(){
    const modal = await this.modalCtrl.create({
      component: PromptModalHeaderPage,
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

        this.sched.scheduleMeeting(formData)
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
      component: PromptModalPage,
      cssClass:'my-custom-modal-css',
      componentProps: {
        img_src: '/assets/icon/success-popup.png',
        title: 'Meeting successfully scheduled',
        msgHtml: `
          <div class="text-default tC fs-15 i-flex">We have assigned this meeting on</div> 
          <div class="chip `+tableBadge+` i-flex">`+tableName+` `+table.table_no+`</div> 
          <div class="text-default tC fs-15 i-flex">Please make sure to look presentable and be there on time.</div>`,
        btn_txt: 'Okay',
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('phampiiiii',data);
    if(data == 'closed' || !data){
      setTimeout(f => {
        if(this.event.meeting_request == 1){
          this.modalCtrl.dismiss('autoapproved-meeting-scheduled-success');
        }else{

          this.sched.env.storage.get('meeting_request_count').then((count) => {
            console.log(count);
            console.log(count++);
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
      component: ReScheduleMeetingPage,
      componentProps: {
        schedules: this.schedules,
        delegate: this.delegate,
        event_id: this.event_id,
        delegate_id: this.delegate_id,
        dateTime: this.dateTime,
        timeslot: this.timeslot
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
