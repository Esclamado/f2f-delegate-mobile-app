import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';
import { SchedulesService } from 'src/app/services/schedules.service';
import { PromptModalHeaderPage } from 'src/app/modalpage/prompt-modal-header/prompt-modal-header.page';
import { SocialMediaPage } from 'src/app/modalpage/social-media/social-media.page';


@Component({
  selector: 'app-event-meeting-request-list',
  templateUrl: './event-meeting-request-list.page.html',
  styleUrls: ['./event-meeting-request-list.page.scss'],
})
export class EventMeetingRequestListPage implements OnInit {

  @Input() timeslot: any = null;
  @Input() request_type: any = 'received';
  @Input() day: any = null;
  @Input() from_event: any = null;

  edid: any = null;
  requests: any = null;

  constructor(
    private sched: SchedulesService,
    public modalCtrl: ModalController,
    public events: Events
  ) { 
  }

  ngOnInit() {
    this.sched.env.storage.get('event_delegate_id').then(edid => {
      this.edid = edid;
      this.getMeetingRequestList(edid);
    });
  }

  /**
   * close the modal
   */
  dismiss() {
    this.modalCtrl.dismiss();
  }

  /**
   * get the meeting request list
   * @param edid event delegate id "not delegate id"
   * @param page pageination offset
   * @param infi_scroll is infinite scrolled
   */
  getMeetingRequestList(edid, page:any = 1, infi_scroll:any = null){
    let params = {
      timeslot_id: this.timeslot.id, 
      type: this.request_type, 
      edid: edid, 
      limit: 5, 
      page: page,
    }

    this.sched.getMeetingRequestList(params)
      .subscribe(r => {
        if(r.error == 0){
          if(!this.requests){
            this.requests = r.data;
          } else {
            this.requests.current_page = r.data.current_page;
            this.requests.next_page = r.data.next_page;
            this.requests.pages = r.data.pages;
            this.requests.previous_page = r.data.previous_page;
            this.requests.previous_page = r.data.previous_page;
            
            r.data.datas.forEach(val => {
              this.requests.datas.push(val);
            });
            
            if(infi_scroll){
              infi_scroll.target.complete();
            }
          }
        } else {
          this.sched.env.toast("Can't get meeting requests.")
        }
      });
  }

  /**
   * trigger the infinite scrolling
   * @param e 
   */
  infiScroll(e){
    if(this.requests.next_page){
      this.getMeetingRequestList(this.edid, this.requests.next_page, e);
    } else {
      e.target.disabled = true;
    }
  }

  /**
   * trigger the request for decline or accept action
   * @param delegate the delegate data this actually is the meeting sched
   * @param action the action to be used accept or decline
   */
  requestAction(delegate, action) {
    let formData = new FormData();

    formData.append('meeting_schedule_id', delegate.id)
    formData.append('action', action);
    formData.append('edid', this.edid);

    this.sched.requestAction(formData)
      .subscribe(r => {
        if(r.error == 0){
          if(action == 'decline' || action == 'cancel'){
            if(action == 'cancel'){
              this.cancelSuccess(delegate);
            } else {
              this.removeData(delegate);
            }
          }
          
          this.modalCtrl.dismiss('done');
        }
      })
  }

  removeData(delegate){
    let datas = [];
    this.requests.datas.forEach(val => {
      if(val.id != delegate.id){
        datas.push(val)
      }
    });
    this.requests.datas = datas;
  }

  /**
   * open a confirmation modal
   */
  async showConfirm(action, delegate) {
    let msg = 'Are you sure you want to accept <span class="fw-500 capitalize">' + delegate.del_fullname + '</span> meeting request?';
    let btn_save = 'Accept request';
    let title = 'Accept Meeting Request';

    if(action == 'decline') {
      title = 'Decline Meeting Request';
      msg = 'Are you sure you want to decline <span class="fw-500 capitalize">' + delegate.del_fullname+ '</span> meeting request?';
      btn_save = 'Decline request';
    }

    if(action == 'cancel') {
      title = 'Cancel Meeting Request';
      msg = 'Are you sure you want to cancel this meeting request?';
      btn_save = 'Cancel request';
    }

    const modal = await this.modalCtrl.create({
      component: PromptModalHeaderPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        title: title,
        msgHtml: msg,
        btn_save: btn_save,
        btn_cancel: 'No, close'
      }
    });

    modal.present();

    const { data } = await modal.onDidDismiss();
    if(data){
      console.log('data',data);
      this.requestAction(delegate, action);

      this.sched.env.storage.get('meeting_request_count').then((count) => {
        if(count > 0){
      console.log(count);
      console.log(count--);
          this.events.publish('meeting_request_count', count--, Date.now());
        }
      });

      this.dismiss();
    }
  }

  /**
   * cancel success popup
   */
  async cancelSuccess(delegate) {
    const modal = await this.modalCtrl.create({
      component: PromptModalHeaderPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        title: 'Meeting Request Cancelled',
        msgHtml: 'You have cancelled your meeting request to <span class="fw-500 capitalize">'+delegate.del_fullname+'<span>.',
        btn: 'Okay'
      }
    });
    modal.present();
    this.removeData(delegate);
  }

  async presentSocialModal(thisData, style, icon = null) {
    const modal = await this.modalCtrl.create({
      component: SocialMediaPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        'icon': icon,
        'class': style,
        'viewonly': false,
        'help': true,
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    if(data){
      // storing of social media to array
    }
  }
}
