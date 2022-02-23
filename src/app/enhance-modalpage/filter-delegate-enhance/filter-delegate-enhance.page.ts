import { Component, OnInit, Input } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { DelegateService } from 'src/app/services/delegate.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-filter-delegate-enhance',
  templateUrl: './filter-delegate-enhance.page.html',
  styleUrls: ['./filter-delegate-enhance.page.scss'],
})
export class FilterDelegateEnhancePage implements OnInit {

  public prefs: any = {
    networks: [],
    services: [],
    states: [],
    specializations: [],
    countries: [],
    sectors: [],
    softwares: []
  }

  selectedServices: any;
  selectedSpecializations: any;
  selectedCountries: any;
  selectedDate: any;
  selectedTime: any;
  selectedList: any = 'all';
  country_id: any = null;

  services: any = [];
  specialization: any = [];
  countries: any = [];
  software: any = [];

  limit : any = 10;
  country_limit : any = 239;

  @Input() filters: any = {
    pref_countries_ids: [],
    pref_services_ids: [],
    pref_specialization_ids: [],
    selectedList: 'all',
  };
  @Input() filters_details: any = {
    pref_countries_ids_detail: [],
    pref_services_ids_detail: [],
    pref_specialization_ids_detail: [],
  };

  @Input() selected_date: any = null;
  @Input() selected_time: any = null;

  @Input() filter_counter: any = 0;
  @Input() schedules: any = null;
  @Input() timeslot: any = [];
  @Input() event: any = null;
  filter_time_disable: boolean = true;
  timeslot_placeholder = 'Please select date first';

  constructor(
    public env: EnvService,
    public prefService: PreferencesService,
    public delegateService: DelegateService,
    public modalCtrl: ModalController
  ) { }

  ngOnInit() {
  }

  
}
