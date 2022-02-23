import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { EditProfileInfoPage } from 'src/app/pages/edit-profile-info/edit-profile-info.page';
import { NavigationExtras, ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/lib/env.service';

import { ActionSheetController, LoadingController, ModalController, Platform, Events } from '@ionic/angular';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DelegateService } from 'src/app/services/delegate.service';
import { AttributeService } from 'src/app/services/attribute.service';
import { SocialMediaPage } from 'src/app/modalpage/social-media/social-media.page';
import { PromptModalPage } from 'src/app/modalpage/prompt-modal/prompt-modal.page';
import { ImageCropperPage } from 'src/app/modalpage/image-cropper/image-cropper.page';

import { Crop } from '@ionic-native/crop/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from "@ionic-native/file/ngx";
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Urls } from 'src/app/lib/urls';

import { NgxImageCompressService } from 'ngx-image-compress';

import { PreferencesService } from 'src/app/services/preferences.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { NavController } from '@ionic/angular';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IonContent } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-user-profile',
  templateUrl: './edit-user-profile.page.html',
  styleUrls: ['./edit-user-profile.page.scss'],
})
export class EditUserProfilePage extends EditProfileInfoPage implements OnInit {

  @ViewChild(IonContent, {read: '', static: true}) content: IonContent;
  autoCompleteLanguage = new Subject<string>();

  @Input() eventFormData: Event;

  public eventAddressForm: FormGroup;
  public latitude: number;
  public longitude: number;
  public place: string;
  public zoom: number;
  public time_zone: string;

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

  temp_businesscard_photo: any = null;
  
  showLanguages:boolean = false;
  languages: any;
  lang_limit: any = 100;
  search: any;
  lang_current_page: any = 1;
  lang_total_page: any = 0;
  total_lang_count: any = 0;

  selectedLanguage: any;

  cameraLoader: any = null;
  loaded: boolean = false;

  changeUserTimezone: boolean = false;

  constructor(
    public _route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public env: EnvService,
    public delegateService: DelegateService,
    public modalCtrl: ModalController,
    public imagePicker: ImagePicker,
    public crop: Crop,
    public transfer: FileTransfer,
    public actionSheetController: ActionSheetController,
    public camera: Camera,
    public platform: Platform,
    public webview: WebView,
    public prefService: PreferencesService,
    public loadingController: LoadingController,
    public navCtrl: NavController,
    public attributeService: AttributeService,
    public events: Events,
    public file: File,
    public imageCompress: NgxImageCompressService,
    public router: Router,
  ) { 
    super(_route,formBuilder, env, delegateService, modalCtrl, imagePicker, crop, transfer, actionSheetController, camera, platform, webview, attributeService, events, file, imageCompress, loadingController);
    
    this.autoCompleteLanguage.pipe(
      debounceTime(300),
      distinctUntilChanged())
      .subscribe(value => {
        this.getLanguages(false);
    });

    events.subscribe('delegate', (delegate, time) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      this.delegate = delegate;
      this.selectedServices = this.delegate.pref_services_ids_detail;
      this.selectedSpecializations = this.delegate.pref_specialization_ids_detail;
      this.selectedCountries = this.delegate.pref_countries_ids_detail;
      this.selectedSoftwares = this.delegate.pref_software_ids_detail;
    });

    this._route.queryParams.subscribe(params => {
      if (params && params.edit_head) {
        setTimeout(r=>{
          let y = document.getElementById(params.edit_head).offsetTop;
          this.content.scrollToPoint(0,y,500);
        }, 50);
      }
    });

    console.log('Width: ' + platform.width());

  }

  ionViewDidEnter(){
    this.loaded = true;
  }

  ionViewDidLeave(){
    this.loaded = false;
  }

  ngOnInit() {
    let emailRe = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.registrationForm = this.formBuilder.group({
      fullname: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, Validators.pattern(emailRe)])],
      job_title: ['', Validators.compose([Validators.required])],
      pref_lang: [''],
      mobile: [''],
    });

    this.eventAddressForm = this.formBuilder.group({
      eventAddress: ['', Validators.required],
      timeZone: ['', Validators.required],
      lat: [''],
      long: [''],
      coordinates: ['']
    }, { });

    this.env.storage.get('delegate').then((d) => {
      this.delegate = d;
      console.log(d);
      if(this.delegate){
        
        this.registrationForm.controls['fullname'].setValue(this.delegate.fullname);
        this.registrationForm.controls['email'].setValue(this.delegate.email);
        this.registrationForm.controls['job_title'].setValue(this.delegate.job_title);
        this.registrationForm.controls['mobile'].setValue(this.delegate.mobile);
        this.registrationForm.controls['pref_lang'].setValue(this.delegate.pref_lang);;
        this.social_media_links = this.delegate.social_media_links_detail;
        this.selectedLanguage = this.delegate.pref_lang_details;

        this.user_privacy = false;
        if(this.delegate.user_privacy == 'yes'){
          this.user_privacy = true;
        }

        this.selectedServices = this.delegate.pref_services_ids_detail;
        this.selectedSpecializations = this.delegate.pref_specialization_ids_detail;
        this.selectedCountries = this.delegate.pref_countries_ids_detail;
        this.selectedSoftwares = this.delegate.pref_software_ids_detail;
      }
    });

    this.env.storage.set('from_edit_profile', true);

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

  async saveProfile(){
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

      this.delegate.fullname = this.registrationForm.value.fullname;
      this.delegate.email = this.registrationForm.value.email;
      this.delegate.job_title = this.registrationForm.value.job_title;
      this.delegate.mobile = this.registrationForm.value.mobile;

      if(this.selectedLanguage){
        this.delegate['pref_lang'] = this.env.convertType(this.selectedLanguage, 'string');
        this.delegate['pref_lang_details'] = this.selectedLanguage;
      }

      this.delegate.user_privacy = 'no';
      if(this.user_privacy == true){
        this.delegate.user_privacy = 'yes';
      }

      this.delegate['pref_countries_ids_detail'] = this.selectedCountries;
      this.delegate['pref_services_ids_detail'] = this.selectedServices;
      this.delegate['pref_software_ids_detail'] = this.selectedSoftwares;
      this.delegate['pref_specialization_ids_detail'] = this.selectedSpecializations;

      console.log('rhan',this.delegate);
      this.env.delegateStorageSet(this.delegate);

      this.delegate['social_media_links'] = this.env.convertType(this.social_media_links, 'string');
      this.delegate['pref_countries_ids'] = this.env.convertType(this.countries, 'string');
      this.delegate['pref_network_ids'] = this.env.convertType(this.delegate['pref_network_ids'], 'string');
      this.delegate['pref_sector_ids'] = this.env.convertType(this.delegate['pref_sector_ids'], 'string');
      this.delegate['pref_services_ids'] = this.env.convertType(this.services, 'string');
      this.delegate['pref_software_ids'] = this.env.convertType(this.software, 'string');
      this.delegate['pref_specialization_ids'] = this.env.convertType(this.specialization, 'string');

      let loading = await this.loadingController.create({
        message: 'Saving...'
      });
      await loading.present();

      this.delegateService.saveDelegate(this.delegate)
        .subscribe(data => {
          loading.dismiss();
          if(data.error == 0){
            if(this.changeUserTimezone){
              this.saveTimezone();
            }
            this.presentSuccessModal();
          }
        });

      const { role, data } = await loading.onDidDismiss();
    }
  }

  /* -----------------------------------
      Uploading of Business Card 
  --------------------------------------*/
  async uploadBusinessCard() {
    const actionSheet = await this.actionSheetController.create({
        header: "Select Image source",
        buttons: [{
                text: 'Load from Library',
                handler: () => { this.openImagePickerBusinessCard(); }
            },
            {
                text: 'Use Camera',
                handler: () => { this.takePictureBusinessCard(); }
            },
            {
                text: 'Cancel',
                role: 'cancel'
            }
        ]
    });
    await actionSheet.present();
  }

  // openImagePickerBusinessCard(){
  //   let options= {
  //     quality: 50,
  //     maximumImagesCount: 1,
  //     width: 500,
  //     height: 500
  //   }
  //   this.imagePicker.getPictures(options).then((results) => {
  //     console.log('Image results: ' + results);
  //     if(results.length > 0 && results != 'OK'){
  //       for (let i = 0; i < results.length; i++) {
  //         console.log('Image URI: ' + results[i]);
  //           this.crop.crop(results[i], { quality: 100, targetWidth: 320, targetHeight: 185 })
  //             .then(
  //               newImage => {
  //                 console.log('new image path is: ' + newImage);
  //                 this.delegate.businesscard_url = this.pathForImage(newImage);

  //                 if(!this.temp_businesscard_photo) {
  //                   this.temp_businesscard_photo = new Array<string>();
  //                 }
  //                 }

  //                 results.forEach((pp, pidx) => {
  //                     let pp_pieces = newImage.split("?");
  //                     let ff_img = pp_pieces[0].split("/");
  //                     this.delegate.businesscard = ff_img[ff_img.length - 1];
  //                     let new_pp = {
  //                       "name": ff_img[ff_img.length - 1],
  //                       "path": pp_pieces[0]
  //                     };
                      
  //                     let t = pp;
  //                     t = t.replace('(', '%28');
  //                     t = t.replace(')', '%29');
  //                     if (this.platform.is('ios')) {
  //                       t = t.replace("file://", "/_file_");
  //                       new_pp["path"] = pp;
  //                     }
                      
  //                     this.temp_businesscard_photo.splice(0, 1);
  //                     this.temp_businesscard_photo.push(new_pp);

  //                     console.log("temp_businesscard_photo: ", this.temp_businesscard_photo);
  //                     this.saveBusinessCard(this.temp_businesscard_photo);
  //                 });
  //               },
  //               error => console.error('Error cropping image', error)
  //             );
  //         }
  //     }
  //   }, (err) => { console.log(err); });
  // }

  async takePictureBusinessCard(){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    }

    this.cameraLoader = await this.loadingController.create({
    });
    await this.cameraLoader.present();
    
    this.camera.getPicture(options).then((imageData) => {
     // imageData is either a base64 encoded string or a file URI
     // If it's base64 (DATA_URL):
     console.log(imageData);
     if(imageData.length > 0){

      this.imageBase64 = 'data:image/jpeg;base64,' + imageData;
      this.gotoBusinessImageCropper(this.imageBase64);

      // this.crop.crop(imageData, { quality: 100, targetWidth: 320, targetHeight: 185 })
      //   .then(
      //     newImage => {

      //     console.log('new camera image path is: ' + newImage);
      //     this.delegate.businesscard_url = this.pathForImage(newImage);

      //     if(!this.temp_businesscard_photo) {
      //       this.temp_businesscard_photo = new Array<string>();
      //     }

      //     let pp_pieces = newImage.split("?");
      //     let ff_img = pp_pieces[0].split("/");
      //     this.delegate.businesscard = ff_img[ff_img.length - 1];
      //     let new_pp = {
      //       "name": ff_img[ff_img.length - 1],
      //       "path": pp_pieces[0]
      //     };

      //     if (this.platform.is('ios')) {
      //       new_pp["path"] = newImage;
      //       newImage = newImage.replace("file://", "/_file_");
      //     }
      //     this.temp_businesscard_photo.splice(0, 1);
      //     this.temp_businesscard_photo.push(new_pp);

      //     console.log("temp_businesscard_photo: ", this.temp_businesscard_photo);
      //     this.saveBusinessCard(this.temp_businesscard_photo);

      //   }, (err) => {
      //     console.log(err);
      //   });
      }
    }, (err) => {
     // Handle error
     console.log(err);
     this.cameraLoader.dismiss();
    });
  }

  async openImagePickerBusinessCard(){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    }

    this.cameraLoader = await this.loadingController.create({
    });
    await this.cameraLoader.present();
    
    this.camera.getPicture(options).then((imageData) => {
     // imageData is either a base64 encoded string or a file URI
     // If it's base64 (DATA_URL):
     console.log(imageData);
     if(imageData.length > 0){

      this.imageBase64 = 'data:image/jpeg;base64,' + imageData;
      this.gotoBusinessImageCropper(this.imageBase64);

      // this.crop.crop(imageData, { quality: 100, targetWidth: 320, targetHeight: 185 })
      //   .then(
      //     newImage => {

      //     console.log('new camera image path is: ' + newImage);
      //     this.delegate.businesscard_url = this.pathForImage(newImage);

      //     if(!this.temp_businesscard_photo) {
      //       this.temp_businesscard_photo = new Array<string>();
      //     }

      //     let pp_pieces = newImage.split("?");
      //     let ff_img = pp_pieces[0].split("/");
      //     this.delegate.businesscard = ff_img[ff_img.length - 1];
      //     let new_pp = {
      //       "name": ff_img[ff_img.length - 1],
      //       "path": pp_pieces[0]
      //     };

      //     if (this.platform.is('ios')) {
      //       new_pp["path"] = newImage;
      //       newImage = newImage.replace("file://", "/_file_");
      //     }
      //     this.temp_businesscard_photo.splice(0, 1);
      //     this.temp_businesscard_photo.push(new_pp);

      //     console.log("temp_businesscard_photo: ", this.temp_businesscard_photo);
      //     this.saveBusinessCard(this.temp_businesscard_photo);

      //   }, (err) => {
      //     console.log(err);
      //   });
      }
    }, (err) => {
     // Handle error
     console.log(err);
     this.cameraLoader.dismiss();
    });
  }

  async gotoBusinessImageCropper(image){
    console.log('Size in bytes was:', this.imageCompress.byteCount(image));
      
    this.imageCompress.compressFile(image, orientation, 50, 50).then(
      result => {
        console.log('Size in bytes is now:', this.imageCompress.byteCount(result));

        this.cameraLoader.dismiss();

        this.presentBusinessCropperModal(this.env.b64toBlob(result.replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512));
      }
    );
  }

  async presentBusinessCropperModal(imagePath) {
    const modal = await this.modalCtrl.create({
      component: ImageCropperPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        'imageBase64': imagePath,
        'type': 'businesscard'
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    if(data){
      this.delegate.businesscard = 'business_card';
      this.delegate.businesscard_url = data.base64;
      this.saveBusinessCard(data.fileBlob);
    }
  }

  saveBusinessCard(attachment){
    let url = this.env.getUrl(Urls.api_delegates_save);

    let formData = new FormData();

    formData.append('businesscard', attachment);
    let keys = Object.keys(this.delegate);
    for (var i = keys.length - 1; i >= 0; i--) {
      let key = keys[i];

      let toAppend = this.delegate[key];
      if(
        key == 'social_media_links' || 
        key == 'pref_software_ids' || 
        key == 'pref_sector_ids' || 
        key == 'pref_countries_ids' || 
        key == 'pref_specialization_ids' || 
        key == 'pref_services_ids' || 
        key == 'pref_network_ids'
      ){
        toAppend = JSON.stringify(this.delegate[key]);
      }
      formData.append(key, toAppend);
    }

    console.log('delegate',this.delegate);
    this.env.http.post<any>(url, formData, this.env.getHttpOptions()).subscribe();
  
    // const fileTransfer: FileTransferObject = this.transfer.create();
    // attachment.forEach((element, index) => {
    //   let options: FileUploadOptions = {
    //     fileKey: 'businesscard',
    //     fileName: element.name,
    //     chunkedMode: false,
    //     mimeType: "image/jpeg",
    //     headers: this.env.getHttpImageUpload(),
    //     params : this.delegate,
    //     httpMethod: 'POST'
    //   }

    //   console.log('Bearer '+this.env.getHttpImageUpload());
    //   console.log('devicetoken '+this.env.devicetoken);
    //   console.log('getDeviceId '+this.env.getDeviceId());
    //   console.log('platform '+this.env.production_mode ? this.env.device.platform : 'Android');

    //   fileTransfer.upload(element.path, url, options)
    //   .then((data) => {
    //     console.log(data);
    //     let respData = JSON.parse(data.response);
    //     console.log(respData);
    //   }, (err) => {
    //     console.log(err);
    //   });
    // });
  }
  
  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  /* -----------------------------------
      End of Uploading of Business Card 
  --------------------------------------*/

  async presentSuccessModal() {
    const modal = await this.modalCtrl.create({
      component: PromptModalPage,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        img_src: '/assets/icon/success-popup.png',
        title: 'Success',
        msg: 'You have successfully updated your details and changes has been applied.', 
        btn_txt: 'Okay, Thanks!'
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    /* this.env.redirect('/delegate-profile'); */
    if(this.changeUserTimezone){
    this.router.navigate(['/']);
    }else{
      this.env.location.back();
    }
  }

  async goToProfile(){
    console.log(this.infoChange);
    if(this.infoChange){
      const modal = await this.modalCtrl.create({
        component: PromptModalPage,
        cssClass: 'my-custom-modal-css',
        componentProps: { 
          img_src: '/assets/icon/save_changes.png',
          title: 'Save changes',
          msg: 'You have made a few changes in your details, do you want to save changes first before going back?', 
          btn_save: 'Save Changes',
          btn_cancel: 'No, go back'
        }
      });

      modal.present();

      const { data } = await modal.onWillDismiss();
      if(data){
        this.saveProfile();
      }else{
        this.env.redirect('/delegate-profile');
        //this.env.location.back();
      }
    }else{
      this.env.redirect('/delegate-profile');
      //this.env.location.back();
    }
  }

  editCompanyProfile(){
    //this.router.navigate(['/edit-pofile-company', 'test']);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        page_type: 'profile',
        edit_user_profile: true,
      }
    };
    this.navCtrl.navigateForward(['edit-profile-company'], navigationExtras);
  }

  editPreferencesProfile(page_title=null){
    //this.router.navigate(['/edit-pofile-company', 'test']);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        page_type: 'profile',
        edit_user_profile: true,
        page_title: page_title,
      }
    };
    this.navCtrl.navigateForward(['edit-profile-preferences'], navigationExtras);
  }

  getLanguages(infiniteScroll){

    let thisGetForm = {
      limit: this.lang_limit,
      sort: 'id',
      order: 'asc',
      search: this.search,
      page: this.lang_current_page,
    };

    this.attributeService.getLanguages(thisGetForm)
    .subscribe(d => {
      if(d.error == 0){
        this.lang_current_page = d.data.current_page;
        this.lang_total_page = d.data.total_page;
        this.total_lang_count = d.data.total_count;

        if(!infiniteScroll) {
          this.languages = []; 
        }

        if(d['data']['datas'].length > 0){
          d['data']['datas'].forEach((cat, idx) => {
            this.languages.push(cat);
          });
        }

        if(infiniteScroll){
          infiniteScroll.target.complete();
        }
      }
    });
  }

  loadData(event){
    this.lang_current_page += 1;
    if(this.lang_current_page <= this.lang_total_page) {
      this.getLanguages(event);
    } else {
      event.target.disabled = true;
    } 
  }

  async presentSocialModal(name, style, icon = null) {
    this.infoChange = true;
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

  toggleChange(e){
    console.log(e);
    console.log('ewan');
    if(this.loaded){
      this.infoChange = true;
    }
  }

  public handleAddressChange(event){
    this.latitude = event.geometry.location.lat();
    this.longitude = event.geometry.location.lng();
    this.place = event.formatted_address;
    this.zoom = 10;

    let currentTimezone = event.utc_offset_minutes/60;
    var gmt = 'UTC';
    if (currentTimezone !== 0) {
      gmt += currentTimezone > 0 ? ' +' : ' ';
      gmt += this.decToTime(currentTimezone);
    }
    this.time_zone = '('+gmt+')';
    this.delegate.address = this.place;
	  //this.delegate.timezone_status = 1;

   /*  this.eventFormData.event_address = this.place; */

    this.getTimezoneLabel(this.latitude, this.longitude).subscribe(result => {
      console.log('result', result);
      this.changeUserTimezone = true;

      if(result['error'] == '0'){
        //this.eventFormData.time_zone = result['data'] +" : "+ this.time_zone;
        //this.eventAddressForm.value.timeZone = result['data'] +" : "+ this.time_zone;
        this.delegate.timezone = result['data'] +" : "+ this.time_zone;
      }else{
        //this.eventFormData.time_zone = this.time_zone;
        this.delegate.timezone= this.time_zone;
      }
    }); 
  }

  async saveTimezone(){
    let postData = new FormData();
    postData.append('delegate_id', this.delegate.id);      
    postData.append('latitude', this.latitude.toString());
    postData.append('longitude', this.longitude.toString());
    postData.append('timezone', this.delegate.timezone);
    postData.append('address', this.delegate.address);
    postData.append('timezone_status', "2");

    let url = this.env.getUrl(Urls.api_delegates_settimezone);

    let loading = await this.loadingController.create({
      message: 'Saving your timezone...'
    });
    await loading.present();

    this.env.http.post<any>(url, postData, this.env.getHttpOptions()).subscribe(response => {
      loading.dismiss();
      if(response['error'] == 0){
        console.log('edit profile',  this.delegate);
        this.events.publish('update_delegate_profile',this.delegate, Date.now());
        this.env.storage.set('delegate', this.delegate);
      }
    });
    
    const { role, data } = await loading.onDidDismiss();
  }

  getTimezoneLabel(lat, long){
    let url = this.env.getUrl(Urls.api_events_gettimezone) + "?lat=" + lat + "&long="+ long;
    return this.env.http.get<any>(url, this.env.getHttpOptions());
	}

  public decToTime(minutes){
    var sign = minutes < 0 ? "-" : "";
    var min = Math.floor(Math.abs(minutes));
    var sec = Math.floor((Math.abs(minutes) * 60) % 60);
    return sign + (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
  }
}
