import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-prompt-modal-enhance',
  templateUrl: './prompt-modal-enhance.page.html',
  styleUrls: ['./prompt-modal-enhance.page.scss'],
})
export class PromptModalEnhancePage implements OnInit {

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
  ) { }

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
