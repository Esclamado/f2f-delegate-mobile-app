import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { Urls } from 'src/app/lib/urls';
import { TimezoneService } from './timezone.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(
    public env: EnvService,
    public timezoneService: TimezoneService
  ) { }

  /*
  * will return all events by the delegate
  */
  getEvent(id: number, status: string) {
    let url = this.env.getUrl(Urls.api_eventdelegate_get);
    url += '?status=' + status + '&delegate_id='+id + '&published='+true;
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  /*
  * will return specific event by id
  */
  getEventById(id: number, delegate_id: number){
    let url = this.env.getUrl(Urls.api_events_get);
    url += '?event_id=' + id;
    url += '&isApp=' + delegate_id;
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  getEventByIdVirtual(id: number, delegate_id: number){
    let url = this.env.getUrl(Urls.api_events_getvirtual);
    url += '?event_id=' + id;
    url += '&isApp=' + delegate_id;
    url += '&delegate_timezone=' + this.timezoneService.delegateTimezoneName;
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }
  
  /*
  * will save event session statistics
  */
  saveEventSessionstats(formData){
    let url = this.env.getUrl(Urls.mapi_sessionstats_save);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

  
  /*
  * will save the event feature comparison or statistics
  */
  saveFeatureComparison(formData){
    let url = this.env.getUrl(Urls.api_featurecomparison_save);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }
}
