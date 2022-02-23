import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-prompt-modal-header-enhance',
  templateUrl: './prompt-modal-header-enhance.page.html',
  styleUrls: ['./prompt-modal-header-enhance.page.scss'],
})
export class PromptModalHeaderEnhancePage implements OnInit {

  @Input() title: any = null;
  @Input() msg: any = null;
  @Input() msgHtml: any = null;
  @Input() btn_cancel: any = null;
  @Input() btn_save: any = null;
  @Input() btn: any = null;

  constructor(
    public modalCtrl: ModalController
  ) { }

  ngOnInit() {
  }

  dismiss(data=null){
    this.modalCtrl.dismiss(data);
  }
  
}
