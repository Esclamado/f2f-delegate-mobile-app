import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SchedulesService } from 'src/app/services/schedules.service';
import { PromptModalEnhancePage } from 'src/app/enhance-modalpage/prompt-modal-enhance/prompt-modal-enhance.page'

@Component({
  selector: 'app-cancel-meeting-request-enhance',
  templateUrl: './cancel-meeting-request-enhance.page.html',
  styleUrls: ['./cancel-meeting-request-enhance.page.scss'],
})
export class CancelMeetingRequestEnhancePage implements OnInit {

  @Input() meeting: any = null;
  @Input() event_details: any = null; /** this is actually event_details */

  cancelMessage: any = '';

  constructor(
    public modalCtrl: ModalController,
    public sched: SchedulesService
  ) { }

  ngOnInit() {
  }

   /**
   * close the modal
   */
  dismiss() {
    this.modalCtrl.dismiss('done');
  }

  /**
   * start the cancellation request
   */
  startCacelRequest() {

    console.log(this.meeting.start_time_stamp + ' > ' +this.sched.env.getnowDate(this.event_details, 'cancel'));

    if(this.meeting.start_time_stamp > this.sched.env.getnowDate(this.event_details, 'cancel')){
    //if(this.cancelMessage.length > 0){
      let formData = new FormData();

      formData.append('meeting_schedule_id', this.meeting.meeting_schedule.id);
      formData.append('message', this.cancelMessage);
      formData.append('edid', this.meeting.event_delegate_id);

      this.sched.makeCancelationRequest(formData)
      .subscribe(r => {
        if(r.error == 0){
          let data = {
            meeting_sched_id : this.meeting.meeting_schedule.id,
            event_id : this.meeting.event_id,
          }
          this.sched.env.chatSocket.emit('cancellation request', data);
          this.presentSuccessModal();
        } else {
          this.sched.env.toast(r.message);
        }
      });
    // } else {
    //   this.sched.env.toast('Please provide reason for cancellation');
    // }
    }else{

      this.sched.env.toast('Cancellation of meeting is prohibited 30 mins before the scheduled meeting.');
    }
  }

  async presentSuccessModal() {
    const modal = await this.modalCtrl.create({
      component: PromptModalEnhancePage,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        img_src: '/assets/icon/request-sent.png',
        title: 'Request successfully sent',
        msg: 'You have sent a request to cancel your meeting. We’ll review this first and will notify you after.', 
        btn_txt: 'Okay, Thanks!'
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    if(data == 'closed'){
      setTimeout(f => {
        this.modalCtrl.dismiss('canceled');
      }, 10);
    }
  }

}
