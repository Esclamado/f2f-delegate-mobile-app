import { Component, Input, OnInit } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { ModalController } from '@ionic/angular';
import { PreferencesService } from 'src/app/services/preferences.service';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-custom-selectable-state',
  templateUrl: './custom-selectable-state.page.html',
  styleUrls: ['./custom-selectable-state.page.scss'],
})
export class CustomSelectableStatePage implements OnInit {

  onStopTyping = new Subject<string>();
  limit: any = 10;
  lists: any = null;
  current_page: any = 1;
  total_page: any = 1;
  keyword: any = '';
  total_lists: any = null;
  moreList: boolean = true;
  infiniteScroll: any;
  selectedArray :any = [];
  selectAll: boolean = false;
  selectLabel: string = 'Select all';

  @Input() country_id: any;
  @Input() selectedCountries: any;
  
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
    this.getStates();
  }

  myBackButton(){
    this.modalCtrl.dismiss();
  }

  getStates(){
    let url = this.prefService.getSetUrlParams('states', this.current_page, this.limit, '', 'name', 'asc');
    url += 'countryid=' + this.country_id;
    this.sendRequest(url, 'states');
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
    let url = this.prefService.getSetUrlParams('states', this.current_page, this.limit, this.keyword, 'name', 'asc');
    url += 'countryid=' + this.country_id;
    this.sendRequest(url, 'states');
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
            if(this.selectedCountries){
              data['data']['datas'].forEach((cat, idx) => {
                cat.checked = this.checkSelectedProvince(cat);
                this.lists.push(cat);
              });
            }else{
              data['data']['datas'].forEach((cat, idx) => {
                cat.checked = false;
                this.lists.push(cat);
              });
            }
          }

          if(infiniteScroll){
            this.infiniteScroll.target.complete();
          }

        }
      });
  }

  checkSelectedProvince(ctry){
    let counter = 0;
    this.selectedCountries.forEach((sc, id) => {
      if(sc.id == ctry.id){
        this.selectedArray.push(sc);
        counter++;
      }
    });

    if(counter){
      return true;
    }else{
      return false;
    }
  }

  loadData(event){
    this.infiniteScroll = event;
    this.current_page += 1;
    if(this.current_page <= this.total_page) {
      this.moreList = true;
      let url = this.prefService.getSetUrlParams('states', this.current_page, this.limit, '', 'name', 'asc');
      url += 'countryid=' + this.country_id;
      this.sendRequest(url, 'states', null, this.infiniteScroll);
    } else {
      this.moreList = false;
    } 
  }

  // checkAll(){
  //   if(this.selectAll){
  //     this.selectAll = false;
  //     this.selectLabel = 'Select all';
  //   }else{
  //     this.selectAll = true;
  //     this.selectLabel = 'Unselect all';
  //   }
  //   console.log(this.lists);

  //   this.lists.forEach((cat, idx) => {
  //     cat.checked = this.selectAll;
  //     this.selectList(cat);
  //   });
  // }
  
  selectList(data){
    setTimeout(f => {
      if (data.checked == true) {
        this.selectedArray.push(data);
      } else {
        let newArray = this.selectedArray.filter(function(el) {
          return el.id !== data.id;
        });
        this.selectedArray = newArray;
      }
    }, 100);
  }

  submitList(){
    if(this.selectedArray.length > 0){
      this.env.storage.get('delegate_filter_country').then((country) => {
        this.selectedArray.forEach((cat, idx) => {
          cat.country = country;
        });

        setTimeout(f => {
          let d = {
            data: this.selectedArray,
            country_id: this.country_id
          };

          console.log('d',d);
          this.modalCtrl.dismiss(d);
        });
      });
    }
  }

}
