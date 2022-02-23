import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DelegateService } from 'src/app/services/delegate.service';
import { ModalController, LoadingController } from '@ionic/angular';

import { PromptModalPage } from 'src/app/modalpage/prompt-modal/prompt-modal.page';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  email: any = '';
  invalidEmail: boolean = false;
  isValidClass: any = '';

  public formGroup: FormGroup;

  constructor(
    private env: EnvService,
    public formBuilder: FormBuilder,
    private delegate: DelegateService,
    public modalCtrl: ModalController,
    public loadingController: LoadingController,
  ) {

    let emailRe = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.formGroup = formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(emailRe)]],
    });

  }

  ngOnInit() {
    this.env.checkDeviceToken();
    this.env.exchangeToken();
  }

  get f() { 
    return this.formGroup.controls; 
  }

  validateEmail(){
    let controls = this.formGroup.controls;
    if(controls.email.errors){
      this.isValidClass = 'invalid';
      this.invalidEmail = true;
    }
  }

  setEmail(e){
    let controls = this.formGroup.controls;
    this.formGroup.controls.email.setValue(e.target.value);
    this.isValidClass = '';
    if(!controls.email.errors){
      this.isValidClass = 'valid';
    } else {
      this.isValidClass = 'invalid';
    }
  }

  async resetPassword(){
    let controls = this.formGroup.controls;

    this.formGroup.controls.email.setValue(this.email);
    let errorE = this.formGroup.controls.email.errors;

    if(errorE){
      this.isValidClass = 'invalid';
      this.invalidEmail = true;
    } else {
      this.isValidClass = 'valid';
      this.invalidEmail = false;
    }

    if(!controls.email.errors){
      let loading = await this.loadingController.create({
        message: 'Sending email...'
      });
      await loading.present();

      this.env.checkDeviceToken().then(f => {
        this.env.exchangeToken().then(f => {
          this.delegate.forgotPassword({email: this.email})
            .subscribe(data => {
              loading.dismiss();
              if(data.error == 0){
                this.presentSuccessModal();
              } else {
                this.env.toast(data.message);
              }
            });
        }); 
      }); 
    }
  }

  async presentSuccessModal() {
    const modal = await this.modalCtrl.create({
      component: PromptModalPage,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        img_src: '/assets/icon/send-email.png',
        title: 'Reset link successfully sent',
        msg: 'We sent a secure link to your email to reset your password.', 
        btn_txt: 'Okay, thanks!',
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    this.env.redirect('/login');
  }

}
