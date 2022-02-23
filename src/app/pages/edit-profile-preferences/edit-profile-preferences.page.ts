import { Component, OnInit } from '@angular/core';

import { EnvService } from 'src/app/lib/env.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { DelegateService } from 'src/app/services/delegate.service';

import { ModalController, Events } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ActivatedRoute } from '@angular/router';
import { PromptModalPage } from 'src/app/modalpage/prompt-modal/prompt-modal.page';

@Component({
  selector: 'app-edit-profile-preferences',
  templateUrl: './edit-profile-preferences.page.html',
  styleUrls: ['./edit-profile-preferences.page.scss'],
})
export class EditProfilePreferencesPage implements OnInit {

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
  selectedSoftwares: any;

  services: any = [];
  specialization: any = [];
  countries: any = [];
  software: any = [];

  delegate: any;
  limit : any = 10;
  country_limit : any = 239;
  formValid : boolean = true;

  pagetype:any = null;
  edit_user_profile:boolean = false;

  selectedLanguage: any;

	isValidClass = {
		service: '',
		specialization: '',
		countries: '',
		software: ''
  };

  social_media_links: any = {
    'facebook': '',
    'linkedin': '',
    'whatsapp': '',
    'twitter': '',
    'kakao': '',
    'wechat': '',
  };

  page_type: any = null;
  page_title: any = "Preferences";

  constructor(
    public env: EnvService,
    public prefService: PreferencesService,
    public delegateService: DelegateService,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    public events: Events
  ) {

  }

  ngOnInit() {
    this.env.storage.get('delegate').then((d) => {
      this.delegate = d;
      console.log('rhan', d);
      if(this.delegate){
        this.social_media_links = this.delegate.social_media_links_detail;
        this.selectedServices = this.delegate.pref_services_ids_detail;
        this.selectedSpecializations = this.delegate.pref_specialization_ids_detail;
        this.selectedCountries = this.delegate.pref_countries_ids_detail;
        this.selectedSoftwares = this.delegate.pref_software_ids_detail;
        this.selectedLanguage = this.delegate.pref_lang_details;
      }
    });
    
    this.route.queryParams.subscribe(params => {
      this.pagetype = params["page_type"];
      this.edit_user_profile = params["edit_user_profile"];
      if(params["page_title"]){
        this.env.storage.set('from_edit_profile', true);
        this.page_type = params["page_title"];
        console.log('fdsfdss',this.page_type);
        if(this.page_type == 'services'){
          this.page_title = "Services";
        }else if(this.page_type == 'specializations'){
          this.page_title = "Specialization";
        }else if(this.page_type == 'operational_software'){
          this.page_title = "Operational Software";
        }else {
          this.page_title = "Preferences";
        }
      }
    });

    this.getServices();
    this.getSpecializations();
    this.getCountries();
    this.getSoftwares();
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
    // if(prefType == 'service'){
    //   // form validation error
    //   if(this.selectedServices.length > 0){
    //     this.isValidClass[prefType] = 'valid';
    //   }else{
    //     this.isValidClass[prefType] = 'invalid';
    //   }
    // }else if(prefType == 'specialization'){
    //   // form validation error
    //   if(this.selectedSpecializations.length > 0){
    //     this.isValidClass[prefType] = 'valid';
    //   }else{
    //     this.isValidClass[prefType] = 'invalid';
    //   }
    // }else if(prefType == 'countries'){
    //   // form validation error
    //   if(this.selectedCountries.length > 0){
    //     this.isValidClass[prefType] = 'valid';
    //   }else{
    //     this.isValidClass[prefType] = 'invalid';
    //   }
    // }else if(prefType == 'software'){
    //   // form validation error
    //   if(this.selectedSoftwares.length > 0){
    //     this.isValidClass[prefType] = 'valid';
    //   }else{
    //     this.isValidClass[prefType] = 'invalid';
    //   }
    // }
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

  nextStep(){
    //set final pref for saving
    if(this.selectedServices){
      if(this.selectedServices.length > 0){
        this.services = this.setPrefrence(this.selectedServices);
      }
      // else{
      //   this.formValid = false;
      // }
    }
    if(this.selectedSpecializations){
      if(this.selectedSpecializations.length > 0){
        this.specialization = this.setPrefrence(this.selectedSpecializations);
      }
      // else{
      //   this.formValid = false;
      // }
    }
    if(this.selectedCountries){
      if(this.selectedCountries.length > 0){
        this.countries = this.setPrefrence(this.selectedCountries);
      }
      // else{
      //   this.formValid = false;
      // }
    }
    if(this.selectedSoftwares){
      if(this.selectedSoftwares.length > 0){
        this.software = this.setPrefrence(this.selectedSoftwares);
      }
      // else{
      //   this.formValid = false;
      // }
    }

    if(this.formValid){
      this.delegate['pref_countries_ids_detail'] = this.selectedCountries;
      this.delegate['pref_services_ids_detail'] = this.selectedServices;
      this.delegate['pref_software_ids_detail'] = this.selectedSoftwares;
      this.delegate['pref_specialization_ids_detail'] = this.selectedSpecializations;
      this.delegate['last_page'] = 0;

      if(this.selectedLanguage){
        this.delegate['pref_lang'] = this.env.convertType(this.selectedLanguage, 'string');
        this.delegate['pref_lang_details'] = this.selectedLanguage;
      }
      
      this.env.delegateStorageSet(this.delegate);
      this.events.publish('delegate', this.delegate, Date.now());

      this.delegate['social_media_links'] = this.env.convertType(this.social_media_links, 'string');
      this.delegate['pref_countries_ids'] = this.env.convertType(this.countries, 'string');
      this.delegate['pref_network_ids'] = this.env.convertType(this.delegate['pref_network_ids'], 'string');
      this.delegate['pref_sector_ids'] = this.env.convertType(this.delegate['pref_sector_ids'], 'string');
      this.delegate['pref_services_ids'] = this.env.convertType(this.services, 'string');
      this.delegate['pref_software_ids'] = this.env.convertType(this.software, 'string');
      this.delegate['pref_specialization_ids'] = this.env.convertType(this.specialization, 'string');
    
      this.delegateService.saveDelegate(this.delegate)
        .subscribe(data => {
          if(data.error == 0){
            if(this.pagetype == 'profile'){
              this.env.redirect('/edit-user-profile');
            }
            else if(this.pagetype == 'preferences'){
              this.preferenceSuccessModal();
            }
            else{
              //this.env.redirect('/edit-profile-company');
              this.presentSuccessModal();
            }
          }
        });
    }
  }

  /**
   * tell either the save pre button is enabled or not
   */
  get enabledButton(){

    if(this.selectedServices && this.selectedSpecializations && this.selectedCountries && this.selectedSoftwares){
      console.log('selected prefs', this.selectedServices, this.selectedSpecializations, this.selectedCountries, this.selectedSoftwares);
      if(
        this.selectedServices.length && 
        this.selectedSpecializations.length && 
        this.selectedCountries.length && 
        this.selectedSoftwares.length
      ){
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async preferenceSuccessModal() {
    const modal = await this.modalCtrl.create({
      component: PromptModalPage,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        img_src: '/assets/icon/success-popup.png',
        title: 'Success',
        msg: 'You have successfully updated your preferences.', 
        btn_txt: 'Okay',
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    this.env.redirect('/delegate-profile');
  }

  async presentSuccessModal() {
    const modal = await this.modalCtrl.create({
      component: PromptModalPage,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        img_src: '/assets/icon/success-popup.png',
        title: 'Success',
        msg: 'You have successfully updated your details. You can now start organizing your events and schedules.', 
        btn_txt: 'View my events', 
        icon: 'ios-arrow-forward', 
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    this.env.redirect('/');
  }
}
