import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { Urls } from 'src/app/lib/urls';

// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
// import { File } from '@ionic-native/file';

@Injectable({
  providedIn: 'root',
})
export class DelegateService {

  constructor(
    private env: EnvService,
    // public transfer: FileTransfer, 
    // public file: File
  ) { }

  login(email, password){
    let url = this.env.getUrl(Urls.mapi_login_index);

    let formData = new FormData();

    formData.append('email', email);
    formData.append('password', password);

    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

  logout(){
    let url = this.env.getUrl(Urls.mapi_logout);
    let formData = new FormData();
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

  savePlatform(formData){
    let url = this.env.getUrl(Urls.mapi_platform_save);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }
  
  changePass(formData){
    let url = this.env.getUrl(Urls.mapi_delegate_changepass);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

  changePush(formData){
    let url = this.env.getUrl(Urls.mapi_delegate_changepushnotif);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }
  
  checkPassword (formData){
    let url = this.env.getUrl(Urls.mapi_delegate_checkpass);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

  saveDelegate(formData: any, profilePhoto: any = null, businessCard: any = null){
    let url = this.env.getUrl(Urls.api_delegates_save);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

	getDelegate(data: any){
		let url = this.env.getUrl(Urls.api_delegates_get);
		url += this.env.createUrlParam(data);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  getMeetingSchedule(data: any){
		let url = this.env.getUrl(Urls.mapi_delegate_meetingschedule);
		url += this.env.createUrlParam(data);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  findDelegate(param){
    let url = this.env.getUrl(Urls.mapi_delegate_locator);
    url += this.env.createUrlParam(param);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  forgotPassword(formData){
    let url = this.env.getUrl(Urls.mapi_delegate_forgotpass);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

  /**
   * get delegate's same company meeting count 
   * regardless on the event
   * and delegate
   * @param param 
   */
  getSameCompanyMeeting(param){
    let url = this.env.getUrl(Urls.mapi_meetingsched_samecompany);
    url += this.env.createUrlParam(param);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  // getDelegateTimezone(){
  //   //console.log("get delegate timezone reached");

  //   let timezoneFull: any = null;
  //   let timezoneOffset: any = null;
  //   let timezoneName: any = null;

  //   this.env.storage.get('delegate').then((res) =>{

      

  //     console.log("response from services", res.timezone);
  //     // full timezone
  //     timezoneFull = res.timezone;
  //     // timezone offset
  //     timezoneOffset = timezoneFull.split('(');
  //     timezoneOffset = timezoneOffset[1].slice(4, -1);
  //     // timezone name
  //     timezoneName = timezoneFull.split(":");
  //     timezoneName = timezoneName[0].trim();

   
  //   });
    
  //   let delegateTimezone = {
  //     'timezoneFull': timezoneFull,
  //     'timezoneOffset': timezoneOffset,
  //     'timezoneName': timezoneName
  //   };

  //   setTimeout(() => {
  //     return delegateTimezone;
  //   }, 1000) 
  // }
}
