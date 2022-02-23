import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { EventService } from 'src/app/services/event.service';
import { SpeakerService } from 'src/app/services/speaker.service';

@Component({
  selector: 'app-speaker-profile-enhance',
  templateUrl: './speaker-profile-enhance.page.html',
  styleUrls: ['./speaker-profile-enhance.page.scss'],
})
export class SpeakerProfileEnhancePage implements OnInit {

  speaker : any = null;

  constructor(
    private env: EnvService,
    private eventService: EventService,
    private speakerService: SpeakerService
  ) { }

  ngOnInit() {
    this.eventService.env.storage.get('speaker').then((data) => {
      this.speaker = data;
      console.log(this.speaker);
    });
  }

  doRefresh(e) {
    let thisGetForm = {
      id: this.speaker.id,
      event_id: this.speaker.event_id,
    };
  
    this.speakerService.getSpeaker(thisGetForm)
    .subscribe(d => {
      if(d.error == 0){
        console.log(d);
        this.speaker = d.data;
      }
      e.target.complete();
    });
  }

  myBackButton(){
    this.env.location.back();
  }

}
