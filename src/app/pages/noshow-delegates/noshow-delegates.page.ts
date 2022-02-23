import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { EnvService } from 'src/app/lib/env.service';

import { NoshowService } from 'src/app/services/noshow.service';

@Component({
  selector: 'app-noshow-delegates',
  templateUrl: './noshow-delegates.page.html',
  styleUrls: ['./noshow-delegates.page.scss'],
})
export class NoshowDelegatesPage implements OnInit {

	selectedtab = 'top_noshow';
  protected topNoshowDelegates: any = null;
  protected event_id: any;
  protected dataIsLoaded = false;
  protected delegate_id: any = null;

  protected limit:number = 5;
  protected current_page:number = 1 ;
  protected total_page:number = 0;
  

  constructor(
    private noshowService: NoshowService,
    private _route: ActivatedRoute,
    public env: EnvService,
    private router: Router,
  ) { 
    
  }

  ngOnInit() {
    this._route.paramMap.subscribe( url_param =>{
      this.event_id = url_param.get('event_id');
      this.env.requireLogIn();
      this.getTopNoshowDelegate();
    });
  }

  myBackButton(){
    this.env.location.back();
  }

  selectTab(tab) {
    this.current_page = 1;
    this.selectedtab = tab;
    this.dataIsLoaded = false;

    if(tab == 'top_noshow'){
      this.delegate_id = null;
      this.getTopNoshowDelegate();
    }else{
      this.env.storage.get('delegate').then((d) => {
        if(d){
           this.delegate_id = d.id;
           this.getTopNoshowDelegate(); 
        }
      });
    }
  }

  getTopNoshowDelegate(infinite = null){
      if(!infinite) {
        this.topNoshowDelegates = []; 
      }
      let args = {
        event_id: this.event_id,
        delegate_id : this.delegate_id,
        limit: this.limit,
        page: this.current_page,
      };

      this.noshowService.getTopNoshowDelegate(args).subscribe(r => {
        this.current_page = r.current_page;
        this.total_page = r.total_page;
        // this.total_noshow_delegate = r.total_count;
        // console.log(this.current_page);
        // console.log(this.total_page);
        r.datas.forEach((cat, idx) => {
          this.topNoshowDelegates.push(cat);
        });

        if(infinite){
          infinite.target.complete();
        }

        this.dataIsLoaded = true;
      }); 
  }

  loadMoreData(e){
    this.current_page += 1;
    if(this.current_page <= this.total_page) {
      this.getTopNoshowDelegate(e);
    } else {
      e.target.disabled = true;
    }
  }

  gotoDelegateProfile(delegate_id){

    this.env.storage.get('delegate').then((d) => {
      if(d){
        console.log(d.id +'=='+ delegate_id);
        if(d.id == delegate_id){
          this.env.storage.remove('last_page_user_profile');
          this.env.storage.set('last_page_user_profile', '/');
          this.router.navigate(['/delegate-profile']);
        }else{
          this.router.navigate(['/delegate-profile/'+delegate_id+'/'+this.event_id]);
        }
      }
    });
  }

}
