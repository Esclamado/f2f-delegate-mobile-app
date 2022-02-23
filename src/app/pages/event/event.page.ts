import { Component, OnInit, ViewChild } from '@angular/core';
import { TabService } from 'src/app/lib/tab/tab.service';
import { SchedulesService } from 'src/app/services/schedules.service';
import { EventService } from 'src/app/services/event.service';
import { ClockService } from 'src/app/lib/clock.service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { DelegateService } from 'src/app/services/delegate.service';
import { SponsorService } from 'src/app/services/sponsor.service';
import { ModalController, Events } from '@ionic/angular';
import { EventFilterPage } from 'src/app/modalpage/event-filter/event-filter.page';
import { FilterDelegatePage } from 'src/app/modalpage/filter-delegate/filter-delegate.page';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ScheduleMeetingPage } from 'src/app/modalpage/schedule-meeting/schedule-meeting.page';
import { IonContent } from '@ionic/angular';
import { EventMeetingRequestListPage } from 'src/app/modalpage/event-meeting-request-list/event-meeting-request-list.page';
import { EnvService } from 'src/app/lib/env.service';
import { ScheduleMeetingInfoPage } from 'src/app/modalpage/schedule-meeting-info/schedule-meeting-info.page';
import { ChatboxPage } from 'src/app/modalpage/chatbox/chatbox.page';
import { PromptModalHeaderPage } from 'src/app/modalpage/prompt-modal-header/prompt-modal-header.page';
import { PromptModalPage } from 'src/app/modalpage/prompt-modal/prompt-modal.page';
import { NoshowService } from 'src/app/services/noshow.service';
import { GeneralService } from 'src/app/services/general.service';
import { Urls } from 'src/app/lib/urls';
import { TimezoneService } from 'src/app/services/timezone.service';

@Component({
  selector: 'app-event',
  templateUrl: './event.page.html',
  styleUrls: ['./event.page.scss'],
})
export class EventPage implements OnInit {

  @ViewChild(IonContent, {read: '', static: true}) content: IonContent;

  onStopTyping = new Subject<string>();

  tab: any = null;
  clockService: any = null;
  public event_id: any = 0;
  limit: any = 10;

  schedules: any = null;
  /**
   * hold the data of current delegate
   */
  _delegate: any = null;

  delegate: any = null;
  delegates: any = null;
  delegates_current_page: any = 1;
  delegates_total_page: any = 0;
  total_delegates_count: any = 0;
  delegate_infiniteScroll: any;
  moreDelegate: boolean = true;

  sponsors: any = null;
  sponsors_current_page: any = 1;
  sponsors_total_page: any = 0;
  total_sponsor_count: any = 0;

  search : any = '';
  ongoing_meeting: any = null;
  event: any = '';
  // eventB64: any = '';
  
  filters = {
    agenda: true,
    scheduled_meetings: true,
    available_timeslots: true,
    show_done_schedules: true,
    days: {},
    is_filtered: false,
    is_filteredDays: false
  };
  filter_counter: any = 0;

  filter_delegate: any = {
    pref_countries_ids: [],
    pref_services_ids: [],
    pref_specialization_ids: [],
    selectedList: 'all',
  };
  filter_delegate_details: any = {
    pref_countries_ids_detail: [],
    pref_services_ids_detail: [],
    pref_specialization_ids_detail: []
  };
  filter_delegate_counter: any = 0;
  filter_selected_date: any = null;
  filter_selected_time: any = null;

  skeleton_loader: any = [
    { id: '1'},
    { id: '2'},
    { id: '3'}
  ]; 

  display_event_title: boolean = true;

  ongoing_data: any;
  ongoing_meeting_details: any;

  test = 'https://www.youtube.com/embed/MPmW164QxMY';
  selectedTab:any = null;

  delegate_name : any = null;  
  reporter_delegate_id : any = null;
  reported_delegate_id : any = null;

  /**
   * holds the monthe name that will be displayed on
   * meeting schedule
   */
  monthName: any = '';

  /**
   * holds which meeting schedule date is selected
   */
  selected_ms_date: any = null;

  next_meeting_data: any;
  next_meeting: any = null;
  next_meeting_details: any;
  next_meeting_id: any;

  nowDate: any = null;

  constructor(
    private sched: SchedulesService,
    public delegateService: DelegateService,
    public sponsorService: SponsorService,
    protected _route: ActivatedRoute,
    private eventService: EventService,
    public modalController: ModalController,
    private router: Router,
    private env: EnvService,
    public eventListener: Events,
    private noshowService: NoshowService,
		private gen : GeneralService,
    public timezoneService: TimezoneService
  ) {
    
    this.tab = new TabService();
    this.clockService = new ClockService();

    this.onStopTyping.pipe(debounceTime(400), distinctUntilChanged())
		.subscribe(value => {
      this.startSearch(value);
    });

    eventListener.subscribe('tabs-scheduled-timeslot', (data, time) => {
      console.log('eeee',data.date);
      this.selectTab('schedule');
      setTimeout(r=>{
        console.log('id',data.id);
        let y = document.getElementById(data.id).offsetTop;
        this.content.scrollToPoint(0, y, 500);
        this.env.storage.remove('notif_date_milli');
       }, 3000);
    });
  }

  ngOnInit() {
    this._route.paramMap.subscribe( url_param =>{
      this.event_id = url_param.get('event_id');
      this.eventService.env.storage.get('event_selected_tab').then((data) => {
        this.selectedTab = data;
        if (data) {
          if(data == 'schedule'){
            this.selectTab(data);
          }else if(data == 'sponsors'){
            this.selectTab(data);
          }else{
            this.selectTab('delegates');
            this.initFunctions();
          }
        } else {
          this.selectTab('delegates');
          this.initFunctions();
        }
      });
    });
  }

  goBacktoHome(){
    this.clockService.stopTicker = true;
    this.resetValues();

    this.eventService.env.storage.remove('event_selected_tab');
    this.router.navigate(['/']);
  }

  initFunctions(){
    this.delegates_current_page = 1;
    this.sponsors_current_page = 1;
    this.moreDelegate = true;

    if(this.delegate_infiniteScroll){
      this.delegate_infiniteScroll.disabled = false;
    }

    this.resetValues();
    setTimeout(r => {
      this.getEventById(this.event_id);
      this.selectTab(this.tab.selectedtab);
    }, 100);

    this.getSponsors();
    this.getDelegates();
    this.getDelegate();
  }

  /**
   * (ionScrollStart)="logScrollStart()"
   * @param e 
   */
  logScrollStart(e){
  }

  /**
   * (ionScroll)="logScrolling($event)"
   * @param e 
   */
  content_scroll_top = 0;
  logScrolling(e){
    this.content_scroll_top = e.detail.scrollTop
  }

  /**
   * (ionScrollEnd)="logScrollEnd()"
   * @param e 
   */
  logScrollEnd(){
    if(this.content_scroll_top > 0){
      this.display_event_title = false;
    } else {
      this.display_event_title = true;
    }
  }

  doRefresh(e) {
    setTimeout(() => {
      // this.event = null;
      this.initFunctions();
      this.selectTab(this.selectedTab);
      e.target.complete().then(x=> {
        setTimeout(() => {
          this.content.getScrollElement().then((el) => {
            el.style.transform = null;
          });
        },1000)
      })
    }, 500);
  }

  startPullRefresh(e){
    setTimeout(() => {
      this.content.getScrollElement().then((el) => {
        el.style.transform = null;
      });
    },1000)
  }

  resetValues(){
    this.clockService = null;
    this.schedules = null;
    this.ongoing_meeting = null;
    this.next_meeting = null;
  }

  selectTab(tab) {
    let type;
    this.selectedTab = tab;
    if(tab == 'schedule'){
      type = 'my_schedules';

    }else if(tab == 'delegates'){
      type = 'delegates';
      
    }else if(tab == 'sponsors'){
      type = 'sponsor';
      
    }

    if(type){
      let url = this.env.getUrl(Urls.api_featurecomparison_save);

      let formData = {
        'event_id': this.event_id,
        'type': type,
        'platform': this.env.getPlatform(),
      };

      this.gen.post(url, formData).subscribe(data=>{
        if(data.error == 0){
        }
      });
    }
      
    this.getSchedules();
    this.tab.selectTab(tab);
    this.eventService.env.storage.set('event_selected_tab', tab);
  }

  getEventById(id: number) {
    this.eventService.env.storage.remove('event').then(f => {
      this.eventService.env.storage.remove('event_other_info').then(ff => {
        this.eventService.env.storage.remove('meeting-details').then(fff => {
          this.env.storage.get('delegate').then(data => {
            this._delegate = data;
            this.eventService.getEventById(id, data.id)
              .subscribe(r => {
                if(r.error == 0){
                  this.event = r.data;

                  this.setMSmonths();

                  if(this.event.total_meeting_request){
                    console.log('fdsfsfsfasdfasfas');
                    this.eventListener.publish('meeting_request_count', this.event.total_meeting_request, Date.now());
                  }

                  this.eventService.env.storage.set('event', this.event);
                  this.clockService = new ClockService();
                  /* this.clockService.setDateTime(this.event.event_location_datetime).startTime(); */        
                  this.clockService.setDateTime(this.event).startTime();    

                  let format = 'y-m-d';
                  this.nowDate = this.getnowDate(format);
                  console.log('nowDate', this.nowDate);

                  this.setMSDay();

                } else {
                  this.sched.env.toast(r.message);
                }
            });
          });
        });
      });
    });
  }

  getSchedules(){
    let url = this.env.getUrl(Urls.mapi_event_schedule);
    url += '?event_id=' + this.event_id;

    this.gen.get(url).subscribe(data =>{
      if(data.error == 0){
        this.schedules = data.data;
        console.log('rhan_getSchedules', this.schedules);

        this.env.storage.get('notif_date_milli').then((milli) => {
          if(milli){
            this.selected_ms_date = milli;
            this.selectDay(milli);
          }else{

            let day_counter = 0;
            this.event.days.forEach((val, key) => {
              if(day_counter == 0){
                if(val.milisec == val.e_current_date){
                  this.selected_ms_date = val.milisec;
                  day_counter++;
                }
              }
            });
            
            if(!day_counter){
              this.selected_ms_date = this.schedules[0].milisec;
            }
          }
        });

        this.eventService.env.storage.set('event_schedules', this.schedules);
        this.getOngoingMeeting(true);
        this.eventService.env.storage.set('event_delegate_id', data.event_delegate_id);
      } else {
        this.sched.env.toast(data.message);
      }
    });
  }

  getDateFormat(val){
    let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    let d = val.milisec * 1000;
    if(val.date){
      d = val.date
    }

    let _date = new Date(d);
    let month = months[_date.getMonth()];
    let day_name = dayNames[_date.getDay()];
    let date = _date.getDate();
    let year = _date.getFullYear();

    return day_name+', '+month+' '+date+', '+year;
  }

  /**
   * which scheduled meeting is on going
   */
  getOngoingMeeting(resetDayFilter:boolean = true){
    this.schedules.forEach((val, key) => {
    
      val.filter_date = this.getDateFormat(val);

      this.schedules[key] = val;

      if(resetDayFilter){

        if(typeof this.filters.days['day_'+val.milisec] === 'undefined'){
          this.filters.days['day_'+val.milisec] = true;
          // console.log('filters.days filters.days filters.days');
        }
      }
      
      // let eventDelegateIdSaved = false;
      val.schedules.forEach(sval => {
        if(sval.type === 'timeslot'){
          let ts = sval.data;
          if(ts.meeting_schedule){
            if(ts.meeting_schedule.state == 'On-going' && (ts.meeting_schedule.status == '1' || ts.meeting_schedule.status == '3')){
              this.ongoing_meeting = ts.meeting_schedule;
              this.ongoing_data = val;
              this.ongoing_meeting_details = ts;
              setTimeout(r=>{
                let y = document.getElementById('on-going').offsetTop;
                this.content.scrollToPoint(0,y,500);
                /* let y = document.getElementById('on-going').scrollIntoView();
                this.content.scrollTo(0, y); */
              }, 50);
            } else if(ts.meeting_schedule.state == 'Upcomming' && (ts.meeting_schedule.status == '1' || ts.meeting_schedule.status == '3')) {
              if(val.date == this.nowDate){
                if(!this.ongoing_meeting){
                  if(!this.next_meeting){
                    this.next_meeting = ts.meeting_schedule;
                    this.next_meeting_data = val;
                    this.next_meeting_details = ts;
                    this.next_meeting_id = this.next_meeting_details.id;
                  }
                }
                setTimeout(r => {
                  let y = document.getElementById('upcomming').offsetTop;
                  this.content.scrollToPoint(0, y, 500);
                  /* let y = document.getElementById('on-going').scrollIntoView();
                  this.content.scrollTo(0, y); */
                }, 50);
              }
            }
          }
        }

        sval.filter_time = sval.data.start_time+' - '+sval.data.end_time;
        sval.candisplay = true;
      });
    });
  }

  /**
   * do tha request to enable or disable timeslot
   * @param ts timeslot object/array 
   */
  blockUnblock(ts: any = null){
    let formData = new FormData();

    let v = 'true';
    if(ts.enabled){
      v = 'false';
    }

    formData.append('status', v);
    formData.append('timeslot_id', ts.id);
    formData.append('event_delegate_id', ts.event_delegate_id);


    this.sched.setStatus(formData)
      .subscribe(r => {
        this.env.toast(r.message, 'toastsuccess');
      });
  }

  /**
   * start search for specific selected tab
   */
  startSearch(searchString){
    if(this.tab.selectedtab == 'schedule') {
      this.startSearchForSchedules(searchString);
    }
    if(this.tab.selectedtab == 'delegates') {
      this.searchDelegate();
    }
  }

  /**
   * @param searchString the string to be used on searching to array
   * this will no fetch any record from server
   * but only search for the existing data on schedules
   */
  searching: boolean = false;
  startSearchForSchedules(searchString: string){
    this.schedules.forEach(val => {
      val.schedules.forEach(sval => {
        if(sval.type === 'timeslot'){
          if(searchString.length){
            this.searching = true;
            let ms = sval.data.meeting_schedule;
            if(ms){
              let fn = this.compareString(searchString, ms.delegate_fullname);
              let cn = this.compareString(searchString, ms.delegate_company_name);
              let ccn = this.compareString(searchString, ms.delegate_company_country_nicename);
              let ccs = this.compareString(searchString, ms.delegate_company_state);
              
              if(fn || cn || ccn || ccs){
                sval.candisplay = true;
              } else {
                sval.candisplay = false;
              }
            } else {
              sval.candisplay = false;
            }
          } else {
            this.searching = false;
            sval.candisplay = true;
          }
        }
        if(sval.type === 'agenda'){
          if(searchString.length){
            sval.candisplay = false;
          } else {
            sval.candisplay = true;
          }
        }
      });
    });
  }

  /**
   * compare the two string for search functionality
   * @param query string that is typed on the search box
   * @param target target string to compare with
   */
  compareString(query:string, target:string){
    let q = query.toLowerCase();
    let result = target.toLowerCase().indexOf(q) > -1;
    return result;
  }

  /**
   * show filters modal
   */
  showFilters(){
    if(this.tab.selectedtab == 'schedule') {
      this.presentModalFilter();
    }

    if(this.tab.selectedtab == 'delegates') {
      this.presentModalFilterDelegate();
    }
  }

  resetFilter(){
    this.filters.agenda = true;
    this.filters.scheduled_meetings = true;
    this.filters.available_timeslots = true;
    this.filters.show_done_schedules = true;
    this.filters.is_filtered = false;
    this.filters.is_filteredDays = false;
    this.searching = false;
    this.search = '';
    this.filter_counter = 0;
    for (let key of Object.keys(this.filters.days)) {
      this.filters.days[key] = true;
    }
  }

  /**
   * display filter modal for timeslots and agenda
   */
  async presentModalFilter() {
    const modal = await this.modalController.create({
      component: EventFilterPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        event: this.event,
        schedules: this.schedules,
        filters: this.filters
      }
    });

    modal.present();
    const { data } = await modal.onWillDismiss();
    this.schedules = data.schedules;

    this.getOngoingMeeting(false);

    if(this.filters){
      this.filter_counter = 0;
      if(this.filters.agenda == false){
        this.filter_counter ++;
      }
      if(this.filters.scheduled_meetings == false){
        this.filter_counter ++;
      }
      if(this.filters.available_timeslots == false){
        this.filter_counter ++;
      }
      if(this.filters.show_done_schedules == false){
        this.filter_counter ++;
      }
      if(!this.filters.days){
        this.filter_counter ++;
      }
    }
  }

  /**
   * display filter modal for delegate
   */
  async presentModalFilterDelegate() {
    const modal = await this.modalController.create({
      component: FilterDelegatePage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        event: this.event,
        filters: this.filter_delegate,
        filters_details: this.filter_delegate_details,
        filter_counter: this.filter_delegate_counter,
        schedules: this.schedules,
        selected_date: this.filter_selected_date,
        selected_time: this.filter_selected_time,
      }
    });

    modal.present();
    const { data } = await modal.onWillDismiss();
    if(data){
      this.filter_delegate = data.filters;
      this.filter_delegate_details = data.filters_details;
      this.filter_delegate_counter = data.filter_counter;
      this.filter_selected_date = data.selected_date;
      this.filter_selected_time = data.selected_time;

      /* Reset the list of delegates */
      this.delegates_current_page = 1;
      this.delegates = null;
      this.delegates_total_page = 0;
      this.total_delegates_count = 0;
      this.getDelegates();
    }
  }

  searchDelegate(){
    this.delegates_current_page = 1;
    this.delegates = null;
    this.delegates_total_page = 0;
    this.total_delegates_count = 0;
    this.moreDelegate = true;
    this.getDelegates();
  }

  getDelegates(infiniteScroll=null){
    this.eventService.env.storage.get('delegate').then((d) => {
      if(d){
        let thisGetForm = {
          event_id: this.event_id,
          app_delegate_id: d.id,
          limit: this.limit,
          sort: 'id',
          order: 'asc',
          search: this.search,
          page: this.delegates_current_page,
          pref_services_ids: this.filter_delegate.pref_services_ids,
          pref_specialization_ids: this.filter_delegate.pref_specialization_ids,
          filter_location: JSON.stringify(this.filter_delegate.pref_countries_ids),
          filter_timeslot: this.filter_selected_time ? this.filter_selected_time.data.id : ''
        };

        this.delegateService.getDelegate(thisGetForm)
        .subscribe(d => {
          if(d.error == 0){
            this.delegates_current_page = d.data.current_page;
            this.delegates_total_page = d.data.total_page;
            this.total_delegates_count = d.data.total_count;

            if(!infiniteScroll) { 
              this.delegates = []; 
            }

            let _delIds = '';
            if(d['data']['datas'].length > 0){
              d['data']['datas'].forEach((cat, idx) => {
                cat['same_company_meeting_count'] = 0;
                this.delegates.push(cat);
                let keyIndex = this.delegates.length - 1;
                _delIds += cat.id + '-' + keyIndex + '_';
              });
            }

            let params = {
              delegate_ids: _delIds,
              event_id: this.event_id
            }

            /** 
             * get the delegate's company from server return
             * and display the all meeting count with the same 
             * company
             */
            this.delegateService.getSameCompanyMeeting(params)
            .subscribe(r => {
              if(r.data){
                r.data.forEach(val => {
                  let delegatesId = parseInt(this.delegates[val.keyIndex].id);
                  let _delegatesId = parseInt(val.delegate_id);
                  if(delegatesId === _delegatesId){
                    this.delegates[val.keyIndex].same_company_meeting_count = val.totalcount;
                  }
                });
              }
            });

            if(infiniteScroll){
              this.delegate_infiniteScroll.target.complete();
            }
          }
        });
      }
    });
  }

  loadData(event){
    this.delegate_infiniteScroll = event;
    this.delegates_current_page += 1;
    if(this.delegates_current_page <= this.delegates_total_page) {
      this.moreDelegate = true;
      this.getDelegates(this.delegate_infiniteScroll);
    } else {
      this.moreDelegate = false;
      //this.delegate_infiniteScroll.target.disabled = true;
    } 
  }

  getSponsors(infiniteScroll=null){
    let thisGetForm = {
      event_id: this.event_id,
      limit: this.limit,
      sort: 'id',
      order: 'asc',
      search: this.search,
      page: this.sponsors_current_page
    };

    this.sponsorService.getSponsor(thisGetForm)
    .subscribe(d => {
      if(d.error == 0){
        this.sponsors_current_page = d.data.current_page;
        this.sponsors_total_page = d.data.total_page;
        this.total_sponsor_count = d.data.total_sponsor_count;
        
        if(!infiniteScroll) {
          this.sponsors = []; 
        }


        if(d['data']['datas']){
          d['data']['datas'].forEach((cat, idx) => {
            this.sponsors.push(cat);
          });
        }

        if(infiniteScroll){
          infiniteScroll.target.complete();
        }
      }
    });
  }

  gotoSponsor(sponsor){
    let navigationExtras = {
      queryParams: {
        sponsor: JSON.stringify(sponsor)
      }
    };
    this.router.navigate(['sponsor-profile'], navigationExtras);
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
        this.router.navigate(['event-profile/'+this.event_id]);
      }
    });
  }
  
  /**
   * empty states function
   */
  get dayFilterSelectAll() {
    let obKey = Object.keys(this.filters.days);
    return obKey.every( (val, i, arr) => this.filters.days[val] === false );
  }

  get canDisplayPassedTS(){
    let canDisplay = true;
    if(this.filters.is_filtered){
      if(this.filters.available_timeslots){
        canDisplay = false;
      }
      else if(!this.filters.available_timeslots && this.filters.scheduled_meetings){
        canDisplay = false;
      }
      else if(!this.filters.available_timeslots && this.filters.agenda){
        canDisplay = false;
      }
    }
    return canDisplay;
  }

  get canDisplayAvailable(){
    let canDisplay = true;
    if(this.filters.is_filtered){
      if(!this.filters.available_timeslots) {
        canDisplay = false;
      }
    }
    return canDisplay;
  }

  /**
   * return boolean 
   * @param key the day schedule key of array
   */
  dayScheduleSelectAll(key) {
    let sched = this.schedules[key].schedules;
    let eachSched = false;

    /* search key empty state */
    if(this.filters.agenda && this.filters.scheduled_meetings && this.filters.available_timeslots && this.searching){
      let hasItem = false;
      sched.forEach(val => {
        if(val.candisplay){
          hasItem = true;
        }
      });
      if(hasItem){
        eachSched = false;
      } else {
        eachSched = true;
      }
    }
    if(!this.filters.agenda && !this.filters.scheduled_meetings && !this.filters.available_timeslots){
      eachSched = sched.every( (val, i, arr) => val.candisplay === false );
      if(!eachSched){
        eachSched = true;
      }
    }
    if(this.filters.agenda && !this.filters.scheduled_meetings && !this.filters.available_timeslots){
      eachSched =  this.checkCanViewFilteredSlot(sched, 'agenda', true);
    }
    if(!this.filters.agenda && this.filters.scheduled_meetings && !this.filters.available_timeslots){
      eachSched =  this.checkCanViewFilteredSlot(sched, 'timeslot', true, true);
    }
    if(!this.filters.agenda && !this.filters.scheduled_meetings && this.filters.available_timeslots){
      eachSched =  this.checkCanViewFilteredSlot(sched, 'timeslot', true, false);
    }

    return eachSched;
  }

  /**
   * checker if the solot is pass 
   * @param ts timeslot
   * return boolean true or false
   * this function is called on template
   */
  asdadasdasd: boolean = false;
  isPassAway(ts: any){
    if(ts.isPassAway === 'yes'){
      return true;
    } else {
      if(this.clockService){

        let nowDate = this.getnowDate();
        let start_time_stamp = ts.start_time_stamp.split(" ");
        start_time_stamp = start_time_stamp[0]+'T'+start_time_stamp[1]+'Z';

        let _nowDate = new Date(nowDate);
        let _tsStart = new Date(start_time_stamp);

        // if(!this.asdadasdasd){
        //   this.asdadasdasd = true;

        //   console.log('ispassedawwwwwayyyy',
        //     _nowDate.valueOf(), nowDate, 
        //     _tsStart.valueOf(), start_time_stamp,
        //     ts
        //   );
        // }

        if(_nowDate.valueOf() >= _tsStart.valueOf()){
          // ts.isPassAway = 'yes';
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  /**
   * return the date converted to timestamp
   */

  getnowDate(format?) {
    let y = this.clockService.today.getFullYear();
    let m = this.clockService.checkTime(this.clockService.today.getMonth() + 1);
    let d = this.clockService.today.getDate();
    let hours = this.clockService.checkTime(this.clockService.today.getHours());
    let min = this.clockService.today.getMinutes();
    let s = this.clockService.today.getSeconds();
    min = this.clockService.checkTime(min);
    s = this.clockService.checkTime(s);
    d = this.clockService.checkTime(d);
    if(format){
      if(format == 'y-m-d'){
        return y + '-' + m + '-' + d;
      }
    }else{
      return y + '-' + m + '-' + d + 'T' + hours + ':' + min + ':' + s + 'Z';
    }
  }

  /**
   * checker if the event request is valid 
   */
  dddddddds: boolean = false;
  canSetSchedule(){
    if(this.clockService){
      
      let nowDate = this.getnowDate();
      let start_time_stamp = this.dateFormat(this.event.request_start_date)+'T'+this.clockService.convertTo24Hrs(this.event.request_start_time)+':00Z';
      let end_time_stamp = this.dateFormat(this.event.request_end_date)+'T'+this.clockService.convertTo24Hrs(this.event.request_end_time)+':00Z';

      let _nowDate = new Date(nowDate);
      let _tsStart = new Date(start_time_stamp);
      let _tsEnd = new Date(end_time_stamp);

      // if(!this.dddddddds){
      //   console.log('nowDate',nowDate);
      //   console.log('start_time_stamp',start_time_stamp);
      //   console.log('_nowDate',_nowDate);
      //   console.log('_tsStart',_tsStart);
      //   console.log(end_time_stamp);
      //   console.log('event', this.event);
      //   console.log('event', _tsStart.valueOf() +'<='+ _nowDate.valueOf() +' '+ _tsEnd.valueOf() +'>='+ _nowDate.valueOf());
      //   this.dddddddds = true;
      //   console.log('rhannipham',
      //     _nowDate.valueOf(), 'nowDate', 
      //     _tsStart.valueOf(), 'start_time_stamp',
      //     _tsEnd.valueOf(), 'end_time_stamp'
      //   );
      // }

      if(_tsStart.valueOf() <= _nowDate.valueOf() && _tsEnd.valueOf() >= _nowDate.valueOf()){
        this.event.canSetSchedule = true;
        return true;
      } else {
        this.event.canSetSchedule = false;
        return false;
      }
    } else {
      return false;
    }
  }

  dateFormat(date){
    let _date = date.split("/");
    return _date[2]+'-'+_date[0]+'-'+_date[1];
  }

  /**
   * return boolean
   * look from the each item on schedule if it is exist or not
   * @param sched the schedule timeslots
   * @param itemMustValue boolean | is item must exist or not
   */
  checkCanViewFilteredSlot(sched: any, type:string = 'timeslot', itemMustValue: boolean = false, isScheduled: boolean = false){
    let hasItem = false;

    sched.forEach(item => {

      if(item.type == 'agenda' && type == item.type){
        hasItem = true;
      }

      if(item.type == 'timeslot' && type == item.type){
        if(isScheduled && item.data.meeting_schedule){
          hasItem = true;
        }
        if(!isScheduled && !item.data.meeting_schedule){
          hasItem = true;
        }
        // if(!isScheduled && !item.data.meeting_schedule && item.data.isPassAway == 'no'){
        //   hasItem = true;
        // }
      }
    });

    if(hasItem){
      return false;
    } else {
      return true;
    }
  }
  /**
   * end empty states function
   */

  /**
   * show modal for scheduling a meeting
   * @param timeslot_id
   * @param delegate_id is the event_delegate id not the delegate id
   */
  async scheduleAMeeting(timeslot, timeslot_id, delegate_id) {

    const modal = await this.modalController.create({
      component: ScheduleMeetingPage,
      componentProps: {
        timeslot: timeslot,
        timeslot_id: timeslot_id,
        delegate_id: delegate_id,
        schedules: this.schedules,
        event_id: this.event_id,
        event: this.event
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    if(data == 'meeting-scheduled-success'){
      setTimeout(f => {
        this.getDelegates();
        this.eventService.env.storage.get('event_selected_tab').then((data) => {
          if(data){
            this.selectTab(data);
            this.env.storage.set('notif_date_milli', this.selected_ms_date);
            this.getSchedules();
          }else{
            this.selectTab('delegates');
          }
        });
      }, 10);
    }else if(data == 'autoapproved-meeting-scheduled-success'){
      setTimeout(f => {
        this.sched.getSchedules(this.event_id)
        .subscribe(r => {
          if(r.error == 0){
            this.getDelegates();
            this.eventService.env.storage.remove('event_schedules');
            this.eventService.env.storage.set('event_schedules', r.data);
            r.data.forEach((schedule) => {
              if(schedule.schedules.length > 0){
                schedule.schedules.forEach((sched) => {
                  if(sched.data){
                    if(sched.data.id == timeslot.id){
                      setTimeout(f => {
                        this.gotoDelegateMeetingDetails(sched.data.meeting_schedule);
                      }, 10);
                    }
                  }
                });
              }
            });
          }
        });
      }, 10);
    }
  }

  gotoDelegateProfile(delegate_id){
    this.eventService.env.storage.set('event', this.event);
    this.router.navigate(['delegate-profile/'+delegate_id+'/'+this.event_id]);
  }

  gotoUserProfile(){
    this.env.storage.remove('last_page_user_profile');
    this.env.storage.set('last_page_user_profile', '/tabs/event/'+this.event_id);
    this.router.navigate(['/delegate-profile']);
  }

  gotoMeetingDetails(data, meeting_details){
  
    meeting_details.filter_date = data.filter_date;
    meeting_details.milisec = data.milisec;

    let edid = meeting_details.meeting_schedule.delegate1;
    if(meeting_details.meeting_schedule.delegate1 == meeting_details.event_delegate_id){
      edid = meeting_details.meeting_schedule.delegate2;
    }
    let delegate = {
      edid: edid,
      fullname: meeting_details.meeting_schedule.delegate_fullname
    }

    let event = {
      schedules: this.schedules,
      event_id: this.event_id,
      delegate_id: meeting_details.event_delegate_id,
      delegate: delegate
    }

    this.eventService.env.storage.set('event_other_info', event);
    this.eventService.env.storage.set('meeting-details', meeting_details);
    
    this.router.navigate(['meeting-details']);
  }

  /**
   * open a modal
   * the list of request for particular timeslot
   */
  async showRequestListModal(day, timeslot) {
    if(timeslot.meeting_schedule){
      const modal = await this.modalController.create({
        component: EventMeetingRequestListPage,
        componentProps: {
          day: day,
          timeslot: timeslot,
          request_type: timeslot.meeting_schedule.setter.toLowerCase(),
          from_event: true
        }
      });

      modal.present();
      const { data } = await modal.onDidDismiss();
      if(data){
        this.env.storage.set('notif_date_milli', this.selected_ms_date);
        this.getSchedules();
      }
    }
  }


  /**
   * redirect to add note page but save the variable needed first
   */
  addNote(delegate){
    this.sched.env.storage.remove('meeting-details').then(data => {

      console.log('sssss',delegate);
      let add_note_delegate_info = {
        d2_profile_photo: delegate.profile_photo_url,
        d2_company_name: delegate.company_name,
        d2_fullname: delegate.fullname
      }
      this.sched.env.storage.set('note_prev_page', '/tabs/event/'+this.event_id);
      this.sched.env.storage.set('add_note_delegate_info', add_note_delegate_info).then(r => {
        this.sched.env.redirect('/add-notes/' + delegate.event_delegateid + '/' + delegate.event_delegateid);
      })
    });
  }


  viewNote(delegate){
    this.env.redirect('/note/' + this.event_id + '/' + delegate.event_notes);
  }

  /*
  * For delegate tab
  * Set Meeting Schedule
  */
  scheduleDelegateMeeting(delegate) {
    delegate['ed_id'] = delegate.event_delegateid;
    this.env.storage.get('event_schedules').then((schedule) => {
      this.env.storage.get('event').then((data) => {
        this.showMeetingScheduleInfo(schedule, delegate, data.delegate.id);
      });
    });
  }

  /**
   * display the modal of meeting schedule information
   */
  async showMeetingScheduleInfo(schedule, delegate, delegate_id) {
    delegate['company_name'] = delegate.company.name;
    delegate['company_sector'] = delegate.company.pref_sector_name;
    delegate['company_country_flag'] = delegate.company_country.iso;
    delegate['company_country_name'] = delegate.company_country.nicename;

      const modal = await this.modalController.create({
      component: ScheduleMeetingInfoPage,
      componentProps: {
        delegate: delegate,
        delegate_id: delegate_id,
        schedules: schedule,
        event_id: this.event_id,
        event: this.event
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('meeting-scheduled-success',data);
    //if(data == 'meeting-scheduled-success'){
      this.delegates_current_page = 1;
      this.delegates = null;
      this.delegates_total_page = 0;
      this.total_delegates_count = 0;
      this.getDelegates();
      this.getSchedules();
    //}
  }

  gotoDelegateMeetingDetails(meeting_schedule){
    
    this.env.storage.get('event_schedules').then((schedule) => {

      let meeting_details = null;
      let data = null;
      schedule.forEach((sched, idx) => {
        sched.filter_date = this.getDateFormat(sched);
        if(sched.schedules){
          sched.schedules.forEach((timeslot) => {
            if(timeslot.data){
              console.log('this', timeslot);
              if(timeslot.data.id == meeting_schedule.time_slot_id){
                meeting_details = timeslot.data;
                data = sched;
                
                meeting_details.filter_date = this.getDateFormat(data);
                meeting_details.milisec = data.milisec;

                let edid = meeting_details.meeting_schedule.delegate1;
                if(meeting_details.meeting_schedule.delegate1 == meeting_details.event_delegate_id){
                  edid = meeting_details.meeting_schedule.delegate2;
                }
                let delegate = {
                  edid: edid,
                  fullname: meeting_details.meeting_schedule.delegate_fullname
                }

                let event = {
                  schedules: schedule,
                  event_id: this.event_id,
                  delegate_id: meeting_details.event_delegate_id,
                  delegate: delegate
                }

                this.eventService.env.storage.set('event_other_info', event);
                this.eventService.env.storage.set('meeting-details', meeting_details);
                this.selectDay(this.selected_ms_date);
                this.env.storage.set('notif_date_milli', this.selected_ms_date);
                
                this.router.navigate(['meeting-details']);
              }
            }
          });
        }
      });
    });
  }

  async showChatbox(delegate_id){
    let myId = this._delegate.id;

    if(myId && delegate_id){
      const modal = await this.modalController.create({
        component: ChatboxPage,
        componentProps: {
          my_id: myId,
          chat_with_id: delegate_id,
          event_id: this.event_id,
        }
      });
  
      modal.present();
    }
  }

  /**
   * open a confirmation modal to report as no show
   * 
   */
  async reportAsNoshow(day, meeting){
    meeting.filter_date = day.filter_date;
    meeting.milisec = day.milisec;

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

    const modal = await this.modalController.create({
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
            meeting['no_show'] = r.data;
            this.eventService.env.storage.set('meeting-details', meeting);
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

    const modal = await this.modalController.create({
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
    const modal = await this.modalController.create({
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

  gotoExternalBrowser(url){
    this.env.inAppBrowser(url);
  } 

  /**
   * this will set the month to be displayed 
   * on meeting schedules
   */

  setMSmonths(){
    console.log('setMSmonths',this.event);
    if(this.event){
      let days = this.event.days;

      let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      let first = new Date(days[0].milisec * 1000);
      let last = new Date(days[days.length - 1].milisec * 1000);
      
      let mon = '';
      if(first.getMonth() == last.getMonth()){
        mon += months[first.getMonth()];
      } else {
        mon += months[first.getMonth()] + " - " + months[last.getMonth()];
      }

      console.log('first',first);
      console.log('last',last);

      this.monthName = mon;
    }
  }


  /**
   * set the days that will be used as days tabs
   */
  setMSDay(){
    if(this.event){
      console.log('this.event.days', this.event.days);
      let days = this.event.days;
      let day_counter = 0;
      days.forEach((val, key) => {
        this.env.storage.get('notif_date_milli').then((milli) => {
          console.log('milli', milli);
          if(milli){
            if(day_counter == 0){
              if(val.milisec == milli){
                this.selected_ms_date = milli;
                this.selectDay(milli);
                day_counter++;
              }
            }
          }else{
            if(day_counter == 0){
              if(val.milisec == val.e_current_date){
                this.selected_ms_date = val.milisec;
                this.selectDay(val.milisec);
                day_counter++;
              }
            }
          }
        });

        //let _date = new Date(val.milisec * 1000);
        let _date = new Date(val.formatted_date);

        let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        val.day_name = dayNames[_date.getDay()];
        val.date = _date.getDate();

        this.event.days[key] = val;
      });

      console.log('day_counter', day_counter);
      if(!day_counter){
        this.selected_ms_date = days[0].milisec;
        this.selectDay(days[0].milisec);
      }
    }
  }

  /**
   * set the selected day
   */
  selectDay(dayMilisec){
    this.env.storage.remove('notif_date_milli');
    this.selected_ms_date = dayMilisec;
  }

  getDelegate(){
    this.env.storage.get('delegate').then((d) => {
      if(d){
        this.delegate = d;
      }
    });
  }

  viewItinerary(){
    let navigationExtras: NavigationExtras = {
      queryParams: {
        event: JSON.stringify(this.event),
        prev_page: '/tabs/event/'+ this.event.id,
      }
    };

    this.router.navigate(['/event-itinerary'], navigationExtras);
  }
}

