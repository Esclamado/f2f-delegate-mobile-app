import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { NotesService } from 'src/app/services/notes.service';
import { LoadingController, ModalController, Events } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { PromptModalEnhancePage } from 'src/app/enhance-modalpage/prompt-modal-enhance/prompt-modal-enhance.page';

@Component({
  selector: 'app-add-notes-enhance',
  templateUrl: './add-notes-enhance.page.html',
  styleUrls: ['./add-notes-enhance.page.scss'],
})
export class AddNotesEnhancePage implements OnInit {

  // meeting : any = null;
  // notes : any = null;

  event : any = null;
  delegate : any = null;

  /**
   * hold the input string
   */
  note : any = null;

  /**
   * ids
   */
  msid: any = null;
  myId: any = null;
  otherDelegateId : any = null;

  /**
   * this hold the data of note
   */
  _note: any = null;

  /**
   * tells from what page the request came from
   */
  from: string = 'meeting-details';

  constructor(
    public env: EnvService,
    private notesService: NotesService,
    private loadingController: LoadingController,
    private modalCtrl: ModalController,
    protected _route: ActivatedRoute,
    public events: Events
  ) { }

  ngOnInit() {

    this._route.paramMap.subscribe( url_param =>{
      let edid = url_param.get('event_delegate_id');
      let msid = url_param.get('meeting_schedule_id');

      this.notesService.env.storage.get('event_delegate_id').then((myedid) => {
        this.myId = myedid;
        this.msid = msid;
        this.otherDelegateId = edid;

        let param = {
          msid: msid,
          myedid: this.myId,
          other_deid: edid
        }
        this.notesService.getNote(param)
        .subscribe(r => {
          if(r.data){
            this._note = r.data;
            this.note = r.data.note;

            this.delegate = {
              d2_profile_photo: this._note.d2_profile_photo,
              d2_company_name: this._note.d2_company_name,
              d2_fullname: this._note.d2_fullname
            }
          } else {
            this.notesService.env.storage.get('add_note_delegate_info').then((del) => {
              console.log('del',del);
              this.delegate = del;
            });
          }
        });
      });
      this.notesService.env.storage.get('event').then((event) => {
        this.event = event;
      });

      /* // if(edid){
      //   this.otherDelegateId = edid;
      //   this.notesService.env.storage.get('note-delegate-info').then((data) => {
      //     this.meeting = {
      //       meeting_schedule: {
      //         id: data.id,
      //         delegate_profile_photo: data.profile_photo,
      //         delegate_company_name: data.company_name,
      //         delegate_fullname: data.fullname,
      //       }
      //     }
      //     if(data.note){
      //       this.notes = data.note;
      //       this.note = data.note.note;
      //     }
      //     this.from = 'note-listing';
      //   });
      // } else {
      //   this.notesService.env.storage.get('meeting-details').then((data) => {
      //     this.meeting = data;
      //   });
      //   this.notesService.env.storage.get('notes').then((data) => {
      //     this.notes = data;
      //     if(this.notes){
      //       this.note = this.notes.note;
      //     }
      //   });
      // } */
    });

  }

  myBackButton(){
    this.env.location.back();
  }

  isTyping(){
    this.note = this.note.charAt(0).toUpperCase() + this.note.slice(1);
  }

  async saveNotes(){
    /* // if(this.from == 'meeting-details'){
    //   if(this.meeting.event_delegate_id == this.meeting.meeting_schedule.delegate1){
    //     this.myId = this.meeting.meeting_schedule.delegate1;
    //     this.otherDelegateId = this.meeting.meeting_schedule.delegate2;
    //   }else{
    //     this.myId = this.meeting.meeting_schedule.delegate2;
    //     this.otherDelegateId = this.meeting.meeting_schedule.delegate1;
    //   }
    // }
   
    // if(this.notes){
    //   this.notes['note'] = this.note;
    // }else{
    //   this.notes = {
    //     delegate1: this.myId,
    //     delegate2: this.otherDelegateId,
    //     meeting_schedule_id: this.meeting.meeting_schedule.id,
    //     note: this.note,
    //   };
    // } */

    if(this.note){

      let formData = {
        delegate1: this.myId,
        delegate2: this.otherDelegateId,
        meeting_schedule_id: this.msid,
        note: this.note,
        event_id: this.event.id,
      }

      if(this._note){
        formData['id'] = this._note.id;
      }

      let loading = await this.loadingController.create({
        message: 'Saving...'
      });
      await loading.present();

      this.notesService.save(formData).subscribe(data => {
        loading.dismiss();
        if(data['error'] == '0'){
          /* // this.notes['id'] = data.notes_id;
          // this.notesService.env.storage.set('notes', this.notes); */
          this.presentSuccessModal(data.notes_id);
        }
      });

      const { role, data } = await loading.onDidDismiss();
    }
  }

  async presentSuccessModal(note_id) {
    let title = 'Notes Added';
    let msg = 'Notes has been successfully added.';
    if(this._note){
      title = 'Notes Updated';
      msg = 'Notes has been successfully updated.';
    }

    const modal = await this.modalCtrl.create({
      component: PromptModalEnhancePage,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        img_src: '/assets/icon/save-note.png',
        title: title,
        msg: msg, 
        btn_txt: 'Okay', 
      }
    });

    modal.present();

    const { data } = await modal.onDidDismiss();
    setTimeout(f => {
      this.notesService.env.storage.get('delegate').then((delegate) => {
        delegate.event_notes = note_id;
        this.env.storage.set('delegate', delegate);
        this.events.publish('delegate', this.delegate, Date.now());
        this.env.storage.get('add_note_delegate_info').then((add_note_delegate_info) => {
          if(add_note_delegate_info){
            //this.myBackButton();
            // this.notesService.env.redirect('/tabs/event/'+this.event.id);
            // this.env.storage.remove('add_note_delegate_info');
            
            this.notesService.env.redirect('/note-enhance/'+this.event.id+'/'+note_id);
          }else{
            this.notesService.env.redirect('/note-enhance/'+this.event.id+'/'+note_id);
          }
        });
      });
    }, 10);
    
  }

}
