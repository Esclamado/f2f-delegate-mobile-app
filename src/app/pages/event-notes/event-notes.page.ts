import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotesService } from 'src/app/services/notes.service';
import { ModalController } from '@ionic/angular';
import { ScheduleMeetingPage } from 'src/app/modalpage/schedule-meeting/schedule-meeting.page';

@Component({
  selector: 'app-event-notes',
  templateUrl: './event-notes.page.html',
  styleUrls: ['./event-notes.page.scss'],
})
export class EventNotesPage implements OnInit {

  event_id: any = null;
  event_delegate_id: any = null;

  limit: any = 6;
  current_page: any = 1;
  total_page: any = 1;
  notes = [];
  total_notes: any = null;

  skeleton_loader: any = [
    { id: '1'},
    { id: '2'},
  ];  

  constructor(
    protected _route: ActivatedRoute,
    protected note: NotesService,
    public modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this._route.paramMap.subscribe( url_param =>{
      this.event_id = + url_param.get('event_id');
      this.note.env.storage.get('event_delegate_id').then(id => {
        this.event_delegate_id = id;
        this.notes = null;
        this.current_page = 1;
        this.getAllNotes();
      });
    });
  }

  doRefresh(e) {
    this.current_page = 1;
    this.getAllNotes(e);
  }

  getAllNotes(refresher?, infiniteScroll?){
    let params = {
      event_id: this.event_id,
      edid: this.event_delegate_id,
      limit: this.limit,
      page: this.current_page
    }

    this.note.getAllNotes(params)
      .subscribe(r => {
        if(r.error == 0){
          this.current_page = r.data.current_page;
          this.total_notes = r.data.total_count;
          this.total_page = r.data.total_page;

          if(!infiniteScroll) {
            this.notes = []; 
          }

          if(r['data']['datas'].length > 0){
            r['data']['datas'].forEach((cat, idx) => {
              console.log('notes', cat);
              this.notes.push(cat);
            });
          }

          if(infiniteScroll){
            infiniteScroll.target.complete();
          }

        } else {
          this.note.env.toast(r.message)
        }

        if(refresher){
          refresher.target.complete();
        }
      });
  }

  loadData(event){
    this.current_page += 1;
    if(this.current_page <= this.total_page) {
      this.getAllNotes(null, event);
    } else {
      event.target.disabled = true;
    } 
  }

  async showDelegatesModal(){

    this.note.env.storage.set('note_prev_page', '/event-notes/'+this.event_id);
    
    const modal = await this.modalCtrl.create({
      component: ScheduleMeetingPage,
      componentProps: {
        called_by: 'event_notes',
        event_id: this.event_id,
        delegate_id: this.event_delegate_id
      }
    });

    modal.present();
  }

  gotoNotes(data){
    this.note.env.storage.set('note_prev_page', '/event-notes/'+this.event_id);
    this.note.env.redirect('/note/'+this.event_id+'/'+data.id);
  }
}
