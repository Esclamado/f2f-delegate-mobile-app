import { Component, OnInit } from '@angular/core';

import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-event-floorplan',
  templateUrl: './event-floorplan.page.html',
  styleUrls: ['./event-floorplan.page.scss'],
})
export class EventFloorplanPage implements OnInit {

  event: any = null;
  constructor(
    private eventService: EventService
  ) { }

  ngOnInit() {
    this.eventService.env.storage.get('event').then((data) => {
      this.event = data;
      console.log(this.event);
      if(this.event){
      }
    });
  }
  
  myBackButton(){
    this.eventService.env.location.back();
  }

}
