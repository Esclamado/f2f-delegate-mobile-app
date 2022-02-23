import { Component, Input, OnInit } from '@angular/core';

import { ModalController } from '@ionic/angular';
import { EnvService } from 'src/app/lib/env.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { DelegateService } from 'src/app/services/delegate.service';
import { CustomSelectablePage } from 'src/app/modalpage/custom-selectable/custom-selectable.page';
import { CustomSelectableStatePage } from 'src/app/modalpage/custom-selectable-state/custom-selectable-state.page';
import { IonicSelectableComponent } from 'ionic-selectable';

@Component({
  selector: 'app-filter-delegate',
  templateUrl: './filter-delegate.page.html',
  styleUrls: ['./filter-delegate.page.scss'],
})
export class FilterDelegatePage implements OnInit {

  public prefs: any = {
    networks: [],
    services: [],
    states: [],
    specializations: [],
    countries: [],
    sectors: [],
    softwares: []
  }

  selectedServices: any;
  selectedSpecializations: any;
  selectedCountries: any;
  selectedDate: any;
  selectedTime: any;
  selectedList: any = 'all';
  country_id: any = null;

  services: any = [];
  specialization: any = [];
  countries: any = [];
  software: any = [];

  limit : any = 10;
  country_limit : any = 239;

  @Input() filters: any = {
    pref_countries_ids: [],
    pref_services_ids: [],
    pref_specialization_ids: [],
    selectedList: 'all',
  };
  @Input() filters_details: any = {
    pref_countries_ids_detail: [],
    pref_services_ids_detail: [],
    pref_specialization_ids_detail: [],
  };

  @Input() selected_date: any = null;
  @Input() selected_time: any = null;

  @Input() filter_counter: any = 0;
  @Input() schedules: any = null;
  @Input() timeslot: any = [];
  @Input() event: any = null;
  filter_time_disable: boolean = true;
  timeslot_placeholder = 'Please select date first';

  constructor(
    public env: EnvService,
    public prefService: PreferencesService,
    public delegateService: DelegateService,
    public modalCtrl: ModalController
  ) {

  }

  ngOnInit() {

    if(this.selected_date || this.selected_time){
      console.log('sadsadsasda',this.selected_date);
      this.selectedDate = this.selected_date;
      this.selectedTime = this.selected_time;
      this.filter_time_disable = false;
      let event_current_time = this.selected_date.event_current_time;
      this.selected_date.schedules.forEach(val => {
        if(val.type == 'timeslot'){
          let ts = val.data;
          if(event_current_time < ts.event_start_time_milisec){
            if(!ts.meeting_schedule){
              this.timeslot.push(val);
            }
          }
        }
      });
    }
    
    if(this.filters_details && this.filters){
      this.selectedServices = this.filters_details.pref_services_ids_detail;
      this.selectedSpecializations = this.filters_details.pref_specialization_ids_detail;
      this.selectedCountries = this.filters_details.pref_countries_ids_detail;
      this.selectedList = this.filters.selectedList;
    }

    if(this.schedules){
      let sched = [];
      this.schedules.forEach(val => {
        if(val.event_current_date <= val.milisec ){
          sched.push(val);
        }
      });
      this.schedules = sched;
    }
    console.log('filters_details',this.filters_details);
    console.log('filters',this.filters);
    console.log('schedules',this.schedules);
    
    this.env.storage.get('delegate_filter_country').then((country) => {
      if(country){
        this.country_id = country.id;
      }
    });

    this.getServices();
    this.getSpecializations();
    this.getCountries();
    this.getSoftwares();
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss();
  }
  
  formatSelected(ports: [], type) {
    if(ports){
      if(type == 'countries'){
        return ports.map(port => port['nicename']).join(', ');
      }else{
        return ports.map(port => port['name']).join(', ');
      }
    }
  }

  selectableChange(event: {component: IonicSelectableComponent, value: any }, prefType) {
    if(prefType == 'event_date'){
      console.log('event_Sched',event.value.schedules);
      this.selectedTime = null;

      let event_current_time = event.value.event_current_time;
      event.value.schedules.forEach(val => {
        if(val.type == 'timeslot'){
          let ts = val.data;
          if(event_current_time < ts.event_start_time_milisec){
            if(!ts.meeting_schedule){
              this.timeslot.push(val);
            }
          }
        }
      });

      this.filter_time_disable = false;
      if(this.timeslot.length > 0){
        this.timeslot_placeholder = 'Select Timeslot';
      }else{
        this.timeslot_placeholder = 'No available timeslot';
      }
    }

    console.log(this.selectedCountries);
  }

  getServices(){
    let url = this.prefService.getSetUrlParams('services', 1, this.limit);
    this.sendRequest(url, 'services');
  }

  getSpecializations(){
    let url = this.prefService.getSetUrlParams('specializations', 1, this.limit);
    this.sendRequest(url, 'specializations');
  }

  getCountries(){
    let url = this.prefService.getSetUrlParams('countries', 1, this.country_limit);
    this.sendRequest(url, 'countries');
  }

  getSoftwares(){
    let url = this.prefService.getSetUrlParams('softwares', 1, this.limit);
    this.sendRequest(url, 'softwares');
  }

  async customSelectable(){

    if(this.selectedCountries.length > 0){

      const modal = await this.modalCtrl.create({
        component: CustomSelectableStatePage,
        cssClass: 'my-custom-modal-css',
        componentProps: { 
          selectedCountries: this.selectedCountries,
          country_id: this.country_id
        }
      });

      modal.present();

      const { data } = await modal.onWillDismiss();
      if(data){
        this.selectedCountries = data.data;
        this.country_id = data.country_id;
      }
    }else{

      const modal = await this.modalCtrl.create({
        component: CustomSelectablePage,
        cssClass: 'my-custom-modal-css',
        componentProps: { 
        }
      });

      modal.present();

      const { data } = await modal.onWillDismiss();
      if(data){
        this.selectedCountries = data.data;
        this.country_id = data.country_id;
      }
    }
  }

  sendRequest(url: string, type: string){
    this.prefService.getData(url, type)
      .subscribe(data => {
        this.prefService.getHelper(data, type);
        if(data.error == 0){
          this.prefs[type] = data.data;
        }
      });
  }

  setPrefrence(prefData){
    let pref = [];
    if(prefData.length > 0){
      prefData.forEach((val, key) => {
        pref.push(val.id);
      });
    }

    return pref;
  }

  resetFilter(){
    this.filters = {
      pref_countries_ids: [],
      pref_services_ids: [],
      pref_specialization_ids: [],
      selectedList: 'all',
    };

    this.filters_details = {
      pref_countries_ids_detail: [],
      pref_services_ids_detail: [],
      pref_specialization_ids_detail: [],
    };

    this.modalCtrl.dismiss({
      'selected_date': null,
      'selected_time': null,
      'filters': this.filters,
      'filters_details': this.filters_details,
      'filter_counter': 0
    });
  }

  applyFilter(){
    this.filters_details['pref_countries_ids_detail'] = this.selectedCountries;
    this.filters_details['pref_services_ids_detail'] = this.selectedServices;
    this.filters_details['pref_specialization_ids_detail'] = this.selectedSpecializations;

    this.filters['pref_countries_ids'] = this.selectedCountries;
    this.filters['pref_services_ids'] = this.env.convertType(this.setPrefrence(this.selectedServices), 'object');
    this.filters['pref_specialization_ids'] = this.env.convertType(this.setPrefrence(this.selectedSpecializations), 'object');
    this.filters['selectedList'] = this.selectedList;

    this.checkFilter();

    this.modalCtrl.dismiss({
      'selected_date': this.selectedDate,
      'selected_time': this.selectedTime,
      'filters': this.filters,
      'filters_details': this.filters_details,
      'filter_counter': this.filter_counter
    });
  }

  checkFilter(){
    this.filter_counter = 0;
    let a = this;
    Object.keys(this.filters_details).forEach(function (key){
      if(a.filters_details[key].length > 0){
        a.filter_counter ++;
      }
    });
    if(this.filters['selectedList'] == 'only'){
      this.filter_counter ++;
    }

    if(this.selectedDate || this.selectedTime){
      this.filter_counter ++;
    }
  }
}

