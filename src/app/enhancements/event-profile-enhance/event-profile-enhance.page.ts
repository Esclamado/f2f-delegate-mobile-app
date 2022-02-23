import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from 'src/app/services/event.service';
import { SpeakerService } from 'src/app/services/speaker.service';

@Component({
  selector: 'app-event-profile-enhance',
  templateUrl: './event-profile-enhance.page.html',
  styleUrls: ['./event-profile-enhance.page.scss'],
})
export class EventProfileEnhancePage implements OnInit {

  event : any = null;
  event_id: any = 0;

  limit: any = 10;
  speakers: any = null;
  speaker_current_page: any = 1;
  speaker_total_page: any = 0;
  total_speaker_count: any = 0;

  skeleton_loader: any = [
    { id: '1'},
    { id: '2'},
    { id: '3'}
  ];
  constructor(
    private env: EnvService,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private speakerService: SpeakerService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe( url_param =>{
      this.event_id = url_param.get('event_id');

      this.speaker_current_page = 1;
      this.getSpeakers();
    });

    this.eventService.env.storage.get('event').then((data) => {
      this.event = data;
      console.log(this.event);
     
    });
  }


  myBackButton(){
    this.env.location.back();
  }

  getSpeakers(infiniteScroll=null){
    let thisGetForm = {
      event_id: this.event_id,
      limit: this.limit,
      page: this.speaker_current_page
    };

    this.speakerService.getSpeaker(thisGetForm)
    .subscribe(d => {
      if(d.error == 0){
        this.speaker_current_page = d.data.current_page;
        this.speaker_total_page = d.data.total_page;
        this.total_speaker_count = d.data.total_count;
        
        if(!infiniteScroll) {
          this.speakers = []; 
        }

        if(d['data']['datas']){
          d['data']['datas'].forEach((cat, idx) => {
            this.speakers.push(cat);
          });
        }

        if(infiniteScroll){
          infiniteScroll.target.complete();
        }
      }
    });
  }
  
  loadData(event){
    this.speaker_current_page += 1;
    // console.log(this.delegates_current_page +'<='+ this.delegates_total_page);
    if(this.speaker_current_page <= this.speaker_total_page) {
      this.getSpeakers(event);
    } else {
      event.target.disabled = true;
    } 
  }

  gotoSpeaker(speaker){
    this.eventService.env.storage.set('speaker', speaker);
    this.router.navigate(['speaker-profile-enhance']);
  }
}
