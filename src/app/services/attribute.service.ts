import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { Urls } from 'src/app/lib/urls';

@Injectable({
  providedIn: 'root'
})
export class AttributeService {

  constructor(
    private env: EnvService,
  ) { }

  getCms(key){
    let url = this.env.getUrl(Urls.api_cms_get);
    url += '?get='+key;
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  getLanguages(data: any){
    let url = this.env.getUrl(Urls.mapi_language_get);
		url += this.env.createUrlParam(data);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }
}
