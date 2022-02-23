import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { SponsorService } from 'src/app/services/sponsor.service';
import { SocialMediaPage } from 'src/app/modalpage/social-media/social-media.page';

@Component({
  selector: 'app-sponsor-profile-enhance',
  templateUrl: './sponsor-profile-enhance.page.html',
  styleUrls: ['./sponsor-profile-enhance.page.scss'],
})
export class SponsorProfileEnhancePage implements OnInit {

  sponsor : any = null;
  
  constructor(

    private env: EnvService,
    private route: ActivatedRoute,
    private router: Router,
    private modalCtrl: ModalController,
    private sponsorService: SponsorService
  ) {

   }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params && params.sponsor) {
        this.sponsor = JSON.parse(params.sponsor);
        console.log(this.sponsor);
      }
    });
  }

  doRefresh(e) {
    let thisGetForm = {
      id: this.sponsor.id,
      event_id: this.sponsor.event_id,
    };
  
    this.sponsorService.getSponsor(thisGetForm)
    .subscribe(d => {
      if(d.error == 0){
        console.log(d);
        this.sponsor = d.data;
      }
      e.target.complete();
    });
  }

  myBackButton(){
    this.env.location.back();
  }

  async presentSocialModal(name, style, icon = null) {
    const modal = await this.modalCtrl.create({
      component: SocialMediaPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        'icon': icon,
        'name': name,
        'class': style,
        'value': this.sponsor.social_media_links[name.toLowerCase()],
        'viewonly': true,
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    if(data){
      // storing of social media to array
      this.sponsor.social_media_links[name.toLowerCase()] = data.socialMedia;
    }
  }
}
