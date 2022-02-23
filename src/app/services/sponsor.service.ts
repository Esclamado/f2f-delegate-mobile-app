import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { Urls } from 'src/app/lib/urls';

// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
// import { File } from '@ionic-native/file';

@Injectable({
  providedIn: 'root',
})
export class SponsorService {

  constructor(
    private env: EnvService
  ) { }

	/*
	*	api call @event_id is the event ID
	*	@id is the id of the sponsor
	*/
	getSponsor(data: any){
		let url = this.env.getUrl(Urls.api_sponsor_get);
		url += this.env.createUrlParam(data);
    	return this.env.http.get<any>(url, this.env.getHttpOptions());
  	}
}
