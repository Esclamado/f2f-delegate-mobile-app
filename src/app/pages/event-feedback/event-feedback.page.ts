import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { PromptModalPage } from 'src/app/modalpage/prompt-modal/prompt-modal.page';
import { EventFeedbackService } from 'src/app/services/event-feedback.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvService } from 'src/app/lib/env.service';

@Component({
  selector: 'app-event-feedback',
  templateUrl: './event-feedback.page.html',
  styleUrls: ['./event-feedback.page.scss'],
})
export class EventFeedbackPage implements OnInit {

  feedbackMessage: any = '';
  formValidation: any;
  invalidFeedback: boolean= false;
  public event_id: any = 0;
  feedbackLength = 0;
  event: any = null;

  constructor(
    public env: EnvService,
    public modalCtrl: ModalController,
    public eventFeedbackService: EventFeedbackService,
    protected _route: ActivatedRoute,
    public router: Router,
  ) { }

  ngOnInit() {
    this._route.paramMap.subscribe( url_param =>{
      this.event_id = url_param.get('event_id');

      this.env.storage.get('event').then((d) => {
        if(d){
         this.event = d;
         if(d.feedback_message){
          this.feedbackMessage = d.feedback_message;
          this.checkLength();
         }
        }
      });
    });
  }

  myBackButton(){
    this.env.storage.get('selectedFaqId').then((d) => {
      if(d){
        //this.router.navigate(['event-faq-profile/'+this.event_id+'/'+d]);
        this.env.location.back();
      }else{
        this.env.location.back();
      }
    });
  }

  isTyping(){
    this.invalidFeedback = false;
    this.feedbackMessage = this.feedbackMessage.trim();
    this.checkLength();
  }

  checkLength(){
    console.log(this.feedbackMessage.length);
    if(this.feedbackMessage.length == 1){
      this.feedbackMessage = this.feedbackMessage.charAt(0).toUpperCase();
    }else{
      this.feedbackMessage = this.feedbackMessage.charAt(0).toUpperCase() + this.feedbackMessage.slice(1);
    }
    this.feedbackLength = this.feedbackMessage.length;
  }

  focusInField(){
    this.formValidation = 'valid';
  }

  focusOutField(){
    this.formValidation = '';
  }

  /**
   * start the event feedback
   */
  sendFeedback() {
    this.feedbackMessage = this.feedbackMessage.trim();
    if(this.feedbackMessage.length > 0){
      this.invalidFeedback = false;
      this.formValidation = 'valid';

      let formData = {
        'event_id': this.event_id,
        'message': this.feedbackMessage
      };

      this.eventFeedbackService.save(formData)
      .subscribe(r => {
        if(r.error == 0){
          if(r.data){
            this.event['feedback_id'] = r.data.id;
            this.event['feedback_message'] = r.data.message;
            this.env.storage.set('event', this.event);
          }
          this.presentSuccessModal(r.message);
        } else {
          this.eventFeedbackService.env.toast(r.message)
        }
      });

    } else {
      this.invalidFeedback = true;
      this.formValidation = 'invalid';
    }
  }

  async presentSuccessModal(message) {
    const modal = await this.modalCtrl.create({
      component: PromptModalPage,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        img_src: '/assets/icon/success-popup.png',
        title: message,
        msg: "Thank you for your feedback, we'll review this to make our app and events better.", 
        btn_txt: 'Okay, thanks!'
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    if(data == 'closed'){
      setTimeout(f => {
        this.env.storage.get('selectedFaqId').then((d) => {
          if(d){
            this.router.navigate(['event-faq-profile/'+this.event_id+'/'+d]);
          }else{
            this.env.location.back();
            //this.router.navigate(['tabs/event-settings/'+this.event_id]);
          }
        });
      }, 10);
    }
  }

}
