import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { Urls } from 'src/app/lib/urls';

@Injectable({
  providedIn: 'root',
})
export class EventFaqService {

  constructor(
    public env: EnvService
  ) { }

	saveFaqVote(formData: any){
    let url = this.env.getUrl(Urls.api_faqs_savefaqvote);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

	getFaqCategory(data: any){
		let url = this.env.getUrl(Urls.api_faq_category_get);
		url += this.env.createUrlParam(data);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

	getFaq(data: any){
		let url = this.env.getUrl(Urls.api_faqs_get);
		url += this.env.createUrlParam(data);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }
}
