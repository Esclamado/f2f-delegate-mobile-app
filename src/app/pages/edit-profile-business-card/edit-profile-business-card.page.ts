import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ToastController, Platform, LoadingController, ModalController } from '@ionic/angular';

import { Crop } from '@ionic-native/crop/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { DelegateService } from 'src/app/services/delegate.service';
import { Urls } from 'src/app/lib/urls';

import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageCropperPage } from 'src/app/modalpage/image-cropper/image-cropper.page';

import { EnvService } from 'src/app/lib/env.service';

@Component({
  selector: 'app-edit-profile-business-card',
  templateUrl: './edit-profile-business-card.page.html',
  styleUrls: ['./edit-profile-business-card.page.scss'],
})
export class EditProfileBusinessCardPage implements OnInit {

  imageBase64: any = '';

  delegate: any = null;
  temp_profile_photo: any = null;
  cameraLoader: any = null;

  constructor(
    public imagePicker: ImagePicker,
    public crop: Crop,
    public transfer: FileTransfer,
    public env: EnvService,
    public actionSheetController: ActionSheetController,
    public camera: Camera,
    public platform: Platform,
    public webview: WebView,
    public delegateService: DelegateService,
    public imageCompress: NgxImageCompressService,
    public loadingController: LoadingController,
    public modalCtrl: ModalController
  ) {

  }

  ngOnInit() {
    this.env.storage.get('delegate').then((d) => {
      this.delegate = d;
      console.log('rhan b',d);
    });
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

        this.gotoBusinessImageCropper(this.imageBase64);


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
     console.log(imageData);
     if(imageData.length > 0){

      this.imageBase64 = 'data:image/jpeg;base64,' + imageData;

      this.gotoBusinessImageCropper(this.imageBase64);
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
      // if(
      //   key == 'social_media_links' || 
      //   key == 'pref_software_ids' || 
      //   key == 'pref_sector_ids' || 
      //   key == 'pref_countries_ids' || 
      //   key == 'pref_specialization_ids' || 
      //   key == 'pref_services_ids' || 
      //   key == 'pref_network_ids'
      // ){
      //   toAppend = JSON.stringify(this.delegate[key]);
      // }
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
}
