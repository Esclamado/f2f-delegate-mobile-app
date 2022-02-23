import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ActivatedRoute, Router } from '@angular/router';
import { EnvService } from 'src/app/lib/env.service';
import { DelegateService } from 'src/app/services/delegate.service';

@Component({
  selector: 'app-delegate-locator',
  templateUrl: './delegate-locator.page.html',
  styleUrls: ['./delegate-locator.page.scss'],
})
export class DelegateLocatorPage implements OnInit {

  onStopTyping = new Subject<string>();
  search : any = '';
  dataIsLoaded = false;

  protected limit:number = 5;
  protected current_page:number = 1 ;
  protected total_page:number = 0;
  protected delegateLocatorResult = null;
  protected event_id:any;
  public total_data_count:number = 0;
  protected delegate_id: any = null;

  constructor(
    public env: EnvService,
    protected _route: ActivatedRoute,
    protected delegateService : DelegateService,
  ) { }

  ngOnInit() {

    this._route.paramMap.subscribe( url_param =>{

      this.env.storage.get('delegate').then((d) => {
        if(d){
           this.delegate_id = d.id;
        }
      });

      this.event_id = url_param.get('event_id');
      this.env.requireLogIn();
    });

    this.onStopTyping.pipe(debounceTime(400), distinctUntilChanged()).subscribe(value => {
      this.search = value;
      this.dataIsLoaded = false;
      this.current_page = 1;
      this.findDelegate();
    });
  }

  myBackButton(){
    this.env.location.back();
  }

  findDelegate(infinite = null){
     
      if(!infinite) {
        this.delegateLocatorResult = [];
      }
      
      let args = {
        event_id: this.event_id,
        search_key : this.search,
        limit: this.limit,
        page: this.current_page,
        delegate_id : this.delegate_id,
      };

      if(this.search){
        this.delegateService.findDelegate(args).subscribe(r => {
          console.log(r.error)
          if(r.error == 0){
            this.current_page = r.data.current_page;
            this.total_page = r.data.total_page;
            this.total_data_count = r.data.total_count;

            r.data.datas.forEach((cat, idx) => {
              this.delegateLocatorResult.push(cat);
            });

            if(infinite){
              infinite.target.complete();
            }
          }

          this.dataIsLoaded = true;
        }); 
      }
      
  }

  loadMoreData(e){
    this.current_page += 1;
    if(this.current_page <= this.total_page) {
      this.findDelegate(e);
    } else {
      e.target.disabled = true;
    }
  }

}
