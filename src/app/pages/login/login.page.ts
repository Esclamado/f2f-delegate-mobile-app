import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { EnvService } from 'src/app/lib/env.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DelegateService } from 'src/app/services/delegate.service';
import { ModalController, LoadingController } from '@ionic/angular';
import { ChangepasswordPage } from 'src/app/modalpage/changepassword/changepassword.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: any = '';
  password: any = '';
  
  isValidClass: any = '';
  isValidClasPass: any = '';
  invalidEmail: boolean = false;

  public formGroup: FormGroup;

  inputPassType = 'password';
  passwordOpenIcon = 'eye';

  loginLoader: any;

  constructor(
    private env: EnvService,
    public formBuilder: FormBuilder,
    public modalController: ModalController,
    private delegate: DelegateService,
    private platform: Platform,
    protected loadingController: LoadingController,

  ) {
    let emailRe = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.formGroup = formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(emailRe)]],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6) ])],
    });
    
    this.platform.backButton.subscribe(() => {
      navigator['app'].exitApp();
    });
  }

  ngOnInit() {
    // this.env.checkDeviceToken();
    // this.env.exchangeToken();
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

    let errorE = this.formGroup.controls.email.errors;
    if(errorE){
      this.isValidClass = 'invalid';
      this.invalidEmail = true;
    } else {
      this.isValidClass = 'valid';
      this.invalidEmail = false;
    }
  }

  setPass(e){
    let controls = this.formGroup.controls;
    this.formGroup.controls.password.setValue(e.target.value);
    this.isValidClass = '';
    // if(!controls.password.errors){
    //   this.isValidClasPass = 'valid';
    // } else {
    //   this.isValidClasPass = 'invalid';
    // }
  }

  async login(){

    this.loginLoader = await this.loadingController.create({
      duration: 1000
    });
    await this.loginLoader.present();

    this.env.checkDeviceToken().then(token => {
      console.log('token',token);
      if(token){

        this.formGroup.controls.email.setValue(this.email);
        this.formGroup.controls.password.setValue(this.password);

        let errorE = this.formGroup.controls.email.errors;
        let errorP = this.formGroup.controls.password.errors;

        if(errorP){
          this.isValidClasPass = 'invalid';
        } else if(errorE){
          this.isValidClass = 'invalid';
          this.invalidEmail = true;
        } else {
          this.isValidClasPass = 'valid';
          this.isValidClass = 'valid';
          this.invalidEmail = false;

          this.env.exchangeToken().then(f => {
            console.log('f',f);
            if(f){
              this.delegate.login(this.email, this.password)
                .subscribe(data => {
                  this.loginLoader.dismiss(); /* dismiss loading */
                  if(data.error == 0){
                    this.env.delegateStorageSet(data.data).then(res => {
                      this.env.setToken(data.token).then(res1 => {
                        this.env.initChatSocket();
                        if(data.data.last_page == '1'){
                          this.env.redirect('/changepassword');
                        }else if(data.data.last_page == '2'){
                          this.env.redirect('/edit-profile-info');
                        }else{
                          this.env.redirect('/');
                        }
                      });
                    });
                  } else {
                    this.env.toast(data.message);
                    this.isValidClasPass = 'invalid';
                    this.isValidClass = 'invalid';
                  }
              });
            }
          });
        }
      }
    });

    const { role, data } = await this.loginLoader.onDidDismiss();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ChangepasswordPage
    });
    return await modal.present();
  }

  openPassword (){
    if(this.inputPassType == 'password') {
      this.inputPassType = 'text';
      this.passwordOpenIcon = 'eye-slash';
    } else {
      this.inputPassType = 'password';
      this.passwordOpenIcon = 'eye';
    }
  }
}
