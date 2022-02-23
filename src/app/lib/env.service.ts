import { Injectable } from '@angular/core';
import { Jwt } from './Jwt';
import { cookie } from './cookie';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Urls } from './urls';
import { Router } from '@angular/router'
import { ToastController, Events, Platform, LoadingController } from '@ionic/angular';
import { ChatService } from './socket/chat.service';
import { Device } from '@ionic-native/device/ngx';
import { FCM } from '@ionic-native/fcm/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Location } from "@angular/common";
import { ClockService } from 'src/app/lib/clock.service';
import { Badge } from '@ionic-native/badge/ngx';
import { File } from '@ionic-native/file/ngx';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  private secure = true;
  
  public buttonIndex : any;

  public payload: any;
  
  // private url = 'http://panel.face2facescheduler.com';
  // private secureUrl = 'https://panel.face2facescheduler.com';

  private url = 'http://api.face2facescheduler.com';
  private secureUrl = 'https://api.face2facescheduler.com';

  // private url = 'http://testapi.face2facescheduler.com';
  // private secureUrl = 'https://testapi.face2facescheduler.com';  

  // private url = 'http://stagingapi.face2facescheduler.com';
  // private secureUrl = 'https://stagingapi.face2facescheduler.com';

  // public production_mode: boolean = false;
  // public devicetoken = 'cVxqju9gbkI:APA91bG366jmIjlrFlspNy4IeTSKirpOdIicShu_BpX-rQkXSWAf_nFZ8LCB_YRYfTIcbKbUlcku1D2zy2gpqr5LFWDVhkbAv9OusTADH4VfmeUhRwSkfMVzeY-L2HX5QSU3oEDXoeCG';
  // public deviceid = 'a81aff7f682351187khheq_rhanni';

  public production_mode: boolean = true;
  public devicetoken : any;
  public deviceid : any;

  public token: any = null;

  /* this is used on tabs msg badge */
  public unread_msg: any = {};
  
  private apikey = 'Jk7BfTC5bgGFVQXETPKjcMnrNVam56Q35cXY2yHP8GjaBJ5wbfQgjxp5SyXRhgNhbs922MZnv9qwyQ7mNuL3PWSHmzAJCcL2MENd';

  /* socket start */

  /* live */
  public socketPort: any = 3000; 

  /* panel */
  //public socketPort: any = 3001;

  /* testapi */
  //public socketPort: any = 3002;  

  public chatSocket: any;
  /* socket end */

  clockService: any = null;

  push_click_counter: any = 0;

  constructor(
    public http: HttpClient,
    public storage: Storage,
    private cookie: cookie,
    private router: Router,
    public toastController: ToastController,
    public device: Device,
    public fcm: FCM,
    public iab: InAppBrowser,
    public location: Location,
    public events: Events,
    public badge: Badge,
    public file: File,
    public platform: Platform,
    public loadingCtrl: LoadingController
  ) {
    this.initChatSocket();
    this.badge.clear();
  }

  disconnectSocket(){
    this.chatSocket.disconnect();
  }

  initChatSocket(){
    this.isLogedIn().then(data => {
      if(data){
        this.setSocket('chatSocket', ChatService, this.socketPort, {query:{user: this.payload.jti}});
      }
    });
  }

  setSocket(socketConatiner: any, socket:any, port:any, opt: any = null){
    let options = {
      url: 'https://face2facescheduler.com:'+port, 
      options: {}
    }
    if(opt){
      options.options = opt;
    }
    this[socketConatiner] = new socket(options);
  }

  getUrl( path: string, params: any = null):any{
    let url = '';
    if(this.secure == true){
        url += this.secureUrl;
    } else {
        url += this.url;
    }
    url += path;
    if(params){
      url += this.createUrlParam(params)
    }
    return url;
  }

  createUrlParam(p){
    let uriStr = '?';
    for (let key of Object.keys(p)) {
      if(p[key]){
        uriStr += key + '=' + p[key] + '&';
      }
    }
    return uriStr;
  }

  generateToken() {
    let token = this.getCookie('token');
    this.isLogedIn();
    if(!token.length || token == 'undefined'){
        return this.forceGenerateToken();
    } else {
        return token;
    }
  }

  /**
   * return new generated token
   * wihtout any checking if there was already a 
   * token or not
   */
  forceGenerateToken(){
    let tz = Jwt.getTimezone();
    let token = Jwt.setAlgo('HS256')
        .setClaim('token', 'exchange')
        .setClaim('tzoffset', tz.gmt)
        .setClaim('tzname', tz.name)
        .setIssuedAt()
        .setSecret(this.apikey)
        .getToken();
    return token;
  }

  getCookie(name: string):any{
    return this.cookie.getCookie(name);
  }

  deleteCookie():any{
    return new Promise(resolve => {
      //this.cookie.deleteCookie('token', '');
      this.cookie.setCookie('token', '', -1000, '/', '');
      resolve(true);
    });
  }

  getHttpOptions(token:any=null){
    if(token){
      this.token = token;
    }
    let httpOptions = {
        headers: new HttpHeaders({ 
            'Authorization': 'Bearer '+this.token,
            'Devicetoken': this.devicetoken,
            'Deviceid': this.getDeviceId(),
            'Platform': this.production_mode ? this.device.platform : 'Android',
        })
    };
    console.log(httpOptions);
    return httpOptions;
  }

  getHttpImageUpload(){
    let httpOptions = { 
        'Accept': 'application/json',
        'Authorization': 'Bearer '+this.token,
        'Devicetoken': this.devicetoken,
        'Deviceid': this.getDeviceId(),
        'Platform': this.production_mode ? this.device.platform : 'Android',
    };

    return httpOptions;
  }
  
  getPlatform(){
    return this.production_mode ? this.device.platform : 'android';
  }

  exchangeToken() {
    return new Promise(resolve => {
      let token = this.forceGenerateToken();
      //this.token = token;
      //console.log('force token', this.token);
      this.isLogedIn().then(data => {
        let httpOptions = this.getHttpOptions(token);
        let url = this.getUrl(Urls.get_token);
        let result = this.http.get<any>(url, httpOptions)
          .subscribe(data => {
            this.token = data.data.token;
            this.setToken(data.data.token)
            resolve(this.token);
          });
      });
    });
  }

  setToken(token: any, day: number = 365):any{
    return new Promise(resolve => {
      this.storage.set('token', token);
      resolve(true);
    });
  }

  isLogedIn(){
    return new Promise(resolve => {
      this.storage.get('token').then((token) => {
        //let token = this.getCookie('token');
        this.token = token;
        // if(token && token != 'undefined'){
        if(token){
            this.payload = Jwt.getPayload(token);
            if(typeof this.payload.jti === 'undefined') {
                resolve(false);
            } 
            else {
                resolve(true);
            }
        } else {
            resolve(false);
        }
      });
    });
  }

  requireLogIn():any {
    this.isLogedIn().then(data => {
      let payload = data;
      if(!payload){
        this.router.navigate(['/login']);
      }
    });

    /*let payload = this.isLogedIn();
    if(!payload){
      this.router.navigate(['/login']);
    }*/
  }

  requireNotLogIn():any {
    this.isLogedIn().then(data => {
      let payload = data;
      if(payload){
        this.router.navigate(['/']);
      }
    });

    /*let payload = this.isLogedIn();
    if(payload){
      this.router.navigate(['/']);
    }*/
  }

  redirect(path: string = '/') {
    this.router.navigate([path]);
  }

  async presentToastWithOptions(message, url:any=null, data:any=null) {
    const toast = await this.toastController.create({
      header: '1 new notification',
      message: message,
      position: 'top',
      cssClass: 'toastNotification',
      color: 'toastnotif',
      duration: 5000,
      buttons: [
        {
          text: 'View',
          handler: () => {
            console.log('Push Notification Clicked');
            if(data.push_action == 'message'){
              this.storage.set('toastClicked', 1);
              console.log('set toastClicked');
              this.events.publish('toast_chat_clicked', true, Date.now());
            }else{
              this.storage.set('toastClicked', 1);
              console.log('set toastClicked');
              this.events.publish('toast_notif_clicked', true, Date.now());
            }
          }
        }
      ]
    });
    toast.present();
  }

  async presentToastWobutton(message) {
    const toast = await this.toastController.create({
      header: '1 new notification',
      message: message,
      position: 'top',
      cssClass: 'toastNotification',
      color: 'toastnotif',
      duration: 8000,
    });
    toast.present();
  }
  
  async toast(msg:string = '', tcolor = 'toasterror', tclose = 'x', tcss = 'toastNotification', tposition = 'top', d:number = 3000, showCloseButton=true) {
    const toast = await this.toastController.create({
      message: msg,
      duration: d,
      showCloseButton: true,
      position: 'top',
      closeButtonText: tclose,
      animated:true,
      cssClass: tcss,
      color: tcolor

    });
    toast.present();
  }

  delegateStorageSet (data: any){
    return new Promise(resolve => {
      // Convert string to object
      data['pref_countries_ids'] = this.convertType(data['pref_countries_ids'], 'object');
      data['pref_network_ids'] = this.convertType(data['pref_network_ids'], 'object');
      data['pref_sector_ids'] = this.convertType(data['pref_sector_ids'], 'object');
      data['pref_services_ids'] = this.convertType(data['pref_services_ids'], 'object');
      data['pref_software_ids'] = this.convertType(data['pref_software_ids'], 'object');
      data['pref_specialization_ids'] = this.convertType(data['pref_specialization_ids'], 'object');
      this.storage.set('delegate', data);
      console.log(data);
      resolve(true);
    });
  }

  setDeviceToken(){
    return new Promise(resolve => {
      if(this.production_mode){
        this.fcm.getToken().then(token => {
          if(token){
            this.devicetoken = token;
            /* this.cookie.setCookie('Devicetoken', token, 365, '/', ''); */
            this.storage.set('Devicetoken', this.devicetoken);
          }
          resolve(token);
        });
      }else{
        /* this.cookie.setCookie('Devicetoken', this.devicetoken, 365, '/', ''); */
        this.storage.set('Devicetoken', this.devicetoken);
        resolve(this.devicetoken);
      }
    });
  }

  checkDeviceToken(){
    return new Promise(resolve => {
      this.storage.get('Devicetoken').then((devicetoken) => {
        if(devicetoken && devicetoken != ''){
          this.devicetoken = devicetoken;
          resolve(this.devicetoken);
        }else{
          try{
            this.setDeviceToken().then(data => {
              resolve(data);
            });
          }catch(error){
            console.log('error')
          }
        }
      });
    });
  }

  getDeviceId(){
    if(this.production_mode){
        this.deviceid = this.device.uuid;
    }

    return this.deviceid;
  }

  convertType(data, type){
    if(type == 'string'){
      if(typeof(data) == 'object'){
        return JSON.stringify(data);
      }else{
        return data;
      }
    }else if(type == 'object'){
      if(typeof(data) == 'string'){
        return JSON.parse(data);
      }else{
        return data;
      }
    }
  }

  /**
   * Returns a function, that, as long as it continues to be invoked, will not
   * be triggered. The function will be called after it stops being called for
   * N milliseconds. If `immediate` is passed, trigger the function on the
   * leading edge, instead of the trailing.
   * @param func 
   * @param wait 
   * @param immediate 
   */
  debounce(func, wait, immediate:any = false) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  inAppBrowser(url){
    this.iab.create(url, `_blank`);

    //const browser = this.iab.create(url);

    // browser.executeScript(...);

    // browser.insertCSS(...);
    // browser.on('loadstop').subscribe(event => {
    //   browser.insertCSS({ code: "body{color: red;" });
    // });

    // browser.close();
  }

  

  removeAllStorage(){
    return new Promise(resolve => {
      this.storage.keys().then(r => {
        for (var i = 0; r.length > i; i++) {
          this.storage.remove(r[i]);
        }
        resolve(true);
      });
    });
  }
  
  b64toBlob(b64Data, contentType='', sliceSize=512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  capitalizeText(text) {
    return text.replace(/\b\w/g , function(m){ return m.toUpperCase(); } );
  }

  getnowDate(event, type){
    this.clockService = new ClockService();
    this.clockService.setDateTime(event).startTime(); 

    let y = this.clockService.today.getFullYear();
    let m = this.clockService.checkTime(this.clockService.today.getMonth() + 1);
    let d = this.clockService.today.getDate();

    let hours;
    if(type == 'resched'){
      hours = this.clockService.checkTime(this.clockService.today.getHours() + 2);
    }else{
      hours = this.clockService.checkTime(this.clockService.today.getHours());
    }

    let min;
    if(type == 'cancel'){
      min = this.clockService.today.getMinutes() + 30;
      if(min > 60){
        console.log('bhours',hours);
        hours = parseInt(hours) + 1;
        console.log('ahours',hours);
        min = min - 60;
      }
    }else{
      min = this.clockService.today.getMinutes();
    }

    let s = this.clockService.today.getSeconds(); 
    min = this.clockService.checkTime(min);
    s = this.clockService.checkTime(s);
    d = this.clockService.checkTime(d);
    return y+'-'+m+'-'+d+' '+hours+':'+min+':'+s;
  }

  rmSpace(txt){
    return txt.replace(/ /g, '_');
  }
}
