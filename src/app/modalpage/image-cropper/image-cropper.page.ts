import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { EnvService } from 'src/app/lib/env.service';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.page.html',
  styleUrls: ['./image-cropper.page.scss'],
})
export class ImageCropperPage implements OnInit {

  	@ViewChild(ImageCropperComponent, { static: false }) angularCropper: ImageCropperComponent;
  	@Input() imageBase64: string;
  	@Input() type: string;

  	imageChangedEvent: any = '';
  	croppedFileImage: any = '';

  	constructor(
    	private modalCtrl: ModalController,
    	public env: EnvService,
		private statusBar: StatusBar,
		public platform: Platform,
  	) { 
  	}

  	ngOnInit() {
		if (this.platform.is('ios')) {
			this.statusBar.overlaysWebView(true);
			this.statusBar.overlaysWebView(false);
		}
  	}

	imageCropped(event: ImageCroppedEvent){
		this.croppedFileImage = event;
	}
	rotateLeft(){
	     this.angularCropper.rotateLeft();
	}
	rotateRight(){
     	this.angularCropper.rotateRight();
  	}

	dismiss(event = null) {
		let data;
		if(event){
			data = null;

		}else{
		    let imgBlob = this.env.b64toBlob(this.croppedFileImage.base64.replace("data:image/jpeg;base64,", ""), 'image/jpeg', 512);

		    data = {
		    	'fileBlob': imgBlob,
		    	'base64': this.croppedFileImage.base64
		    }
		}
		this.modalCtrl.dismiss(data);
	}
  
  	stopPropagation(e){
    	e.stopPropagation();
  	}
}
