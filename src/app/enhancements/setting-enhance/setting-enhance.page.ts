import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, AlertController } from '@ionic/angular';
import { EnvService } from 'src/app/lib/env.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DelegateService } from 'src/app/services/delegate.service';
import { ChangepasswordPage } from 'src/app/modalpage/changepassword/changepassword.page';

@Component({
  selector: 'app-setting-enhance',
  templateUrl: './setting-enhance.page.html',
  styleUrls: ['./setting-enhance.page.scss'],
})
export class SettingEnhancePage implements OnInit {

  title = 'about';
  event_id: any = null;
  delegate: any = null;
  push_notif_enabled: boolean = true;

  constructor(
    protected modalController: ModalController,
    protected env: EnvService,
    protected loadingController: LoadingController,
    protected alertController: AlertController,
    protected _route: ActivatedRoute,
    private router: Router,
    public delegateService: DelegateService
  ) { }

  ngOnInit() {
    this._route.queryParams.subscribe(params => {
      console.log('event_id',params);
      if (params && params.event_id) {
        this.event_id = params.event_id;
      }
    });

    this.env.storage.get('delegate').then((d) => {
      if(d){
        console.log(d);
        this.delegate = d;
        if(this.delegate.push_notif_enabled == 'no'){
          this.push_notif_enabled = false;
        }
      }
    });
  }

  pushChange(){
    console.log("Toggled: "+ this.push_notif_enabled); 
    this.savePushLoading();
  }

  async savePushLoading() {
    const loading = await this.loadingController.create({
      message: 'Saving..',
      duration: 2000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();

    let thisData = {
      delegate_id : this.delegate.id,
      push_notif_enabled : this.push_notif_enabled ? 'yes' : 'no'
    };

    this.delegateService.changePush(thisData)
    .subscribe(data => {
      if(data.error == 0){
        this.delegate.push_notif_enabled = data.data.push_notif_enabled;
        this.env.storage.set('delegate', this.delegate);
      }else{
        this.env.toast(data.message);
      }
    });
  }

  logout(){
    this.presentAlertConfirm(); 
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Log Out',
      message: 'Are you sure you want to <strong>log out</strong>?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Log Out',
          handler: () => {
            this.presentLoading();
            this.env.disconnectSocket();
          }
        }
      ]
    });

    await alert.present();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Signing out..'
    });
    await loading.present();

    this.env.removeAllStorage().then(data => {
      this.delegateService.logout()
      .subscribe(data => {
        loading.dismiss(); /* dismiss loading */
        if(data.error == 0){
          this.env.token = null;
        }
        this.router.navigate(['/login']);
        //this.env.requireLogIn();
      });
    });

    const { role, data } = await loading.onDidDismiss();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ChangepasswordPage,
      componentProps: { value: 'changepass' }
    });
    return await modal.present();
  }

  myBackButton(){
    this.env.storage.get('event_setting').then((d) => {
      if(d){
        this.router.navigate(['enhance-tabs/event-settings-enhance/'+this.event_id]);
      }else{
        this.router.navigate(['/']);
      }
    });
  }

  gotoUserProfile(){
    this.env.storage.remove('last_page_user_profile');
    this.env.storage.set('last_page_user_profile', '/settings');
    this.router.navigate(['/edit-user-profile']);
  }

}
