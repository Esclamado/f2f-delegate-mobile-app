import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Events } from '@ionic/angular';

import { EventService } from 'src/app/services/event.service';
import { SpeakerService } from 'src/app/services/speaker.service';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { EnvService } from 'src/app/lib/env.service';

declare var google;

@Component({
  selector: 'app-event-profile',
  templateUrl: './event-profile.page.html',
  styleUrls: ['./event-profile.page.scss'],
})
export class EventProfilePage implements OnInit {

  event : any = null;
  event_id: any = 0;

  limit: any = 10;
  speakers: any = null;
  speaker_current_page: any = 1;
  speaker_total_page: any = 0;
  total_speaker_count: any = 0;
  
  @ViewChild('map', {static: false}) mapElement: ElementRef;
  map: any;
  marker: any;

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
    private speakerService: SpeakerService,
    private photoViewer: PhotoViewer,
    private events: Events
  ) { }

  ngOnInit() {
    /* this.route.queryParams.subscribe(params => {
      if (params && params.event) {
        let event = atob(params.event);
        this.event = JSON.parse(event);
        console.log(this.event);
      }
    }); */
    this.route.paramMap.subscribe( url_param =>{
      this.event_id = url_param.get('event_id');

      this.speaker_current_page = 1;
      this.getSpeakers();
    });

    this.eventService.env.storage.get('event').then((data) => {
      this.event = data;
      console.log(this.event);
      if(this.event){
        this.loadMap();
      }
    });

  }

  loadMap() {
    if(this.event){
      let element = this.mapElement.nativeElement;
      // this.map = this.googleMaps.create(element);
      this.map = new google.maps.Map(this.mapElement.nativeElement, {
        zoom: 13,
        center: {lat: parseFloat(this.event.lat), lng: parseFloat(this.event.long)},
        mapTypeControl: false,
        streetViewControl: false,
        draggable: false, 
        zoomControl: false, 
        scrollwheel: false, 
        disableDoubleClickZoom: true,
        fullscreenControl: false
      });
  
      this.marker = new google.maps.Marker({
          map: this.map,
          animation: google.maps.Animation.DROP,
          position: {lat: parseFloat(this.event.lat), lng: parseFloat(this.event.long)},
      });
    }
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
    this.router.navigate(['speaker-profile']);
  }

  gotoEventFloorPlan(floor_plan_url){
    /* this.photoViewer.show(floor_plan_url); */
    this.router.navigate(['event-floorplan']);
  }

  gotoEventLocation(){
    this.router.navigate(['event-location']);
  }

}
