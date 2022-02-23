import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-file-option',
  templateUrl: './file-option.page.html',
  styleUrls: ['./file-option.page.scss'],
})
export class FileOptionPage implements OnInit {

  @Input() note: any = null;
  @Input() event_id: any = null;
  @Input() type: any = null;
  
  /** ngModels */
  @Input() pdf_file: boolean = true;
  @Input() ical_file: boolean = false;
  @Input() ics_file: boolean = false;

  constructor(
    public modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.pdf_file = true;
    this.ical_file = false;
    //this.ics_file = false;

    console.log(this.note);
  }
  
  dismiss(data=null){
    this.modalCtrl.dismiss(data);
  }

  get isError(){
    return !this.pdf_file && !this.ical_file;
  }

  sendToEmail(){
    let data = {
      pdf_file: this.pdf_file,
      ical_file: this.ical_file
    };
    this.dismiss(data);
  }  
  
  stopPropagation(e){
    e.stopPropagation();
  }
}
