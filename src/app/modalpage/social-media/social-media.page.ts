import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { EnvService } from 'src/app/lib/env.service';

@Component({
  selector: 'app-social-media',
  templateUrl: './social-media.page.html',
  styleUrls: ['./social-media.page.scss'],
})
export class SocialMediaPage implements OnInit {

  socialMedia: any;
  isValidClass: any;
  haveSocialMedia: boolean = false;
  
  @Input() icon: string;
  @Input() name: string;
  @Input() class: string;
  @Input() value: string;
  @Input() viewonly: string;
  @Input() help: string;

  constructor(
    private modalCtrl: ModalController,
    private clipboard: Clipboard,
    private env: EnvService
  ) {
    //console.log(navParams.get('firstName');
  }

  ngOnInit() {
    if(this.value){
      this.socialMedia = this.value;
      this.haveSocialMedia = true;
    }
  }
  
  copyText(){
    this.clipboard.copy(this.socialMedia);
    this.env.toast('Copy to Clipboard', 'toastsuccess');
    this.dismiss();
  }
  
  dismiss(save=null) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    if(save){
      this.isValidClass = 'valid';
      if(save == 'save'){
        this.modalCtrl.dismiss({'socialMedia': this.socialMedia});
      }else{
        this.modalCtrl.dismiss({'socialMedia': ''});
      }
    }else{
      this.modalCtrl.dismiss(null);
    }
  }
  
  stopPropagation(e){
    e.stopPropagation();
  }
}
