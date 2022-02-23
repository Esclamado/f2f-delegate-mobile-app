import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { Urls } from 'src/app/lib/urls';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  public limit: number = 10;
  public prefs: any = {
    networks: [],
    services: [],
    states: [],
    specializations: [],
    countries: [],
    sectors: [],
    softwares: []
  }
  public prefsLoading = {
    networks: true,
    services: true,
    states: true,
    specializations: true,
    countries: true,
    sectors: true,
    softwares: true
  }
  public prefLink = {};
  public pagination = [];

  constructor(
    private env: EnvService,
  ) { }

  getData(params: string = '', prefType: string = '' ){
    let httpOptions = this.env.getHttpOptions();
    let url = this.env.getUrl(Urls.api_preferences_get) + params;
    return this.env.http.get<any>(url, httpOptions);
  }

  // this will set the url param based on selected preference
  // the values are saved into prefLink object
  // return string URI for api request
  getSetUrlParams(
    type: string, 
    page: number = 0, 
    limit: number = 0, 
    search: string = '',
    sort: string = '',
    order: string = '' 
  ){
    if(limit <= 0){
      limit = this.limit;
    }

    if(typeof this.prefLink[type] == 'undefined'){
      this.prefLink[type] = {
        page: page,
        pref: type,
        limit: limit,
        sort: sort,
        order: order
      }
    }
    else {
      this.prefLink[type].page = page;
      this.prefLink[type].limit = limit;
    }
    if(search.length > 0) {
      this.prefLink[type].search = search;
    } else {
      delete this.prefLink[type].search;
    }
    if(sort.length > 1){
      this.prefLink[type].sort = sort;
      this.prefLink[type].order = 'asc';
    }

    if(order === 'asc' || order === 'desc'){
      this.prefLink[type].order = order;
    }

    let p = this.prefLink[type];

    let uriStr = '?';
    for (let key of Object.keys(p)) {
      if(p[key]){
        uriStr += key + '=' + p[key] + '&';
      }
    }
    return uriStr;
  }
  
  // this will save the data into service model
  // this will tell angular either to render the data
  // or render empty state
  getHelper(data, prefType: string){
    if(data.error == 0){
      this.prefs[prefType] = data.data;
      this.prefsLoading[prefType] = false;
    }
  }
}
