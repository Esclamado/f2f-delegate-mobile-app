import { Component, OnInit } from '@angular/core';

import { AttributeService } from 'src/app/services/attribute.service';

import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cms',
  templateUrl: './cms.page.html',
  styleUrls: ['./cms.page.scss'],
})
export class CmsPage implements OnInit {

  title : any = '';
  content : any = '';

  constructor(
    protected attrService: AttributeService,
    private _route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this._route.paramMap.subscribe(params => {
      let key = params.get('key').toString();
      
      this.attrService.getCms(key)
      .subscribe(data => {
        console.log(data);
        if(data.error == 0){
          this.title = data.title;
          this.content = data.content;
        }
      });
    });
  }
}
