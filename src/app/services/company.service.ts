import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { Urls } from 'src/app/lib/urls';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(
    private env: EnvService,
  ) { }

  getCompanyById(id, wdelegate='no'){
    let url = this.env.getUrl(Urls.api_company_get);
    url += '?withdelegate='+wdelegate+'&id='+id;
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  save(data: any){
  	let httpOptions = this.env.getHttpOptions();
    let url = this.env.getUrl(Urls.api_company_save);
    return this.env.http.post<any>(url, data, httpOptions);
  }
}
