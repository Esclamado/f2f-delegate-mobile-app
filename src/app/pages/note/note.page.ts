import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotesService } from 'src/app/services/notes.service';
import { ModalController, Platform } from '@ionic/angular';
import { NoteSendMailPage } from 'src/app/modalpage/note-send-mail/note-send-mail.page';
import { PromptModalHeaderPage } from 'src/app/modalpage/prompt-modal-header/prompt-modal-header.page';
import { EnvService } from 'src/app/lib/env.service';

@Component({
  selector: 'app-note',
  templateUrl: './note.page.html',
  styleUrls: ['./note.page.scss'],
})
export class NotePage implements OnInit {

  event_id: any = null;
  note_id: any = null;
  event_delegate_id: any = null;

  edited: string = '';

  note: any = null;

  constructor(
    protected _route: ActivatedRoute,
    protected noteService: NotesService,
    public modalCtrl: ModalController,
    protected router: Router,
    private env: EnvService,
    public platform: Platform
  ) { }

  ngOnInit() {
    this._route.paramMap.subscribe( url_param =>{
      this.event_id = url_param.get('event_id');
      this.note_id = url_param.get('note_id');

      this.noteService.env.storage.get('event_delegate_id').then(id => {
        this.event_delegate_id = id;
        this.getNote();
      })
    });
  }

  /**
   * get note from server
   */
  getNote() {
    let params = {note_id: this.note_id}
    this.noteService.getNote(params)
    .subscribe(r => {
      if(r.error == 0){
        if(typeof r.data != 'undefined'){
          this.note = r.data;
          this.formatEditData();
        } else {
          this.note = 'no-note'
        }
      } else {
        this.note = 'no-note';
      }
    })
  }

  formatEditData(){
    let editDate = new Date(this.note.updated_at.replace(' ', 'T'));

    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let mon = months[editDate.getMonth()];
    let date = editDate.getDate();
    let year = editDate.getFullYear();

    console.log(('ssss'),this.note.updated_at.replace(' ', 'T'));
    console.log('ssss',editDate);
    this.edited = mon + ' ' + date + ', ' + year;
    console.log('ssss',this.edited);
  }

  async sendModal() {
    const modal = await this.modalCtrl.create({
      component: NoteSendMailPage,
      cssClass:'my-custom-modal-css',
      componentProps: {
        note: this.note,
        event_id: this.event_id
      }
    });

    modal.present();
  }

  async deleteConfirmModal() {
    const modal = await this.modalCtrl.create({
      component: PromptModalHeaderPage,
      cssClass:'my-custom-modal-css',
      componentProps: {
        title: 'Delete Note',
        msg: 'Are you sure you want to delete your note with ' + this.noteService.env.capitalizeText(this.note.d2_fullname) + '?',
        btn_cancel: 'No, Close',
        btn_save: 'Delete Note',
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    if(data == 'save'){
      setTimeout(f => {
        this.deleteNote()
      }, 10);
    }
  }

  deleteNote(){
    let params = {note_id: this.note_id}
    this.noteService.deleteNote(params)
    .subscribe(r => {
      if(r.error == 0){
        this.noteService.env.redirect('/event-notes/' + this.event_id);
      }
      if(r.message == 'Success!'){
        this.noteService.env.toast('Your note has been deleted', 'toastsuccess');
      }else{
        this.noteService.env.toast(r.message);
      }
    })
  }

  goBack(){
    this.noteService.env.storage.get('from_meeting_details').then((data) => {
      if(data){
        this.noteService.env.storage.remove('from_meeting_details');
        this.router.navigate(['/meeting-details']);
      }else{
        //this.router.navigate(['/event-notes/'+this.event_id]);

        this.noteService.env.storage.get('note_prev_page').then((res) => {
          if(res){
          this.noteService.env.storage.remove('note_prev_page');
            //this.router.navigate([res]);
            this.env.location.back();
          }else{
            //console.log('peke');
            this.env.location.back();

          }
        });
      }
    });
  }

  gotoDelegateProfile(delegate_id){
    this.router.navigate(['delegate-profile/'+delegate_id+'/'+this.event_id]);
  }
}
