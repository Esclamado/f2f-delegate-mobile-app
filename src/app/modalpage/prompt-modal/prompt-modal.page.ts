import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-prompt-modal',
  templateUrl: './prompt-modal.page.html',
  styleUrls: ['./prompt-modal.page.scss'],
})
export class PromptModalPage implements OnInit {

  socialMedia: any;
  isValidClass: any;
  
  @Input() img_src: string;
  @Input() title: string;
  @Input() msg: string;
  @Input() msgHtml: string;
  @Input() btn_txt: string;
  @Input() icon: string;
  @Input() btn_save: string;
  @Input() btn_cancel: string;
  @Input() faq_btn: string;

  constructor(
    public modalCtrl: ModalController
  ) {
    //console.log(navParams.get('firstName');
  }

  ngOnInit() {

  }
  
  dismiss(data=null) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss(data);
  }
  
  stopPropagation(e){
    e.stopPropagation();
  }
}

