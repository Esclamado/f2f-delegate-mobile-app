import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { EventService } from 'src/app/services/event.service';
import { EnvService } from 'src/app/lib/env.service';

declare var google;

@Component({
  selector: 'app-event-location',
  templateUrl: './event-location.page.html',
  styleUrls: ['./event-location.page.scss'],
})
export class EventLocationPage implements OnInit {

  @ViewChild('map', {static: false}) mapElement: ElementRef;
  map: any;
  marker: any;
  event: any = null;

  constructor(
    private env: EnvService,
    private eventService: EventService
  ) { }

  ngOnInit() {
    this.eventService.env.storage.get('event').then((data) => {
      this.event = data;
      console.log(this.event);
      if(this.event){
        this.loadMap();
      }
    });
  }

  myBackButton(){
    this.env.location.back();
  }

  loadMap() {
    if(this.event){
      let element = this.mapElement.nativeElement;
      // this.map = this.googleMaps.create(element);
      this.map = new google.maps.Map(this.mapElement.nativeElement, {
        zoom: 13,
        center: {lat: parseFloat(this.event.lat), lng: parseFloat(this.event.long)},
        mapTypeControl: false,
        streetViewControl: false
      });
  
      this.marker = new google.maps.Marker({
          map: this.map,
          animation: google.maps.Animation.DROP,
          position: {lat: parseFloat(this.event.lat), lng: parseFloat(this.event.long)},
      });
    }
  }

}
