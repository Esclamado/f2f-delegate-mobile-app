import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { EnvService } from 'src/app/lib/env.service';
import { EventFaqService } from 'src/app/services/event-faq.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-event-faq',
  templateUrl: './event-faq.page.html',
  styleUrls: ['./event-faq.page.scss'],
})
export class EventFaqPage implements OnInit {

  onStopTyping = new Subject<string>();

  public event_id: any = 0;
  faq_category: any = null;
  selectedCategoryIndex = 0;
  selectedCategory: any = null;

  limit: any = 5;
  current_page: any = 1;
  total_page: any = 1;
  keyword: any = '';
  faqList: any = null;
  total_faq: any = null;
  moreFaq: boolean = true;
  faq_infiniteScroll: any;

  skeleton_loader: any = [
    { id: '1'},
    { id: '2'},
    { id: '3'},
    { id: '4'},
    { id: '5'},
  ]; 

  constructor(
    public eventFaq: EventFaqService,
    protected _route: ActivatedRoute,
    public router: Router,
    public env: EnvService
  ) {
    this.onStopTyping.pipe(debounceTime(400), distinctUntilChanged())
		.subscribe(value => {
      this.startSearch(value);
    });

    this.eventFaq.env.storage.remove('selectedFaqId');
    this.eventFaq.env.storage.remove('selectedCategoryIndex');
    this.eventFaq.env.storage.remove('selectedCategory');
  }

  ngOnInit() {
    this._route.paramMap.subscribe( url_param =>{
      this.event_id = url_param.get('event_id');

      this.env.storage.get('selectedCategory').then((d) => {
        if(d){
          this.selectedCategory = d; 
          this.env.storage.get('selectedCategoryIndex').then((d) => {
            if(d){
              this.selectedCategoryIndex = d;
            }
          });
        }else{
          this.getEventFaqCategory();
        }
      });
    });
  }

  /**
   * start search for specific selected tab
   */
  startSearch(searchString){
    this.faqList = null;
    this.total_faq = null;
    this.current_page = 1;
    this.total_page = 1;
    this.keyword = searchString;
    this.getFaqList();
  }

  getEventFaqCategory(refresher?, infiniteScroll?){
    let params = {
      event_id: this.event_id
    }

    this.eventFaq.getFaqCategory(params)
    .subscribe(r => {
      if(r.error == 0){
        if(r.data){
          this.faq_category = r.data.datas;
          this.selectedCategory = this.faq_category[0].id;
          this.getFaqList(refresher, infiniteScroll);
        }
      } 
    });
  }

  selectFaq(category, idx){
    this.selectedCategoryIndex = idx;
    this.selectedCategory = category.id; 

    this.eventFaq.env.storage.set('selectedCategoryIndex', idx);
    this.eventFaq.env.storage.set('selectedCategory', category.id);

    this.current_page = 1;
    this.total_page = 1;
    this.faqList = null;
    this.total_faq = null;
    this.moreFaq = true;
    this.getFaqList();
  }

  doRefresh(e) {
      
    this.faq_category = null;
    this.selectedCategoryIndex = 0;
    this.selectedCategory= null;
    this.current_page = 1;
    this.total_page = 1;
    this.keyword = '';
    this.faqList = null;
    this.total_faq = null;

    this.getEventFaqCategory(e);
  }

  getFaqList(refresher?, infiniteScroll?){
    let params = {
      event_id: this.event_id,
      keyword: this.keyword,
      filter_option: this.selectedCategory,
      limit: this.limit,
      page: this.current_page
    }

    this.eventFaq.getFaq(params)
      .subscribe(r => {
        if(r.error == 0){
          console.log('rhan',r);
          this.current_page = r.data.current_page;
          this.total_faq = r.data.total_count;
          this.total_page = r.data.total_page;

          if(!infiniteScroll) {
            this.faqList = []; 
          }

          if(r['data']['datas'].length > 0){
            r['data']['datas'].forEach((cat, idx) => {
              this.faqList.push(cat);
            });
          }

          if(infiniteScroll){
            this.faq_infiniteScroll.target.complete();
          }
        } else {
          this.eventFaq.env.toast(r.message)
        }

        if(refresher){
          refresher.target.complete();
        }
    });
  }

  loadData(event){
    this.faq_infiniteScroll = event;
    this.current_page += 1;
    if(this.current_page <= this.total_page) {
      this.moreFaq = true;
      this.getFaqList(null, this.faq_infiniteScroll);
    } else {
      this.moreFaq = false;
    } 
  }

  myBackButton(){
    
    // this.env.storage.get('homeFaq').then((f) => {
    //   if(f){
    //     this.router.navigate(['/']);
    //   }else{
    //     this.env.storage.get('selectedFaqId').then((d) => {
    //       if(d){
    //         this.eventFaq.env.storage.remove('selectedFaqId');
    //         this.eventFaq.env.storage.remove('selectedCategoryIndex');
    //         this.eventFaq.env.storage.remove('selectedCategory');
    //         this.router.navigate(['/tabs/event-settings/'+this.event_id]);
    //       }else{
    //         this.env.location.back();
    //       }
    //     });
    //   }
    // });

    this.env.storage.get('faqLastPage').then((d) => {
      if(d){
        this.router.navigate([d]);
      }
    });
  }

  gotoFaqProfile(faq){
    this.eventFaq.env.storage.set('selectedFaqId', faq.id);
    this.router.navigate(['event-faq-profile/'+this.event_id+'/'+faq.id]);
  }
}
