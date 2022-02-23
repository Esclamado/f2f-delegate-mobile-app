import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { CompanyService } from 'src/app/services/company.service';
import { EventService } from 'src/app/services/event.service';
import { TabService } from 'src/app/lib/tab/tab.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, LoadingController } from '@ionic/angular';
import { PromptModalPage } from 'src/app/modalpage/prompt-modal/prompt-modal.page';
import { EventFaqService } from 'src/app/services/event-faq.service';
import { DelegateService } from 'src/app/services/delegate.service';
import { TimezoneService } from 'src/app/services/timezone.service';
import { ClockService } from 'src/app/lib/clock.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  tab: any = null;
  delegate: any = null;
  company: any = null;
  selectedtab: any = 'myevent';

  clockService: any = null;
  
  events = {
    past: null,
    ongoingandupcomming: null
  }

  constructor(
    public env: EnvService,
    public companyService: CompanyService,
    public eventService: EventService,
    protected _route: ActivatedRoute,
    public router: Router,
    public modalCtrl: ModalController,
    public eventFaq: EventFaqService,
    public loadingController: LoadingController,
    public delegateService: DelegateService,
    public timezoneService: TimezoneService
  ){
    this.tab = new TabService();
    this.clockService =  new ClockService();
  }

  public degetateTimezoneOffset = this.timezoneService.delegateTimezoneOffset;

  ngOnInit() {
    this._route.paramMap.subscribe( url_param =>{
      this.getDelegate();
      this.env.storage.get('home_selected_tab').then((d) => {
        if(d){
          this.selectTab(d);
        }else{
          this.selectTab(this.selectedtab);
        }
      });
      this.getUpCommingOngoing('ongoingandupcomming');
     
    });

    this.timezoneService.allTimezones();

    
  }
  
  doRefresh(e){
    this.getUpCommingOngoing(this.selectedtab, e);
  }

  getDelegate(){
    this.env.storage.get('delegate').then((d) => {
      if(d){
        this.delegate = d;
        this.getCompany();
        this.selectTab('myevent');
        this.timezoneService.setDelegateTimezone(this.delegate.timezone);
        //console.log('this is the delegate timezone', this.delegate.timezone);
      }else{
        this.getDelegate();
      }
    });
  }
  
  getCompany(){
    this.env.storage.get('delegate').then((d) => {
        this.delegate = d;
        if(this.delegate){
          this.companyService.getCompanyById(this.delegate.company_id)
            .subscribe(r => {
              if(r.error == 0){
                this.company = r.data;
              }
            });
        }
    });
   
  }

  selectTab(tab) {
    this.counter = 0;
    this.selectedtab = tab;
    this.getUpCommingOngoing(tab);
    this.eventService.env.storage.set('home_selected_tab', tab);
  }

  getUpCommingOngoing(tab, refresher?){
    this.env.storage.get('delegate').then((d) => {
      this.delegate = d;
      if(this.delegate){
        let status = 'ongoingandupcomming';
        if(tab == 'mypastevent'){
          status = 'past'
        }

        this.eventService.getEvent(this.delegate.id, status).subscribe(r => {
          if(r.error == 0){
            this.events[status] = r.data;
            console.log("get event", this.events.ongoingandupcomming);
            this.degetateTimezoneOffset = this.timezoneService.delegateTimezoneOffset;
            console.log('this is the delegate timezone offset', this.degetateTimezoneOffset);
            /* todo for infinite scroll */
            /* if(!this.events[status]){
              this.events[status] = r.data;
            } else {
              
            } */
          }else{

            //this.forceLogout();
          }

          if(refresher){
            refresher.target.complete();
          }
        });
      }
    });
  }

  counter = 0;
  async checkEvent(event, event_id, status){

    this.env.storage.set('event', event);
    console.log('sss');
    setTimeout(r=>{
    console.log('sssss');
      this.gotoEventDashboard(event_id, status);
    }, 500);

    this.counter++;
    console.log(this.counter);
    if(this.counter == 1){
      this.counter++;    

      let formData = {
        'device_id': this.env.getDeviceId(),
        'platform': this.env.production_mode ? this.env.device.platform : 'android',
        'event_id': event_id
      };

      this.delegateService.savePlatform(formData)
      .subscribe(r => {
      });
    }
  }

  counter1 = 0;
  async checkVirtualEvent(event, event_id, status){

    this.env.storage.set('event', event);
    console.log('sss');
    setTimeout(r=>{
    console.log('sssss');
      this.goToVirtualDashboard(event_id, status);
    }, 500);

    this.counter1++;
    console.log(this.counter1);
    if(this.counter1 == 1){
      this.counter1++;    

      let formData = {
        'device_id': this.env.getDeviceId(),
        'platform': this.env.production_mode ? this.env.device.platform : 'android',
        'event_id': event_id
      };

      this.delegateService.savePlatform(formData)
      .subscribe(r => {
      });
    }
  }
  
  async faqPromptModal(event_id, status) {
    const modal = await this.modalCtrl.create({
      component: PromptModalPage,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        img_src: '/assets/icon/faq_popup.png',
        title: 'View FAQs?',
        msg: "We've made a video tutorial and list of some freequently asked questions, do you want to see it?", 
        faq_btn: true
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    this.counter = 0;
    if(data == 'event'){
      this.gotoEventDashboard(event_id, status);
    }else if(data == 'faq'){
      this.env.storage.set('homeFaq', true);
      this.env.storage.remove('faqLastPage');
      this.env.storage.set('faqLastPage', '/');
      this.router.navigate(['event-faq/'+event_id]);
    }
  }
  
  gotoEventDashboard(event_id, status){

    let formData = {
      'event_id': event_id,
      'delegate_id': this.delegate.id
    };

    this.eventService.saveEventSessionstats(formData)
    .subscribe(r => {
      if(r.error == 0){
        console.log('session', r);
      }
    });

    if(status == 'past'){
      this.eventService.env.storage.set('event_selected_tab', 'home');
      console.log('status_past',status);
      this.router.navigate(['/tabs/event/'+event_id]);
    }else{
      this.eventService.env.storage.set('event_selected_tab', 'delegates');
      console.log('status_sdadada',status);
      this.router.navigate(['/tabs/event/'+event_id]);
    }
  }
  goToVirtualDashboard(event_id, status){

    let formData = {
      'event_id': event_id,
      'delegate_id': this.delegate.id
    };

    this.eventService.saveEventSessionstats(formData)
    .subscribe(r => {
      if(r.error == 0){
        //console.log('session', r);
      }
    });

    if(status == 'past'){
      this.eventService.env.storage.set('event_selected_tab', 'home');
      //console.log('status_past',status);
      this.router.navigate(['/enhance-tabs/event-enhance/' +event_id]);
    }else{
      this.eventService.env.storage.set('event_selected_tab', 'delegates');
      //console.log('status_sdadada',status);
      this.router.navigate(['/enhance-tabs/event-enhance/'+event_id]);
    }

   /*  this.router.navigate(['/enhance-tabs/event-enhance']); */
  }

  // async forceLogout() {
  //   const loading = await this.loadingController.create({
  //     message: 'Please relogin..',
  //     duration: 1000
  //   });
  //   await loading.present();

  //   const { role, data } = await loading.onDidDismiss();

  //   this.env.removeAllStorage();
  //   this.env.deleteCookie();
  //   this.env.exchangeToken();
  //   this.env.requireLogIn();
  // }

  gotoSetting(){
    this.env.storage.remove('event_setting');
    this.router.navigate(['/settings']);
  }

  gotoUserProfile(){
    this.env.storage.remove('last_page_user_profile');
    this.env.storage.set('last_page_user_profile', '/');
    this.router.navigate(['/delegate-profile']);
  }

  count = 0;
  async checkVirtual(event, event_id, status){

    this.env.storage.set('event', event);
    //console.log('sss');
    setTimeout(r=>{
    //console.log('sssss');
      this.goToVirtualDashboard(event_id, status);
    }, 500);

    this.count++;
    //console.log(this.count);
    if(this.count == 1){
      this.count++;    

      let formData = {
        'device_id': this.env.getDeviceId(),
        'platform': this.env.production_mode ? this.env.device.platform : 'android',
        'event_id': event_id
      };

      this.delegateService.savePlatform(formData)
      .subscribe(r => {
      });
    }
  }
}
