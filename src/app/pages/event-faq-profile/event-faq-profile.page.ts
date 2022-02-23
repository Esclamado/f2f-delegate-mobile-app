import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { EventFaqService } from 'src/app/services/event-faq.service';
import { EnvService } from 'src/app/lib/env.service';

@Component({
  selector: 'app-event-faq-profile',
  templateUrl: './event-faq-profile.page.html',
  styleUrls: ['./event-faq-profile.page.scss'],
})
export class EventFaqProfilePage implements OnInit {

  public id: any = 0;
  public event_id: any = 0;
  public delegate: any = null;
  faq = null;
  vote_undo: boolean = false;
  event: any = null;

  constructor(
    public eventFaq: EventFaqService,
    protected _route: ActivatedRoute,
    public router: Router,
    public env: EnvService
  ) { }

  ngOnInit() {
    this._route.paramMap.subscribe( url_param =>{
      this.id = url_param.get('faq_id');
      this.event_id = url_param.get('event_id');
      
      this.env.storage.get('delegate').then((d) => {
        this.env.storage.get('event').then((event) => {
          if(event){
            this.event = event;
          }
          if(d){
            this.delegate = d;
            this.getFaq();
          }
        });
      });
    });
  }

  doRefresh(e) {
    this.faq = null;
    this.getFaq(e);
  }
  
  getFaq(refresher?){
    let params = {
      id: this.id,
      event_id: this.event_id,
      delegate_id: this.delegate.id,
    }

    this.eventFaq.getFaq(params)
      .subscribe(r => {
        if(r.error == 0){
          this.faq = r.data;
          if(r.data.vote){
            this.faq['vote_value'] = r.data.vote.vote;
          }
        } else {
          this.eventFaq.env.toast(r.message)
        }

        if(refresher){
          refresher.target.complete();
        }
    });
  }

  faqVote(vote){

    this.vote_undo = false;

    let formData = {
      faq_id: this.id,
      event_id: this.event_id,
      delegate_id: this.delegate.id,
      vote: vote
    };
    
    this.eventFaq.saveFaqVote(formData)
    .subscribe(r => {
      console.log(r);
      if(r.error == 0){
        this.faq['vote'] = true;
        this.faq['vote_value'] = vote;
      }
    });
  }

  myBackButton(){
    this.env.storage.get('selectedFaqId').then((d) => {
      if(d){
        this.router.navigate(['event-faq/'+this.event_id]);
        this.env.storage.remove('selectedFaqId');
      }else{
        this.env.location.back();
      }
    });
  }

  voteUndo(){
    this.vote_undo = true;
    if(this.faq){
      this.faq['vote'] = false;
    }
  }

}
