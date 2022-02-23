import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { Urls } from 'src/app/lib/urls';

@Injectable({
  providedIn: 'root',
})
export class EventFeedbackService {

  constructor(
    public env: EnvService
  ) { }

  save(formData){
    let url = this.env.getUrl(Urls.api_feedback_save);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }
}
