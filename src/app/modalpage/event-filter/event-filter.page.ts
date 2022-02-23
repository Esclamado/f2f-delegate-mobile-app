import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SchedulesService } from 'src/app/services/schedules.service';

@Component({
  selector: 'app-event-filter',
  templateUrl: './event-filter.page.html',
  styleUrls: ['./event-filter.page.scss'],
})
export class EventFilterPage implements OnInit {

  @Input() event: any = null;
  @Input() filters: any = null;
  @Input() schedules: any = null;
  

  days = {};
  typeFilter: boolean = false;
  dayFilter: boolean = false;

  /* filters var to fake the real value */
  agenda: boolean = false;
  scheduled_meetings: boolean = false;
  show_done_schedules: boolean = false;
  available_timeslots: boolean = false;
  filDays = {};
  
  constructor(
    private sched: SchedulesService,
    public modalCtrl: ModalController   
  ) { }

  ngOnInit() {
    this.setDays();
    if(this.filters.is_filtered){
      this.setFilters();
    }
    this.setDaysModel();
  }
  
  /**
   * set the days model for filters
   * this wil fake the real value
   * so that it is not checked by default
   */
  setDaysModel(){
    for (let key of Object.keys(this.filters.days)) {
      if(this.filters.is_filteredDays){
        this.filDays[key] = this.filters.days[key];
      } else {
        this.filDays[key] = false;
      }
    }
  }

  updateFilterDays(e, mili){
    let fromFormkey = 'day_'+mili;

    let hasFilter = false;
    for (let key of Object.keys(this.filters.days)) {
      if(key == fromFormkey){
        this.filters.days[key] = e.target.checked ? true : false;
      } else {
        this.filters.days[key] = this.filDays[key];
      }

      if(this.filDays[key]){
        hasFilter = true;
      }
    }

    this.filters.is_filteredDays = hasFilter;

    /* need to display all dates */
    if(!this.filters.is_filteredDays){
      for (let key of Object.keys(this.filters.days)) {
        this.filters.days[key] = true;
      }
    }
  }

  get typeFilterSelectAllSettter(){
    if(this.event.archive_in){
      if(
        this.agenda == true && 
        this.scheduled_meetings == true
      ){
        this.typeFilter = true;
      } else {
        this.typeFilter = false;
      }
    }else{
      if(
        this.agenda == true && 
        this.scheduled_meetings == true && 
        this.available_timeslots == true
      ){
        this.typeFilter = true;
      } else {
        this.typeFilter = false;
      }
    }
    return this.typeFilter
  }

  setFilters(){
    this.agenda = (this.filters.agenda && this.filters.is_filtered) ? this.filters.agenda : false;
    this.scheduled_meetings= (this.filters.scheduled_meetings && this.filters.is_filtered) ? this.filters.is_filtered : false;
    this.available_timeslots = (this.filters.available_timeslots && this.filters.is_filtered) ? this.filters.is_filtered : false;
  }

  updateFilter(){
    
    if(!this.agenda && !this.scheduled_meetings && !this.available_timeslots){
      this.filters.agenda = true;
      this.filters.scheduled_meetings = true;
      this.filters.available_timeslots = true;
      this.filters.is_filtered = false;
    } else {
      this.filters.agenda = (this.agenda == true) ? true : false;
      this.filters.scheduled_meetings = (this.scheduled_meetings == true) ? true : false;
      this.filters.available_timeslots = (this.available_timeslots == true) ? true : false;
      this.filters.is_filtered = true;
    }
  }

  get dayFilterSelectAllSetter() {
    let obKey = Object.keys(this.filDays);
    this.dayFilter = obKey.every( (val, i, arr) => this.filDays[val] === true );
    return this.dayFilter;
  }

  /**
   * select all filters that is not day filter
   */
  selectAllNotDays(e){
    this.filters.agenda = true;
    this.filters.scheduled_meetings = true;
    this.filters.available_timeslots = true;
    
    if(e.target.checked){
      this.filters.is_filtered = true;
    } else {
      this.filters.is_filtered = false;
    }
    this.setFilters();
  }

  resetFilter(){
    this.filters.agenda = true;
    this.filters.scheduled_meetings = true;
    this.filters.available_timeslots = true;
    this.filters.show_done_schedules = true;

    this.agenda = false;
    this.scheduled_meetings= false;
    this.available_timeslots = false

    this.filters.is_filtered = false;
    this.filters.is_filteredDays = false;

    for (let key of Object.keys(this.filters.days)) {
      this.filters.days[key] = true;
      this.filDays[key] = false;
    }
    this.dismiss();
  }

  selectAllDays(e){
    let newDays = {};
    if(e.target.checked){
      for (let key of Object.keys(this.filters.days)) {
        newDays[key] = true;
        this.filDays[key] = true;
      }
      this.filters.is_filteredDays = true;
    } else {
      for (let key of Object.keys(this.filters.days)) {
        newDays[key] = true;
        this.filDays[key] = false;
        this.filters.is_filteredDays = false;
      }
    }
    this.filters.days = newDays;
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'schedules': this.schedules
    });
  }
  stopPropagation(e){
    e.stopPropagation();
  }

  setDays(){
    let count = 1;
    this.event.days.forEach((val, key) => {

      let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      let date = new Date(val.milisec*1000);

      let mon = months[date.getMonth()];
      let day = date.getDate();

      let formated = mon + " " + day + ", Day " + count;

      this.event.days[key].formatted = formated;

      count++;
    });
  }

  getEventById(e) {
    setTimeout(f => {
      let includepast = 'no';
      if(this.filters.show_done_schedules) {
        includepast = '';
      }

      this.sched.getSchedules(this.event.id, includepast)
        .subscribe(r => {
          this.schedules = r.data;
        });
    }, 50);
  }
}
