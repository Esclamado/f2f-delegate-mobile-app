import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ModalController, LoadingController} from '@ionic/angular';
import { EnvService } from 'src/app/lib/env.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DelegateService } from 'src/app/services/delegate.service';
import { PromptModalPage } from 'src/app/modalpage/prompt-modal/prompt-modal.page';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.page.html',
  styleUrls: ['./changepassword.page.scss'],
})
export class ChangepasswordPage implements OnInit {

  // @Input() value: string;  If from setting change password 

  isValidClassCurrentPass: any = '';
  currentpassword: any;

  isValidClassNewPass: boolean = false;
  newpassword: any;

  isValidClassNew: any = '';
  isValidClassConfirm: any = '';

  isValidClassConfirmNewPass: boolean = false;
  confirmnewpassword: any;
  invalidCurrentPass: boolean = false;
  checkPassword: boolean = false;

  inputPassType = 'password';
  passwordOpenIcon = 'eye';
  inputCurrentPassType = 'password';
  currentpasswordOpenIcon = 'eye';
  inputConfPassType = 'password';
  confpasswordOpenIcon = 'eye';

  isSubmit: boolean = false;
  isSubmitPass: boolean = false;
  notMatchPass = true;
  value = null;

  public formGroup: FormGroup;

  get f() { return this.formGroup.controls; }

  constructor(
    private env: EnvService,
    private _route: ActivatedRoute,
    public modalController: ModalController,
    public formBuilder: FormBuilder,
    private delegate: DelegateService,
    // private navParams: NavParams,
    protected loadingController: LoadingController,
  ) {
    this.formGroup = formBuilder.group({
      currentpassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      newpassword: ['', Validators.compose([Validators.required, Validators.minLength(6) ])],
      confirmnewpassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  ngOnInit() {
    this._route.paramMap.subscribe( url_param =>{
      this.value = url_param.get('value');
      console.log(this.value);
    });
    // console.log(this.navParams.get('value'));
  }

  skip(route=null){
    this.dismiss();
    if(route){
      this.env.redirect(route);
      if(!this.value){
        this.env.storage.get('delegate').then((val) => {
          val['last_page'] = 2;
          this.env.delegateStorageSet(val);
        });
      }
    }
  }

  dismiss() {
    if(!this.value){
      this.modalController.dismiss({
        'dismissed': true
      });
    }
  }

  setCurrentPass(e){
    let controls = this.formGroup.controls.currentpassword;
    controls.setValue(e.target.value);
    this.isSubmitPass = false;
    this.checkPassword = false;
    this.isSubmit = false;
    this.invalidCurrentPass = false;
    // if(!controls.errors){
    //   this.isValidClasCurrentPass = 'valid';
    // } else {
    //   this.isValidClasCurrentPass = 'invalid';
    // }
  }

  validatePasswords(e){
    let newpassword_controls = this.formGroup.controls.newpassword;
    let confirmnewpassword_controls = this.formGroup.controls.confirmnewpassword;

    console.log(newpassword_controls);
    console.log(confirmnewpassword_controls);

    if(newpassword_controls.errors ){
      this.isValidClassNewPass = true;
      this.isValidClassNew = 'invalid';
    }else{
      this.isValidClassNew = 'valid';
    }

    if(confirmnewpassword_controls.errors){
      this.isValidClassConfirmNewPass = true;
      this.isValidClassConfirm = 'invalid';
    }else{
      this.isValidClassConfirm = 'valid';
    }
    
    if(!newpassword_controls.errors && !confirmnewpassword_controls.errors){
      if(this.confirmnewpassword && this.newpassword){
        if(this.formGroup.value.confirmnewpassword) {
          //this.confirmnewpassword = e.target.value;
          this.validateConfirmPass();
        }
      }
    }else{
      this.isValidClassNew = 'invalid';
      this.isValidClassConfirm = 'invalid';
      this.notMatchPass = true;    
    }
  }
  // setConfirmPass(e){
  //   this.confirmnewpassword = e.target.value;
  //   this.validateConfirmPass();
  // }

  validateConfirmPass(){
    this.isSubmit = false;
    if(this.formGroup.value.newpassword == this.formGroup.value.confirmnewpassword){
      this.isValidClassNewPass = true;
      this.isValidClassConfirmNewPass = true;
      this.notMatchPass = false;    
      this.isValidClassNew = 'valid';
      this.isValidClassConfirm = 'valid';

    } else {
      this.isValidClassNewPass = false;
      this.isValidClassConfirmNewPass = false;
      this.notMatchPass = true;
      this.isValidClassNew = 'invalid';
      this.isValidClassConfirm = 'invalid';
    }
  }

  openCurrentPassword(){
    if(this.inputCurrentPassType == 'password') {
      this.inputCurrentPassType = 'text';
      this.currentpasswordOpenIcon = 'eye-slash';
    } else {
      this.inputCurrentPassType = 'password';
      this.currentpasswordOpenIcon = 'eye';
    }
  }

  openPassword(){
    if(this.inputPassType == 'password') {
      this.inputPassType = 'text';
      this.passwordOpenIcon = 'eye-slash';
    } else {
      this.inputPassType = 'password';
      this.passwordOpenIcon = 'eye';
    }
  }

  openConfPassword(){
    if(this.inputConfPassType == 'password') {
      this.inputConfPassType = 'text';
      this.confpasswordOpenIcon = 'eye-slash';
    } else {
      this.inputConfPassType = 'password';
      this.confpasswordOpenIcon = 'eye';
    }
  }

  changePass(){
    this.isSubmit = true;
    console.log(this.isSubmit);
    this.isSubmitPass = true;
    let np = this.formGroup.controls.newpassword;

    if(!this.formGroup.controls.newpassword.errors && !this.formGroup.controls.confirmnewpassword.errors){
      if(this.value){
        console.log('c');
        if(this.formGroup.value.currentpassword){
          console.log('d');
          this.delegate.checkPassword({password: this.formGroup.value.currentpassword})
          .subscribe(data => {
            console.log('e');
            this.checkPassword = true;
            if(data.error == 0){
              /* toDo open update profile modal */
              this.isValidClassCurrentPass = 'valid';
              this.invalidCurrentPass = false;
              if(!np.errors && this.formGroup.value.newpassword === this.formGroup.value.confirmnewpassword){
                this.validatePass();
              }
            }else{
              this.invalidCurrentPass = true;
              this.isValidClassCurrentPass = 'invalid';
            }
          });
        }
      }else{
        if(!np.errors && this.formGroup.value.newpassword === this.formGroup.value.confirmnewpassword){
          this.validatePass();
        }
      }
    }
  }

  async validatePass(){
    let formData = new FormData();

    let loading = await this.loadingController.create({
      message: 'Changing Password...'
    });
    await loading.present();

    this.env.storage.get('delegate').then((val) => {
      formData.append('id', val.id);
      formData.append('newpassword', this.formGroup.value.newpassword);
      formData.append('confirmnewpassword', this.formGroup.value.confirmnewpassword);
      formData.append('firstloginchangepass', 'yes'); 

      this.delegate.changePass(formData)
        .subscribe(data => {
          loading.dismiss(); /* dismiss loading */
          if(data.error == 0){
            /* toDo open update profile modal */
            this.dismiss();
            if(this.value){ /* If from setting change password */
              this.presentSuccessModal('/settings');
            }else{
              val['last_page'] = 2;
              this.env.delegateStorageSet(val);
              this.presentSuccessModal('/edit-profile-info');
            }
          }
        });
    });

    const { role, data } = await loading.onDidDismiss();

  }

  async presentSuccessModal(url) {
    const modal = await this.modalController.create({
      component: PromptModalPage,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        img_src: '/assets/icon/change-pass.png',
        title: 'Password successfully changed',
        msg: 'You have successfully changed your password. Dont forget to use this new password in your next login.', 
        btn_txt: 'Okay, Thanks!'
      }
    });

    modal.present();

    const { data } = await modal.onWillDismiss();
    this.env.redirect(url);
  }
}
