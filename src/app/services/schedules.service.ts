import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { Urls } from 'src/app/lib/urls';
import { TimezoneService } from './timezone.service';

@Injectable({
  providedIn: 'root'
})
export class SchedulesService {

  constructor(
    public env: EnvService,
    public timezoneService: TimezoneService
  ) { }

  getSchedules(event_id, includepast: any = null, searchSrting: any = null){
    let url = this.env.getUrl(Urls.mapi_event_schedule);
    url += '?event_id=' + event_id;
    if(includepast == 'no'){
      url += '&includepast=no';
    }
    if(searchSrting) {
      url += '&search=' + searchSrting;
    }
    url += '&delegate_timezone=' + this.timezoneService.delegateTimezoneName;
    url += '&event_timezone=' + this.timezoneService.eventTimezoneName;
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }


  getSchedulesVirtual(event_id, includepast: any = null, searchSrting: any = null){
    let url = this.env.getUrl(Urls.mapi_event_schedulevirtual);
    url += '?event_id=' + event_id;
    if(includepast == 'no'){
      url += '&includepast=no';
    }
    if(searchSrting) {
      url += '&search=' + searchSrting;
    }
    url += '&delegate_timezone=' + this.timezoneService.delegateTimezoneName;
    url += '&event_timezone=' + this.timezoneService.eventTimezoneName;
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }


  setStatus(formData){
    let url = this.env.getUrl(Urls.mapi_timeslot_status);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

  getAvailableDelegate(params){
    let url = this.env.getUrl(Urls.api_meetingschedule_availablebytimeslot);
    url += this.env.createUrlParam(params);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  /**
   * make an API call for all scheduled delegates
   */
  getScheduledDelage(params){
    let url = this.env.getUrl(Urls.mapi_event_scheduleddelegate);
    url += this.env.createUrlParam(params);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }
  
  /**
   * get all delegates, but the current logged in delegate
   * @param params 
   */
  getAllDelegate (params) {
    let url = this.env.getUrl(Urls.mapi_event_delegates);
    url += this.env.createUrlParam(params);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  scheduleMeeting(formData){
    let url = this.env.getUrl(Urls.api_meetingschedule_set);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }
  virtualMeeting(formData){
    let url =  this.env.getUrl(Urls.api_virtualmeeting_set);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }
  /**
   * api request for the available timeslot of a particular delegate
   * @param params object date, edid, event_id
   */
  getAvailableTimeSlots(params) {
    let url = this.env.getUrl(Urls.mapi_delegate_availabletimeslot);
    url += this.env.createUrlParam(params);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  /**
   * make an api call for meeting request
   * @param event_id 
   * @param type received || sent -- default is received
   */
  getMeetingRequest(event_id, type: string = 'received', is_virtual: boolean = false){
    let url = this.env.getUrl(Urls.mapi_delegate_meetingrequest);
    url += '?event_id='+event_id+'&type='+type;
    if(is_virtual){
      url += '&is_virtual=true';
    }
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }
  
  /**
   * API call for meeting request for specific timeslot
   * @param params timeslot_id, type, edid, limit, page
   */
  getMeetingRequestList(params){
    let url = this.env.getUrl(Urls.mapi_delegate_meetingrequestlist);
    url += this.env.createUrlParam(params);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  /**
   * make an API call to accept or decline the meeting request
   * @param formData 
   */
  requestAction(formData){
    let url = this.env.getUrl(Urls.mapi_delegate_meetingrequestaction);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

  /**
   * make an API call to request for cancellation
   * of meeting
   * @param formData
   */
  makeCancelationRequest(formData){
    let url = this.env.getUrl(Urls.mapi_delegate_requestcancelmeeting);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

  // for regrouping of timeslot by date based on timezone
  // regroupSchedule(schedules, delegateTimezone){

  //   let newSchedDays = schedules;

  //   // fetch the first day
  //   let firstDay = schedules[0].schedules[0].data.date + " " + schedules[0].schedules[0].data.start_time;
  //   let firstDayDate = new Date(firstDay);
  //   let firstDayDay = firstDayDate.getDate();

  //   // convert the first day based on timezone
  //   let firstDayConverted = new Date(firstDay).toLocaleString('en-US', {timeZone: delegateTimezone});
  //   let newfirstDayConverted = new Date(firstDayConverted);
  //   let firstDayConvertedDay = newfirstDayConverted.getDate();
  //   let firstMonth = newfirstDayConverted.getMonth() + 1 < 10 ? '0' + (newfirstDayConverted.getMonth() + 1): newfirstDayConverted.getMonth() + 1;
  //   let firstDate = newfirstDayConverted.getDate() < 10 ? '0' + newfirstDayConverted.getDate() : newfirstDayConverted.getDate();

  //   // fetch the last day
  //   let lastDay = schedules[schedules.length-1].schedules[schedules[schedules.length-1].schedules.length-1].data.date + " " + schedules[schedules.length-1].schedules[schedules[schedules.length-1].schedules.length-1].data.start_time;
  //   let lastDayDate = new Date(lastDay);
  //   let lastDayDay = lastDayDate.getDate();

  //   // convert lastday based on timezone
  //   let lastDayConverted = new Date(lastDay).toLocaleString('en-US', {timeZone: delegateTimezone});
  //   let newlastDayConverted = new Date(lastDayConverted);
  //   let lastDayConvertedDay = newlastDayConverted.getDate();
  //   let lastMonth = newlastDayConverted.getMonth() + 1 < 10 ? '0' + (newlastDayConverted.getMonth() + 1): newlastDayConverted.getMonth() + 1;
  //   let lastDate = newfirstDayConverted.getDate() < 10 ? '0' + newfirstDayConverted.getDate() : newfirstDayConverted.getDate();

  //   console.log('this is the first day', firstDayDay);
  //   console.log('this is the first day converted', firstDayConvertedDay);
  //   console.log('this is the last day', lastDayDay);
  //   console.log('this is the last day converted', lastDayConvertedDay);

  //   // add first day
  //   if(firstDayDay !== firstDayConvertedDay){
  //     let variant = {
  //       currentTime: schedules[0].currentTime,
  //       date: newfirstDayConverted.getFullYear() + "-" + firstMonth + "-" + firstDate,
  //       event_current_date: schedules[0].event_current_date,
  //       event_current_time: schedules[0].event_current_time,
  //       filter_date: schedules[0].filter_date,
  //       // filter_dateV: this.formatDateTime(firstDay),
  //       formatted: schedules[0].formatted,
  //       milisec: schedules[0].milisec,
  //     };
  //     newSchedDays.unshift(variant);
  //     console.log(newSchedDays);
  //   }

  //   // add last day
  //   if(lastDayDay !== lastDayConvertedDay){
  //     let variant = {
  //       currentTime: schedules[schedules.length-1].currentTime,
  //       date: newlastDayConverted.getFullYear() + "-" + lastMonth + "-" + lastDate,
  //       event_current_date: schedules[schedules.length-1].event_current_date,
  //       event_current_time: schedules[schedules.length-1].event_current_time,
  //       filter_date: schedules[schedules.length-1].filter_date,
  //       // filter_dateV: this.formatDateTime(lastDay),
  //       formatted: schedules[schedules.length-1].formatted,
  //       milisec: schedules[schedules.length-1].milisec,
        
  //     };
  //     newSchedDays.push(variant);
  //     console.log(newSchedDays);
  //   }

  //   //get all timeslots
  //   let timeslots = [];
  //   schedules.forEach(days => {
  //     if(days.schedules){
  //       days.schedules.forEach(time => {
  //         timeslots.push(time);          
  //       });
  //     }      
  //   });

  //   newSchedDays.forEach(days => {
  //     days.schedules = 'undefined';
  //   });

  //   //distribute each timeslots to their new date
  //   timeslots.forEach(time => {

  //     //convert the date
  //     let dateTime = new Date(time.data.date + " " + time.data.start_time).toLocaleString('en-US', {timeZone: delegateTimezone});
  //     let dateTimeConverted = new Date(dateTime);
  //     let month = dateTimeConverted.getMonth() + 1 < 10 ? '0' + (dateTimeConverted.getMonth() + 1) : dateTimeConverted.getMonth() + 1;
  //     let day = dateTimeConverted.getDate() < 10 ? '0' + dateTimeConverted.getDate() : dateTimeConverted.getDate();
  //     let dateString = dateTimeConverted.getFullYear() + "-" + month + "-" + day;

  //     newSchedDays.forEach(days => { 

  //       if(dateString == days.date){
  //         if(days.schedules && days.schedules !== 'undefined'){
  //           days.schedules.push(time);
  //         }else{
  //           days.schedules = [time];
  //         }

          
  //       }
  //       //console.log('time difference', dateString + ' ' + days.date);
        
  //     });
  //   });
    
  //   //console.log('these are the fetched timeslots', timeslots);
  //   console.log('this is the final schedule', newSchedDays);
  //   return newSchedDays;
  // }

  regroupSchedule(schedules, delegateTimezone){
    let schedArray = []
    
    //get days
    schedules.forEach(days => {
      days.schedules.forEach(time => {
        let originalDate = time.data.date + " " + time.data.start_time;
        let convertedDate = this.convertByTimezone(originalDate, delegateTimezone);
        let variant = {
          currentTime: days.currentTime,
          date: convertedDate,
          event_current_date: days.event_current_date,
          event_current_time: days.event_current_time,
          filter_date: days.filter_date,
          // filter_dateV: this.formatDateTime(lastDay),
          formatted: days.formatted,
          milisec: days.milisec,          
        };
        
        //console.log(originalDate);
        if(schedArray){
          let counter = 0;
          schedArray.forEach((data) => {
            if(data.date == convertedDate){
              counter++;
            }
          });

          if(!counter){
            schedArray.push(variant);
          }
        }else{
          schedArray.push(variant);
        }
      });      
    });

    //get timeslots
    let timeSlots = []
    schedules.forEach(days => {
      days.schedules.forEach(time => {
        timeSlots.push(time);
      });
    });

    //distribute timeslots
    timeSlots.forEach((time) => {
      let dateString = time.data.date + ' ' + time.data.start_time;
      let convertedDate = this.convertByTimezone(dateString, delegateTimezone);
      let schedulesToAdd = [];
      schedArray.forEach((days) => {
        if(convertedDate == days.date){
          if(days.schedules && days.schedules !== 'undefined'){
            days.schedules.push(time);
          }else{
            days.schedules = [time];
          }          
        }        
      });
    });

    //console.log(timeSlots);

    return schedArray;   
  }

  convertByTimezone(dateString, delegateTimezone){
    let convertDate = new Date(dateString).toLocaleString('en-US', {timeZone: delegateTimezone});  
    let convertedDate = new Date(convertDate);


    let year = convertedDate.getFullYear();
    let mon = convertedDate.getMonth() + 1 < 10 ? '0' + (convertedDate.getMonth() + 1): convertedDate.getMonth() + 1;
    let day = convertedDate.getDate() < 10 ? '0' + convertedDate.getDate() : convertedDate.getDate();

    let convertedDateString = year + '-' + mon + '-' + day;

    return convertedDateString;
  }
}
