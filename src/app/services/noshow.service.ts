import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { Urls } from 'src/app/lib/urls';


@Injectable({
  providedIn: 'root'
})
export class NoshowService {

  constructor(
  	private env: EnvService,
  ){ }

  getTopNoshowDelegate(param){
    let url = this.env.getUrl(Urls.mapi_noshow_topnoshow);
    url += this.env.createUrlParam(param);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  reportAsNoshow(event_id,meeting_schedule_id,reporter_delegate_id,reported_delegate_id){
  	let url = this.env.getUrl(Urls.mapi_noshow_report);
   		
   	let formData = new FormData();
   	formData.append('event_id', event_id);
   	formData.append('meeting_schedule_id', meeting_schedule_id);
   	formData.append('reported_delegate_id', reported_delegate_id);
   	formData.append('reporter_delegate_id', reporter_delegate_id);

    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }


  removeNoshowReport(formData){
    let url = this.env.getUrl(Urls.mapi_noshow_cancel);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }
}
