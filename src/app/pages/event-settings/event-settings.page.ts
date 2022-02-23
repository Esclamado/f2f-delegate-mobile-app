import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';

import { EnvService } from 'src/app/lib/env.service';
import { CompanyService } from 'src/app/services/company.service';
import { EventFaqService } from 'src/app/services/event-faq.service';
import { EventService } from 'src/app/services/event.service';
import { GeneralService } from 'src/app/services/general.service';
import { Urls } from 'src/app/lib/urls';

@Component({
  selector: 'app-event-settings',
  templateUrl: './event-settings.page.html',
  styleUrls: ['./event-settings.page.scss'],
})
export class EventSettingsPage implements OnInit {

  event: any = null;
  event_id: any = null;
  delegate: any = null;
  company: any = null;
  faq_category: any = null;
  request_count: any = 0;

  constructor(
    protected _route: ActivatedRoute,
    private router: Router,
    public env: EnvService,
    public companyService: CompanyService,
    public eventFaq: EventFaqService,
    public eventService: EventService,
    public events: Events,
		private gen : GeneralService,
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
    let url = this.env.getUrl(Urls.api_featurecomparison_save);

    let formData = {
      'event_id': this.event_id,
      'type': 'event_details',
      'platform': this.env.getPlatform(),
    };

    this.gen.post(url, formData).subscribe(data=>{
      if(data.error == 0){
        this.env.redirect('event-profile/'+this.event_id);
      }
    });
  }
  
  gotoFaq(){
    this.env.storage.remove('homeFaq');
    this.env.storage.remove('faqLastPage');
    this.env.storage.set('faqLastPage', 'tabs/event-settings/'+this.event_id);
    this.router.navigate(['/event-faq/'+this.event_id]);
  }

  gotoSetting(){
    this.env.storage.set('event_setting', true);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        event_id: this.event_id
      }
    };
    this.router.navigate(['/settings'], navigationExtras);
  }

  gotoUserProfile(){
    this.env.storage.remove('last_page_user_profile');
    this.env.storage.set('last_page_user_profile', 'tabs/event-settings/'+this.event_id);
    this.router.navigate(['/delegate-profile']);
  }
}
