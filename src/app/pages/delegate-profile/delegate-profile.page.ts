import { Component, ViewChild, OnInit } from '@angular/core';
import { IonInfiniteScroll, ModalController, ActionSheetController, Platform, Events, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

import { EnvService } from 'src/app/lib/env.service';
import { CompanyService } from 'src/app/services/company.service';
import { DelegateService } from 'src/app/services/delegate.service';
import { EventService } from 'src/app/services/event.service';
import { ScheduleMeetingInfoPage } from 'src/app/modalpage/schedule-meeting-info/schedule-meeting-info.page';
import { Urls } from 'src/app/lib/urls';
import { ImageCropperPage } from 'src/app/modalpage/image-cropper/image-cropper.page';

import { NavController } from '@ionic/angular';
import { NavigationExtras, ActivatedRoute } from '@angular/router';
import { NgxImageCompressService } from 'ngx-image-compress';

import { SocialMediaPage } from 'src/app/modalpage/social-media/social-media.page';
import { Crop } from '@ionic-native/crop/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { ChatboxPage } from 'src/app/modalpage/chatbox/chatbox.page';
import { ClockService } from 'src/app/lib/clock.service';

@Component({
  selector: 'app-delegate-profile',
  templateUrl: './delegate-profile.page.html',
  styleUrls: ['./delegate-profile.page.scss'],
})
export class DelegateProfilePage implements OnInit {

  /**
   *  hold the id on the delegate that is different
   * from the one that is loged in
   */
  delegate_id: any = null;
  imageBase64: any = '';

  /**
   * this hold the data of the delegate
   * either the loged in or the other delegate that
   * the loged in delegate visits with
   */
  delegate: any = null;

  /**
   * hold the data of delegates from the company
   */
  other_delegate: any = null;

  /**
   * hold the data of current delegate
   */
  _delegate: any = null;

  limit: any = 5;
  current_page: any = 1;
  total_page: any = 0;
  total_other_delegate: any = 0;

  selectedtab: any = 'profile';
  event: any = null;
  event_id: any = '';
  event_details: any = null;

  /**
   * hold the milisec of the event date and time
   */
  eventTimezoneMiliTime: number = 0;

  /**
   * holds the monthe name that will be displayed on
   * meeting schedule
   */
  monthName: any = '';

  /**
   * holds which meeting schedule date is selected
   */
  selected_ms_date: any = null;
  
  /** 
   * holds business card temp photo
   *
  */ 
  temp_profile_photo: any = null;

  cameraLoader: any = null;

  eventDetails: any = null;

  constructor(
    public env: EnvService,
    public companyService: CompanyService,
    public delegateService: DelegateService,
    public router: Router,
    protected _route: ActivatedRoute,
    public navCtrl: NavController,
    private modalCtrl : ModalController,
    private eventService: EventService,
    private actionSheetController: ActionSheetController,
    public imagePicker: ImagePicker,
    public crop: Crop,
    public transfer: FileTransfer,
    public camera: Camera,
    public webview: WebView,
    public platform: Platform,
    public clock: ClockService,
    public events: Events,
    public imageCompress: NgxImageCompressService,
    public loadingController: LoadingController
  ) {
    events.subscribe('delegate', (delegate, time) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      this.delegate = delegate;
    });

  }

  ngOnInit() {
    this._route.paramMap.subscribe( url_param =>{
      this.delegate_id = url_param.get('delegate_id');
      this.event_id = url_param.get('event_id');
      this.env.storage.get('event').then((data) => {
        this.event_details = data;
        if(this.event_details){
          
          this.setDateTimeZone();

        }
      });
      this.getData();
    });

    this.env.storage.get('event').then((data) => {
      this.eventDetails = data;
      //console.log("this is the event were looking for in the storage", this.eventDetails);
    });
  }

  /**
   * set the date by the time zone of the event
   */
  setDateTimeZone(){
    let tz = this.event_details.time_zone;
    tz = tz.split(" : ");

    let eventTz = null;
    if(tz.length == 2){
      eventTz = tz[0];
    }

    if(eventTz){
      setInterval(f => {
        let eventDateTime:any =  this.clock.convertToZone(eventTz);
        let date = new Date(eventDateTime);

        this.eventTimezoneMiliTime = date.valueOf() / 1000;
      }, 1000);
    }
  }

  getData(refresher?){
    this.env.storage.get('delegate').then((d) => {
      if(d){

        this._delegate = d;
        let data = {
          by: 'id',
          isApp: true,
          event_id: this.event_id
        }

        if(!this.delegate_id){
          data['delegate'] = d.id;
        } else {
          data['delegate'] = this.delegate_id;
        }

        this.delegateService.getDelegate(data)
        .subscribe(r => {
          console.log('del', r);
          this.delegate = r.data;
          if(!this.delegate_id){
            this.env.storage.set('delegate', r.data);
          }

          console.log('del', this.delegate);

          if(this.delegate){
            this.getOtherDelegate();    
            this.getMeetingSchedule(this.delegate.id, this.event_id);
          }
          
          if(refresher){
            refresher.target.complete();
          }
        });
      }
    });
  }

  doRefresh(refresher){
    console.log(refresher);
    if(refresher){
      this.getData(refresher);
    }
  }

  selectTab(tab) {
    this.selectedtab= tab;
    //tab == 'schedules'
    this.getMeetingSchedule(this.delegate.id, this.event_id);
  }

  loadMoreData(event) {
    console.log(this.current_page +'='+ this.total_page);
    this.current_page += 1;
    if(this.current_page <= this.total_page) {
      this.getOtherDelegate(event);
    } else {
      event.target.disabled = true;
    }
  }

  editProfile(){
    //this.router.navigate(['/edit-pofile-company', 'test']);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        page_type: 'profile'
      }
    };
    this.navCtrl.navigateForward(['edit-profile-company'], navigationExtras);
  }

  tempOtherDelegate: any;
  getOtherDelegate(infiniteScroll=null){
    let thisGetForm = {
      id: this.delegate.id,
      byParam : 'company_id',
      valParam: this.delegate.company_id,
      limit: this.limit,
      page: this.current_page
    };

    this.delegateService.getDelegate(thisGetForm)
    .subscribe(d => {
      console.log(d);
      if(d.error == 0){
        this.current_page = d.data.current_page;
        this.total_page = d.data.total_page;
        this.total_other_delegate = d.data.total_count;

        if(!infiniteScroll) {
          this.other_delegate = []; 
        }

        this.tempOtherDelegate = d['data']['datas'];

        d['data']['datas'].forEach((cat, idx) => {
          this.other_delegate.push(cat);
        });

        if(infiniteScroll){
          infiniteScroll.target.complete();
        }
      }
    });
  }

  /**
   * make request, for the meeting schedule
   * of current delegate, return only the timeslot that
   * has a meeting scheduled
   * @param did the delegate's id
   * @param eid the event'd id
   */
  getMeetingSchedule(did, eid){
    let data = {
      delegate: did,
      event: eid,
    }
    this.delegateService.getMeetingSchedule(data)
      .subscribe(r => {
        this.event = r.data;
        this.setMSmonths();
        this.setMSDay();
      });
  }

  /**
   * set the selected day
   */
  selectDay(dayMilisec){
    this.selected_ms_date = dayMilisec;
  }

  /**
   * this will set the month to be diaplayed 
   * on meeting schedules
   */
  setMSmonths(){
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

      this.monthName = mon;
    }
  }

  /**
   * set the days that will be used as days tabs
   */
  setMSDay(){
    if(this.event){
      let days = this.event.days;
      let day_counter = 0;
      days.forEach((val, key) => {
        // if(!this.selected_ms_date){
        //   this.selected_ms_date = val.milisec;
        // }
        if(day_counter == 0){
          if(val.milisec == val.e_current_date){
            this.selected_ms_date = val.milisec;
            this.selectDay(val.milisec);
            day_counter++;
          }else{
            this.selected_ms_date = days[0].milisec;
            this.selectDay(days[0].milisec);
          }
        }

        //let _date = new Date(val.milisec * 1000);
        let _date = new Date(val.formatted_date);

        let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        val.day_name = dayNames[_date.getDay()];
        val.date = _date.getDate();

        this.event.days[key] = val;
      });
    }
  }
  
  myBackButton(){
    this.env.storage.get('from_edit_profile').then((d) => {
      console.log('d',d);
      if(d){
        this.env.storage.remove('from_edit_profile');
        this.env.storage.get('last_page_user_profile').then((page) => {
          console.log('page',page);
          this.env.redirect(page);
        });
      }else{
        this.env.location.back();
      }
    });
   /*  if(this.delegate_id){
      this.env.location.back();
    }else{
      this.env.redirect('/');
    } */
    //this.env.location.back();
  }


  async presentSocialModal(thisData, name, style, icon = null) {
    console.log(thisData);
    const modal = await this.modalCtrl.create({
      component: SocialMediaPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        'icon': icon,
        'name': name,
        'class': style,
        'value': thisData.social_media_links_detail[name.toLowerCase()],
        'viewonly': true,
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    if(data){
      // storing of social media to array
    }
  }

  gotoMeetingDetails(meeting_schedule){
    console.log(meeting_schedule);
    
    this.env.storage.get('event_schedules').then((schedule) => {
      console.log('event_schedules',schedule);
      //console.log('event_schedules',schedule.schedules.data);

      let meeting_details = null;
      let data = null;
      schedule.forEach((sched, idx) => {
        console.log('sched',sched);
        if(sched.schedules){
          sched.schedules.forEach((timeslot) => {
            console.log('timeslot',timeslot)
            if(timeslot.data){
              if(timeslot.data.id == meeting_schedule.time_slot_id){
                meeting_details = timeslot.data;
                data = sched;
  
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
                  schedules: schedule,
                  event_id: this.event_id,
                  delegate_id: meeting_details.event_delegate_id,
                  delegate: delegate
                }

                this.eventService.env.storage.set('event_other_info', event);
                this.eventService.env.storage.set('meeting-details', meeting_details);
                //.eventService.env.storage.set('from_page', 'delegate-profile/'+this.delegate.id+'/'+this.event_id);

                let navigationExtras = {
                  queryParams: {
                    previous_page: 'delegate-profile/'+this.delegate.id+'/'+this.event_id
                  }
                };
                this.router.navigate(['meeting-details'], navigationExtras);
              }
            }
          });
        }
      });
    });
  }

  
  /**
   * redirect to add note page but save the variable needed first
   */
  addNote(delegate){

    console.log(delegate);
    //this.env.storage.remove('meeting-details').then(data => {

      console.log(delegate);
      let add_note_delegate_info = {
        d2_profile_photo: delegate.profile_photo_url,
        d2_company_name: delegate.company.name,
        d2_fullname: delegate.fullname
      }
      this.env.storage.set('add_note_delegate_info', add_note_delegate_info).then(r => {
        
        if(this.eventDetails.type == 2){

          this.env.redirect('/add-notes-enhance/' + delegate.ed_id + '/' + delegate.ed_id);

        }else if(this.eventDetails.type == 1){

          this.env.redirect('/add-notes/' + delegate.ed_id + '/' + delegate.ed_id);

        }else{

          console.log('event time undefined');

        }
      })
    //});
  }

  viewNote(delegate){
    this.env.redirect('/note/' + this.event_id + '/' + delegate.event_notes);
  }

  scheduleAMeeting() {
    this.env.storage.get('event_schedules').then((schedule) => {
      this.env.storage.get('event').then((data) => {
        this.showMeetingScheduleInfo(schedule, data.delegate.id);
      });
    });
  }

  /**
   * display the modal of meeting schedule information
   */
  async showMeetingScheduleInfo(schedule, delegate_id) {

    this.delegate['company_name'] = this.delegate.company.name;
    this.delegate['company_sector'] = this.delegate.company.pref_sector_name;
    this.delegate['company_country_flag'] = this.delegate.company_country.iso;
    this.delegate['company_country_name'] = this.delegate.company_country.nicename;

      const modal = await this.modalCtrl.create({
      component: ScheduleMeetingInfoPage,
      componentProps: {
        delegate: this.delegate,
        delegate_id: delegate_id,
        schedules: schedule,
        event_id: this.event_id,
        event: this.event
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    if(data == 'meeting-scheduled-success'){
      this.selectTab('profile');
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

  // openImagePicker(){
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

  //                 if(!this.temp_profile_photo) {
  //                   this.temp_profile_photo = new Array<string>();
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
                      
  //                     this.temp_profile_photo.splice(0, 1);
  //                     this.temp_profile_photo.push(new_pp);

  //                     console.log("temp_profile_photo: ", this.temp_profile_photo);
  //                     this.save(this.temp_profile_photo);
  //                 });
  //               },
  //               error => console.error('Error cropping image', error)
  //             );
  //         }
  //     }
  //   }, (err) => { console.log(err); });
  // }

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
     console.log(imageData);
     if(imageData.length > 0){

      this.imageBase64 = 'data:image/jpeg;base64,' + imageData;
      this.gotoImageCropper(this.imageBase64);

      // this.crop.crop(imageData, { quality: 100, targetWidth: 320, targetHeight: 185 })
      //   .then(
      //     newImage => {

      //     console.log('new camera image path is: ' + newImage);
      //     this.delegate.businesscard_url = this.pathForImage(newImage);

      //     if(!this.temp_profile_photo) {
      //       this.temp_profile_photo = new Array<string>();
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
      this.gotoImageCropper(this.imageBase64);

      // this.crop.crop(imageData, { quality: 100, targetWidth: 320, targetHeight: 185 })
      //   .then(
      //     newImage => {

      //     console.log('new camera image path is: ' + newImage);
      //     this.delegate.businesscard_url = this.pathForImage(newImage);

      //     if(!this.temp_profile_photo) {
      //       this.temp_profile_photo = new Array<string>();
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

  async showChatbox(delegate_id){
    let myId = this._delegate.id;

    if(myId && delegate_id){
      const modal = await this.modalCtrl.create({
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

  gotoEditProfile(label){
    let navigationExtras: NavigationExtras = {
      queryParams: {
        edit_head: label
      }
    };
    this.router.navigate(['/edit-user-profile'], navigationExtras);
  }
  
  editPreferencesProfile(page_title=null){
    //this.router.navigate(['/edit-pofile-company', 'test']);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        page_type: 'preferences',
        edit_user_profile: true,
        page_title: page_title,
      }
    };
    this.navCtrl.navigateForward(['edit-profile-preferences'], navigationExtras);
  }

  // enhancements
  verifyAddressAndTimezone(delegateId){
    //alert(delegateId);
    let postData = new FormData();
    postData.append('delegate_id', delegateId);
    postData.append('timezone_status' , '2');

    let url = this.env.getUrl(Urls.api_delegates_settimezone);

    this.env.http.post<any>(url, postData, this.env.getHttpOptions()).subscribe(response => {
      console.log(response);
      if(response.error == 0){
        //alert('no error');
        this.delegate.timezone_status = 2;
      }
    });
    //console.log(postData);
  }

}
