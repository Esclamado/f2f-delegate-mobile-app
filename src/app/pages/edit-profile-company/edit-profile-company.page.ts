import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';

import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EnvService } from 'src/app/lib/env.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CompanyService } from 'src/app/services/company.service';
import { SocialMediaPage } from 'src/app/modalpage/social-media/social-media.page';
import { PromptModalPage } from 'src/app/modalpage/prompt-modal/prompt-modal.page';

import { IonicSelectableComponent } from 'ionic-selectable';

@Component({
  selector: 'app-edit-profile-company',
  templateUrl: './edit-profile-company.page.html',
  styleUrls: ['./edit-profile-company.page.scss'],
})
export class EditProfileCompanyPage implements OnInit {

  public companyForm: FormGroup;
  delegate: any;
  country_limit = 239;

  selectedSector: any;
  selectedCountry: any;
  selectedState: any;
  pagetype:any = null;
  edit_user_profile:boolean = false;

	isValidClass: any = {
		name: '',
		description: '',
    sector: '',
    country: '',
		zipcode: '',
		address: '',
		phoneNumber: '',
		website: ''
  };
  
  social_media_links: any = {
    'facebook': '',
    'linkedin': '',
    'whatsapp': '',
    'twitter': '',
    'kakao': '',
    'wechat': '',
    'phoneNumber': '',
    'website': ''
  };
  
  constructor(
    public formBuilder: FormBuilder,
    public env: EnvService,
    public prefService: PreferencesService,
    public companyService: CompanyService,
    public modalCtrl: ModalController,
    public loadingController: LoadingController,
    public route: ActivatedRoute
  ) { 
    this.companyForm = formBuilder.group({
      id: ['0'],
      name: ['', Validators.compose([Validators.required])],
      description: [''],
      country_id: [''],
      state: [''],
      municipality: [''],
      zipcode: [''],
      address: [''],
      pref_sector_id: [''],
      phoneNumber: [''], //
      pref_network_id: [''],
      website: [''],//
      membershipstatus: [],
    });
  }

  sectorChange(event: {component: IonicSelectableComponent, value: any }) {
    if(this.selectedSector){
      this.isValidClass['sector'] = 'valid';
    }else{
      this.isValidClass['sector'] = 'invalid';
    }
  }

  countryChange(event: {component: IonicSelectableComponent, value: any }) {
    this.getProvince();
    if(this.selectedCountry){
      this.companyForm.controls['country_id'].setValue(this.selectedCountry.id);
      this.isValidClass['country'] = 'valid';
    }else{
      this.isValidClass['country'] = 'invalid';
    }
  }

  stateChange(event: {component: IonicSelectableComponent, value: any }) {
    if(this.selectedState){
      this.companyForm.controls['state'].setValue(this.selectedState.name);
      this.isValidClass['state'] = 'valid';
    }else{
      this.isValidClass['state'] = 'invalid';
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.pagetype = params["page_type"];
      this.edit_user_profile = params["edit_user_profile"];
    });

    this.env.storage.get('delegate').then((d) => {
      this.delegate = d;
      console.log(d);
      if(this.delegate){
        this.selectedSector = {
          id: this.delegate.company.pref_sector_id,
          name: this.delegate.company.pref_sector_name
        };
        this.selectedCountry = this.delegate.company_country;
        this.selectedState = {
          name: this.delegate.company.state
        };
        this.getProvince();
        if(this.delegate.company.social_media_links_detail){
          this.social_media_links = this.delegate.company.social_media_links_detail;
        }
        this.companyForm.controls['id'].setValue(this.delegate.company.id);
        this.companyForm.controls['name'].setValue(this.delegate.company.name);
        this.companyForm.controls['description'].setValue(this.delegate.company.description);
        this.companyForm.controls['country_id'].setValue(this.delegate.company.country_id);
        this.companyForm.controls['state'].setValue(this.delegate.company.state);
        this.companyForm.controls['municipality'].setValue(this.delegate.company.municipality);
        this.companyForm.controls['zipcode'].setValue(this.delegate.company.zipcode);
        this.companyForm.controls['address'].setValue(this.delegate.company.address);
        this.companyForm.controls['pref_network_id'].setValue(this.delegate.company.pref_network_id);
        this.companyForm.controls['phoneNumber'].setValue(this.delegate.company.social_media_links_detail && this.delegate.company.social_media_links_detail.phoneNumber ? this.delegate.company.social_media_links_detail.phoneNumber : '');
        this.companyForm.controls['website'].setValue(this.delegate.company.social_media_links_detail && this.delegate.company.social_media_links_detail.website ? this.delegate.company.social_media_links_detail.website : '');
        this.companyForm.controls['membershipstatus'].setValue(this.delegate.company.membershipstatus);
      }
    });

    this.getSectors();
    this.getCountries();
    
  }

  getSectors(){
    let url = this.prefService.getSetUrlParams('sectors', 1, 10);
    this.sendRequest(url, 'sectors');
  }

  getCountries(){
    let url = this.prefService.getSetUrlParams('countries', 1, this.country_limit);
    this.sendRequest(url, 'countries');
  }

  getProvince(){
    if(this.selectedCountry){
      let url = this.prefService.getSetUrlParams('states', 1, this.country_limit, '', 'name', 'asc');
      url += 'countryid=' + this.selectedCountry.id;
      this.sendRequest(url, 'states');
    }
  }

  sendRequest(url: string, type: string){
    this.prefService.getData(url, type)
        .subscribe(data => {this.prefService.getHelper(data, type)});
  }

  formValidator(e, fieldName){
    let controls = this.companyForm.controls[fieldName];
    controls.setValue(e.target.value);
    if(!controls.errors){
      this.isValidClass[fieldName] = 'valid';
    } else {
      this.isValidClass[fieldName] = 'invalid';
    }

    if(fieldName == 'website'){
      if(this.validURL(e.target.value)){
        this.isValidClass[fieldName] = 'valid';
      }else{
        this.isValidClass[fieldName] = 'invalid';
      }
    }
  }

  async presentSocialModal(name, style, icon = null) {
    const modal = await this.modalCtrl.create({
      component: SocialMediaPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        'icon': icon,
        'name': name,
        'class': style,
        'value': this.social_media_links[name.toLowerCase()]
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    if(data){
      // storing of social media to array
      this.social_media_links[name.toLowerCase()] = data.socialMedia;
    }
  }

  validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

  async save(){
    console.log(this.companyForm);
    console.log(this.social_media_links);
    // convert social media links to json encode
    this.social_media_links['phoneNumber'] = this.companyForm.value['phoneNumber'];
    this.social_media_links['website'] = this.companyForm.value['website']  
    this.companyForm.value['social_media_links'] = this.env.convertType(this.social_media_links, 'string');
    
    if(this.companyForm.valid && this.selectedSector){

      // convert social media links to json encode
      this.companyForm.value['pref_sector_id'] = this.selectedSector.id;

      let loading = await this.loadingController.create({
        message: 'Saving...'
      });
      await loading.present();

      this.companyService.save(this.companyForm.value).subscribe(data => {
        console.log(data);
        loading.dismiss();
        if(data['error'] == '0'){
          this.delegate['company'] = data['data'];
          this.env.delegateStorageSet(this.delegate);
          if(this.pagetype){ /* If from Edit Profile */
            this.env.redirect('/delegate-profile');
          }else{
            this.presentSuccessModal();
          }
        }
      });

      const { role, data } = await loading.onDidDismiss();
    }
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
