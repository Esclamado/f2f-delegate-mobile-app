import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';
import { SchedulesService } from 'src/app/services/schedules.service';
import { PromptModalPage } from 'src/app/modalpage/prompt-modal/prompt-modal.page';

@Component({
  selector: 'app-re-schedule-meeting',
  templateUrl: './re-schedule-meeting.page.html',
  styleUrls: ['./re-schedule-meeting.page.scss'],
})
export class ReScheduleMeetingPage implements OnInit {

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
  

  collectingData: boolean = null;
  selectedDay: any = null;
  timeslots: any = [];
  
  counter: any = 0;

  constructor(
    public modalCtrl: ModalController,
    public sched: SchedulesService,
    public events: Events
  ) { }

  ngOnInit() {
    let _date = null;
    if(this.meeting){
      _date = this.meeting.date;
      this.timeslot = this.meeting;
    }

    this.formatCurrentDate(_date);

    if(this.schedules){
      let sched = [];
      this.schedules.forEach(val => {
        if(this.dateTime === val.date){
          this.selectedDay = val;
          this.selectableChange({value: val}, 'event_date');
        }

        if(val.event_current_date <= val.milisec){
          sched.push(val);
        }
      });
      this.schedules = sched;
    }
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

    data.forEach(as => {
      let availableTSid = as.id;
      scheds.forEach(val => {
        if(val.type == 'timeslot'){
          let ts = val.data;
          if(availableTSid == ts.id){
            if(event_current_time < ts.event_start_time_milisec){
              if(!ts.meeting_schedule){
                this.timeslots.push(ts);
              }
            }
          }
        }
      });
    });
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

    console.log(this.meeting);
    console.log(this.meeting.start_time_stamp + ' > ' +this.sched.env.getnowDate(this.event_details, 'resched'));

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


        this.sched.scheduleMeeting(formData)
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
      component: PromptModalPage,
      cssClass:'my-custom-modal-css',
      componentProps: {
        img_src: '/assets/icon/success-popup.png',
        title: ttl,
        msgHtml: `
          <div class="text-default tC fs-15 i-flex">We have assigned this meeting on</div> 
          <div class="chip `+tableBadge+` i-flex">`+tableName+` `+table.table_no+`</div> 
          <div class="text-default tC fs-15 i-flex">Please make sure to look presentable and be there on time.</div>`,
        btn_txt: 'Okay',
      }
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
