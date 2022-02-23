import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/lib/env.service';
import { DelegateService } from 'src/app/services/delegate.service';
import { ModalController, ActionSheetController, Platform, Events, LoadingController } from '@ionic/angular';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { File } from "@ionic-native/file/ngx";
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { AttributeService } from 'src/app/services/attribute.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Urls } from 'src/app/lib/urls';
import {  SocialMediaPage } from 'src/app/modalpage/social-media/social-media.page';
import { ImageCropperPage } from 'src/app/modalpage/image-cropper/image-cropper.page';


@Component({
  selector: 'app-edit-profile-info-enhance',
  templateUrl: './edit-profile-info-enhance.page.html',
  styleUrls: ['./edit-profile-info-enhance.page.scss'],
})
export class EditProfileInfoEnhancePage implements OnInit {


  imageChangedEvent: any = '';
  imageBase64: any = '';

  autoCompleteLanguage = new Subject<string>();
  public registrationForm: FormGroup;
  user_privacy: boolean = true;
  delegate: any;

  temp_profile_photo: any = null;
  firstlogin: any = null;
  
	isValidClass: any = {
		fullname: '',
		email: '',
		job_title: '',
		pref_lang: '',
		mobile: ''
  };
  
  social_media_links: any = {
    'facebook': '',
    'linkedin': '',
    'whatsapp': '',
    'twitter': '',
    'kakao': '',
    'wechat': '',
  };
  
  showLanguages:boolean = false;
  select_lang: any;
  languages: any;
  limit: any = 100;
  search: any;
  lang_current_page: any = 1;
  lang_total_page: any = 0;
  total_lang_count: any = 0;

  selectedLanguage: any;

  cameraLoader: any = null;
  infoChange:boolean = false;

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
    public attributeService: AttributeService,
    public events: Events,
    public file: File,
    public imageCompress: NgxImageCompressService,
    public loadingController: LoadingController
  ) 
  {

    this.autoCompleteLanguage.pipe(
      debounceTime(300),
      distinctUntilChanged())
      .subscribe(value => {
        this.getLanguages(false);
    });

    let emailRe = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.registrationForm = this.formBuilder.group({
      fullname: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, Validators.pattern(emailRe)])],
      job_title: ['', Validators.compose([Validators.required])],
      pref_lang: [''],
      mobile: [''],
    });

   }

  ngOnInit() {

    this._route.paramMap.subscribe( url_param =>{
      this.firstlogin = url_param.get('firstlogin');
    });

    this.env.storage.get('delegate').then((d) => {
      this.delegate = d;
      if(this.delegate){
        
        this.registrationForm.controls['fullname'].setValue(this.delegate.fullname);
        this.registrationForm.controls['email'].setValue(this.delegate.email);
        this.registrationForm.controls['job_title'].setValue(this.delegate.job_title);
        this.registrationForm.controls['mobile'].setValue(this.delegate.mobile);
        this.registrationForm.controls['pref_lang'].setValue(this.delegate.pref_lang);
        this.social_media_links = this.delegate.social_media_links_detail;
        this.selectedLanguage = this.delegate.pref_lang_details;

        this.user_privacy = true;
        if(this.delegate.user_privacy == 'no'){
          this.user_privacy = false;
        }
      }
    });

  }

  formValidator(e, fieldName){
    let controls = this.registrationForm.controls[fieldName];
    this.infoChange = true;
    controls.setValue(e.target.value);
    if(!controls.errors){
      this.isValidClass[fieldName] = 'valid';
    } else {
      this.isValidClass[fieldName] = 'invalid';
    }
  }

  setLangValue(value=null){
    this.select_lang = value;
    this.infoChange = true;
    if(!this.selectedLanguage){
      this.selectedLanguage = [];
    }

    if(value){
      this.selectedLanguage.push(value);

    }else{
      if(this.search != ""){
        if(this.search.trim() != ""){
          this.selectedLanguage.push(this.search);
        }
      }
    }
    this.search = '';
  }

  removeLanguage(index){
    this.selectedLanguage.splice(index,1);
  }

  getLanguages(infiniteScroll){

    let thisGetForm = {
      limit: this.limit,
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
  
  nextStep(){

    if(this.registrationForm.valid){

      this.delegate.fullname = this.registrationForm.value.fullname;
      this.delegate.email = this.registrationForm.value.email;
      this.delegate.job_title = this.registrationForm.value.job_title;
      this.delegate.mobile = this.registrationForm.value.mobile;

      if(this.selectedLanguage){
        this.delegate.pref_lang = this.env.convertType(this.selectedLanguage, 'string');
        this.delegate.pref_lang_details = this.selectedLanguage;
      }

      this.delegate.user_privacy = 'yes';
      if(this.user_privacy == false){
        this.delegate.user_privacy = 'no';
      }
      this.env.delegateStorageSet(this.delegate);
      
      // convert social media links to json encode
      this.delegate['social_media_links'] = this.env.convertType(this.social_media_links, 'string');
      this.delegate['pref_countries_ids'] = this.env.convertType(this.delegate['pref_countries_ids'], 'string');
      this.delegate['pref_network_ids'] = this.env.convertType(this.delegate['pref_network_ids'], 'string');
      this.delegate['pref_sector_ids'] = this.env.convertType(this.delegate['pref_sector_ids'], 'string');
      this.delegate['pref_services_ids'] = this.env.convertType(this.delegate['pref_services_ids'], 'string');
      this.delegate['pref_software_ids'] = this.env.convertType(this.delegate['pref_software_ids'], 'string');
      this.delegate['pref_specialization_ids'] = this.env.convertType(this.delegate['pref_specialization_ids'], 'string');



      this.env.redirect('/edit-profile-business-card');
      /* this.delegateService.saveDelegate(this.delegate)
        .subscribe(data => {
          if(data.error == 0){
            this.env.redirect('/edit-profile-business-card');
          }
        }); */
    }
  }

  
  async cropUpload() {
    const actionSheet = await this.actionSheetController.create({
        header: "Select Image source",
        buttons: [{
                text: 'Load from Library',
                handler: () => { this.openImagePicker(); }
            },
            {
                text: 'Use Camera',
                handler: () => { this.takePicture(); }
            },
            {
                text: 'Cancel',
                role: 'cancel'
            }
        ]
    });
    await actionSheet.present();
  }

  async takePicture(){
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
     if(imageData.length > 0){

      this.imageBase64 = 'data:image/jpeg;base64,' + imageData;
      this.gotoImageCropper(this.imageBase64);

      /* ------------------ */
      //this.save(base64Image);

      // this.crop.crop(imageData, { quality: 100, targetWidth: 72, targetHeight: 72 })
      //   .then(
      //     newImage => {

      //     console.log('new camera image path is: ' + newImage);
      //     this.delegate.profile_photo_url = this.pathForImage(newImage);

      //     if(!this.temp_profile_photo) {
      //       this.temp_profile_photo = new Array<string>();
      //     }

      //     let pp_pieces = newImage.split("?");
      //     let ff_img = pp_pieces[0].split("/");

      //     this.delegate.profile_photo = ff_img[ff_img.length - 1];
      //     let new_pp = {
      //       "name": ff_img[ff_img.length - 1],
      //       "path": pp_pieces[0]
      //     };

      //     if (this.platform.is('ios')) {
      //       new_pp["path"] = newImage;
      //       newImage = newImage.replace("file://", "/_file_");
      //     }
      //     this.temp_profile_photo.splice(0, 1);
      //     this.temp_profile_photo.push(new_pp);

      //     console.log("temp_profile_photo: ", this.temp_profile_photo);
      //     this.save(this.temp_profile_photo);

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
  
  async openImagePicker(){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
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
     if(imageData.length > 0){

      this.imageBase64 = 'data:image/jpeg;base64,' + imageData;
      this.gotoImageCropper(this.imageBase64);

      //this.save(base64Image);
       /* --------------------------------------- */

      // this.crop.crop(imageData, { quality: 100, targetWidth: 72, targetHeight: 72 })
      //   .then(
      //     newImage => {

      //     console.log('new camera image path is: ' + newImage);
      //     this.delegate.profile_photo_url = this.pathForImage(newImage);

      //     if(!this.temp_profile_photo) {
      //       this.temp_profile_photo = new Array<string>();
      //     }

      //     let pp_pieces = newImage.split("?");
      //     let ff_img = pp_pieces[0].split("/");

      //     this.delegate.profile_photo = ff_img[ff_img.length - 1];
      //     let new_pp = {
      //       "name": ff_img[ff_img.length - 1],
      //       "path": pp_pieces[0]
      //     };

      //     if (this.platform.is('ios')) {
      //       new_pp["path"] = newImage;
      //       newImage = newImage.replace("file://", "/_file_");
      //     }
      //     this.temp_profile_photo.splice(0, 1);
      //     this.temp_profile_photo.push(new_pp);

      //     console.log("temp_profile_photo: ", this.temp_profile_photo);
      //     this.save(this.temp_profile_photo);

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

  async gotoImageCropper(image){
    console.warn('Size in bytes was:', this.imageCompress.byteCount(image));
   
    this.imageCompress.compressFile(image, orientation, 50, 50).then(
      result => {
        console.warn('Size in bytes is now:', this.imageCompress.byteCount(result));

        this.cameraLoader.dismiss();
        this.presentCropperModal(this.env.b64toBlob(result.replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512));
      }
    );
  }

  async presentCropperModal(imagePath) {
    const modal = await this.modalCtrl.create({
      component: ImageCropperPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        'imageBase64': imagePath,
        'type': 'avatar'
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    if(data){
      this.delegate.profile_photo = 'profile_photo';
      this.delegate.profile_photo_url = data.base64;
      this.save(data.fileBlob);
    }
  }

  fileChangeEvent(event: any): void {
     console.log(event);
  }

  save(attachment){
      let url = this.env.getUrl(Urls.api_delegates_save);

      let formData = new FormData();

      formData.append('profile_photo', attachment);
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
      //     fileKey: 'profile_photo',
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

  focusInField(event){
    let a = this;
    a.showLanguages = true;
    a.select_lang = null;

    this.autoCompleteLanguage.next(event);
  }
  
  focusOutField(){
    let a = this;
    setTimeout(function(){
      a.showLanguages = false;
      if(!a.select_lang){
        a.setLangValue(null);
      }
    }, 200);
  }

}
