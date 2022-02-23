import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TabService {

  constructor() { }

  selectedtab: any = "";

  selectTab(e){
    this.selectedtab = e;
  }
}
