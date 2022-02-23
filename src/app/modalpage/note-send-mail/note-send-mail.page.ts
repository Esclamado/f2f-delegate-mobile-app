import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotesService } from 'src/app/services/notes.service';

@Component({
  selector: 'app-note-send-mail',
  templateUrl: './note-send-mail.page.html',
  styleUrls: ['./note-send-mail.page.scss'],
})
export class NoteSendMailPage implements OnInit {

  @Input() note: any = null;
  @Input() event_id: any = null;

  /** ngModels */
  @Input() myemail: boolean = true;
  @Input() meeting_with_email: boolean = false;

  constructor(
    protected noteService: NotesService,
    public modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.myemail = true;
    this.meeting_with_email = false;

    console.log(this.note);
  }
  
  dismiss(data=null){
    this.modalCtrl.dismiss(data);
  }

  get isError(){
    return !this.myemail && !this.meeting_with_email;
  }

  sendToEmail(){

    if(!this.isError){
      let formDate = new FormData();
  
      formDate.append('note_id', this.note.id);
      formDate.append('event_id', this.event_id);

      let myemail = 'yes';
      if(!this.myemail){
        myemail = 'no';
      }
      formDate.append('myemail', myemail);

      let meeting_with_email = 'yes';
      if(!this.meeting_with_email){
        meeting_with_email = 'no';
      }
      formDate.append('meeting_with_email', meeting_with_email);
      
      this.noteService.sendToEmail(formDate)
      .subscribe(r => {
        let toast = '';
        if(r.error == 0){
          if(r.send_mail.myemail){
            toast += 'Your note has been sent to your email';
          }

          if(r.send_mail.meeting_with_email){

            if(!r.send_mail.myemail){
              toast += 'Your note has been sent to '+this.noteService.env.capitalizeText(this.note.d2_fullname)+'.';
            }else{
              toast += ' and to '+this.noteService.env.capitalizeText(this.note.d2_fullname)+'.';
            }

          }else{
            toast += '.';
          }
          this.noteService.env.toast(toast, 'toastsuccess');
          
        }else{
          toast= r.message;
          this.noteService.env.toast(toast);
        }

        this.dismiss();
      });
    }
  }

  stopPropagation(e){
    e.stopPropagation();
  }
}
