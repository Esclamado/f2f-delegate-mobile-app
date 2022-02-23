import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SchedulesService } from 'src/app/services/schedules.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ScheduleMeetingInfoEnhancePage } from '../schedule-meeting-info-enhance/schedule-meeting-info-enhance.page'

@Component({
  selector: 'app-schedule-meeting-enhance',
  templateUrl: './schedule-meeting-enhance.page.html',
  styleUrls: ['./schedule-meeting-enhance.page.scss'],
})
export class ScheduleMeetingEnhancePage implements OnInit {

  @Input() timeslot: any = null;
  @Input() timeslot_id: any = null;
  @Input() delegate_id: any = null;
  @Input() schedules: any = null;
  @Input() event_id: any = null;
  @Input() event: any = null;

  @Input() called_by: any = null;
  
  data: any = null;
  selected: any = {
    id: null
  }

  search_string: string = "";
  searchPlaceholder: string = "Search a delegate, company or country";

  onStopTyping = new Subject<string>();

  constructor(
    public modalCtrl: ModalController,
    public sched: SchedulesService
  ) { 
    this.onStopTyping.pipe(debounceTime(400), distinctUntilChanged())
		.subscribe(value => {
      this.startSearch(value);
		});
  }

  ngOnInit() {
    this.getAvailableDelegate();

    if(this.called_by == 'chat_convos') {
      this.searchPlaceholder = "Search a delegate or company";
    }
  }

  dismiss(data=null){
    this.modalCtrl.dismiss(data);
  }

  /**
   * start the search for delegates
   * @param qryStr 
   */
  startSearch(qryStr){
    this.data = null;
    this.getAvailableDelegate(1);
  }

   /**
   * get all available delegate that was already
   * added into the event
   * @param page pagination number
   */
  getAvailableDelegate(page:number = 1, infi_scroll:any = null){
    if(this.called_by == 'event_notes' || this.called_by == 'chat_convos'){
      let params = {
        event_id: this.event_id,
        page: page,
        edid: this.delegate_id,
        limit: 4
      }
      if(this.search_string.length){
        params['search'] = this.search_string;
      }
      if(this.called_by == 'chat_convos' || this.called_by == 'event_notes') {
        this.sched.getAllDelegate(params)
          .subscribe(r => {
            this.setData(r, infi_scroll)
          });
      }
      
      // if(this.called_by == 'event_notes') {
      //   this.sched.getScheduledDelage(params)
      //     .subscribe(r => {
      //       console.log(r);
      //       this.setData(r, infi_scroll)
      //     });
      // }
    } 
    else {
      let params = {
        id: this.timeslot_id,
        page: page,
        delegate_id: this.delegate_id
      }
      if(this.search_string.length){
        params['search'] = this.search_string;
      }

      this.sched.getAvailableDelegate(params)
        .subscribe(r => {
          this.setData(r, infi_scroll)
        });
    }
  }

    /**
   * set the data to be used on template
   */
  setData(r, infi_scroll){
    if(r.error == 0){
      if(!this.data){
        this.data = r.data;
        //console.log('data value', this.data);
      } else {
        this.data.current_page = r.data.current_page;
        this.data.next_page = r.data.next_page;

        let d = r.data.datas;
        d.forEach(val => {
          this.data.datas.push(val);
        });

        if(infi_scroll){
          infi_scroll.target.complete();
        }
      }
    } else {
      this.sched.env.toast('Failed to get delegates')
    }
  }

  infiScroll(e){
    if(this.data.current_page <= this.data.next_page){
      this.getAvailableDelegate(this.data.next_page, e);
    } else {
      e.target.disabled = true;
    }
  }

  /**
   * set the delegate as selected
   * @param d delegate data
   */
  selectDelegate(d){
    this.selected = d;
    if(this.called_by == 'chat_convos'){
      this.passDelegateInfo();
    } else if(this.called_by == 'event_notes'){
      this.showEditNotePage();
    } else {
      this.showMeetingScheduleInfo();
    }
  }
  /**
   * close modal and pass the delegate's info 
   * into caller's screen
   */
  passDelegateInfo(){
    this.dismiss(this.selected);
  }

  /**
   * redirect to page of edting note
   */
  showEditNotePage(){
    this.sched.env.storage.remove('meeting-details').then(data => {

      console.log(this.selected);
      let add_note_delegate_info = {
        d2_profile_photo: this.selected.profile_photo,
        d2_company_name: this.selected.company_name,
        d2_fullname: this.selected.fullname
      }
      this.sched.env.storage.set('add_note_delegate_info', add_note_delegate_info).then(r => {
        this.dismiss();
        this.sched.env.redirect('/add-notes-enhance/' + this.selected.edid + '/' + this.selected.id);
      })
    });
  }

  /**
   * display the modal of meeting schedule information
   */
  async showMeetingScheduleInfo() {
    const modal = await this.modalCtrl.create({
      component: ScheduleMeetingInfoEnhancePage,
      componentProps: {
        timeslot: this.timeslot,
        delegate: this.selected,
        delegate_id: this.delegate_id,
        schedules: this.schedules,
        event_id: this.event_id,
        event: this.event
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    if(data == 'meeting-scheduled-success'){
      setTimeout(f => {
        this.modalCtrl.dismiss(data);
      }, 10);
    }else if(data == 'change_delegate'){

    }else{
      setTimeout(f => {
        this.modalCtrl.dismiss(data);
      }, 10);
    }
  }

}
