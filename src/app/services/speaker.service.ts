import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { Urls } from 'src/app/lib/urls';

@Injectable({
  providedIn: 'root',
})
export class SpeakerService {

  constructor(
    private env: EnvService
  ) { }

	/*
	*	api call @event_id is the event ID
	*	@id is the id of the sponsor
	*/
	getSpeaker(data: any){
		let url = this.env.getUrl(Urls.api_speaker_get);
		url += this.env.createUrlParam(data);
    	return this.env.http.get<any>(url, this.env.getHttpOptions());
  	}
}
