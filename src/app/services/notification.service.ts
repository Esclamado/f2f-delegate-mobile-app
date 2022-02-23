import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { Urls } from 'src/app/lib/urls';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  constructor(
    private env: EnvService,
  ) { }

	getNotification(data: any){
		let url = this.env.getUrl(Urls.api_notification_get);
		url += this.env.createUrlParam(data);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }
  
	changeStatusNotification(formData: any){
    let url = this.env.getUrl(Urls.api_notification_changestatus);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

	getUnreadCount(formData: any){
    let url = this.env.getUrl(Urls.api_notification_getunreadcount);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }
}