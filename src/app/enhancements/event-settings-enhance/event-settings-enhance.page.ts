import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { EnvService } from 'src/app/lib/env.service';
import { CompanyService } from 'src/app/services/company.service';
import { EventFaqService } from 'src/app/services/event-faq.service';
import { EventService } from 'src/app/services/event.service';
import { Events } from '@ionic/angular';

@Component({
  selector: 'app-event-settings-enhance',
  templateUrl: './event-settings-enhance.page.html',
  styleUrls: ['./event-settings-enhance.page.scss'],
})
export class EventSettingsEnhancePage implements OnInit {

  event: any = null;
  event_id: any = null;
  delegate: any = null;
  company: any = null;
  faq_category: any = null;
  request_count: any = 0;

  constructor(
    protected _route: ActivatedRoute,
    public router: Router,
    public env: EnvService,
    public companyService: CompanyService,
    public eventFaq: EventFaqService,
    public eventService: EventService,
    public events: Events
  ) { 
    this.env.storage.remove('add_note_delegate_info');
    this.env.storage.remove('from_meeting_details');

    events.subscribe('meeting_request_count', (n_count, time) => {
      console.log('ai ai ai', n_count);
      this.env.storage.set('meeting_request_count', n_count);
      this.request_count = n_count;
    });
  }

  ngOnInit() {
    console.log('event-setting.page');
    this.env.storage.get('event').then((data) => {
      console.log('data',data);
      if(data){
        this.event = data;
        if(this.event.total_meeting_request){
          this.events.publish('meeting_request_count', this.event.total_meeting_request, Date.now());
        }
      }
    });

    this._route.paramMap.subscribe( url_param =>{
      this.env.requireLogIn();
      this.event_id = + url_param.get('event_id');
      this.getDelegate();
      this.getEventFaqCategory();
    });
  }

  getDelegate(){
    this.env.storage.get('delegate').then((d) => {
      console.log("delegate",d);
      if(d){
        this.delegate = d;
        this.getCompany();
      }else{
        this.getDelegate();
      }
    });
  }

  getCompany(){
    this.env.storage.get('delegate').then((d) => {
      this.delegate = d;
    });
    
    if(this.delegate){
      this.companyService.getCompanyById(this.delegate.company_id)
        .subscribe(r => {
          if(r.error == 0){
            this.company = r.data;
          } else {
            this.env.toast(r.message);
          }
        });
    }
  }
  
  getEventFaqCategory(){
    let params = {
      event_id: this.event_id
    }

    this.eventFaq.getFaqCategory(params)
    .subscribe(r => {
      if(r.error == 0){
        if(r.data){
          this.faq_category = r.data.datas;
        }
      } 
    });
  }
  gotoEventProfile(){
    let formData = {
      'event_id': this.event_id,
      'type': 'event_details',
      'platform': this.env.getPlatform(),
    };

    this.eventService.saveFeatureComparison(formData)
    .subscribe(r => {
      if(r.error == 0){
        console.log('featuecomparison', r);
        this.env.redirect('event-profile-enhance/'+this.event_id);
      }
    });

    /* this.router.navigate(['event-profile-enhance']); */
  }
  gotoUserProfile(){
    this.env.storage.remove('last_page_user_profile');
    this.env.storage.set('last_page_user_profile', 'enhance-tabs/event-enhance/'+this.event_id);
    this.router.navigate(['/delegate-profile']);
  }

  gotoFaq(){
    this.env.storage.remove('homeFaq');
    this.env.storage.remove('faqLastPage');
    this.env.storage.set('faqLastPage', 'enhance-tabs/event-settings-enhance/'+this.event_id);
    this.router.navigate(['/event-faq/'+this.event_id]);
  }

  gotoSetting(){
    this.env.storage.set('event_setting', true);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        event_id: this.event_id
      }
    };
    this.router.navigate(['/setting-enhance'], navigationExtras);
  }
}
