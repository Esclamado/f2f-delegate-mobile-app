import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { ModalController } from '@ionic/angular';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CustomSelectableStatePage } from 'src/app/modalpage/custom-selectable-state/custom-selectable-state.page';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-custom-selectable',
  templateUrl: './custom-selectable.page.html',
  styleUrls: ['./custom-selectable.page.scss'],
})
export class CustomSelectablePage implements OnInit {

  onStopTyping = new Subject<string>();
  limit: any = 10;
  lists: any = null;
  current_page: any = 1;
  total_page: any = 1;
  keyword: any = '';
  total_lists: any = null;
  moreList: boolean = true;
  infiniteScroll: any;

  constructor(
    public env: EnvService,
    public modalCtrl: ModalController,
    public prefService: PreferencesService,
  ) { 
    this.onStopTyping.pipe(debounceTime(400), distinctUntilChanged())
		.subscribe(value => {
      this.startSearch(value);
    });
  }

  ngOnInit() {
    this.getCountries();
  }

  myBackButton(){
    this.modalCtrl.dismiss();
  }

  getCountries(){
    let url = this.prefService.getSetUrlParams('countries', this.current_page, this.limit);
    this.sendRequest(url, 'countries');
  }

  /**
   * start search for specific selected tab
   */
  startSearch(searchString){
    this.lists = null;
    this.total_lists = null;
    this.current_page = 1;
    this.total_page = 1;
    this.keyword = searchString; 
    let url = this.prefService.getSetUrlParams('countries', this.current_page, this.limit, this.keyword);
    this.sendRequest(url, 'countries');
  }

  sendRequest(url: string, type: string, refresher?, infiniteScroll?){
    this.prefService.getData(url, type)
      .subscribe(data => {
        this.prefService.getHelper(data, type);
        if(data.error == 0){

          this.current_page = data.data.current_page;
          this.total_lists = data.data.total_count;
          this.total_page = data.data.total_page;

          if(!infiniteScroll) {
            this.lists = []; 
          }

          if(data['data']['datas'].length > 0){
            data['data']['datas'].forEach((cat, idx) => {
              this.lists.push(cat);
            });
          }

          if(infiniteScroll){
            this.infiniteScroll.target.complete();
          }

        }
      });
  }

  loadData(event){
    this.infiniteScroll = event;
    this.current_page += 1;
    if(this.current_page <= this.total_page) {
      this.moreList = true;
      let url = this.prefService.getSetUrlParams('countries', this.current_page, this.limit);
      this.sendRequest(url, 'countries', null, this.infiniteScroll);
    } else {
      this.moreList = false;
    } 
  }

  async selectProvince(country){
    this.env.storage.set('delegate_filter_country', country);
    const modal = await this.modalCtrl.create({
      component: CustomSelectableStatePage,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        country_id: country.id
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    if(data){

      let d = {
        data: data.data,
        country_id: data.country_id
      };

      setTimeout(f => {
        this.modalCtrl.dismiss(d);
      }, 300);
    }
  }

}
