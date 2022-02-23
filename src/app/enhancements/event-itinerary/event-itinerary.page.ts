import { Component, OnInit, ViewChild } from '@angular/core';

import { ModalController, AlertController, LoadingController, Platform, Events} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvService } from 'src/app/lib/env.service';
import { ClockService } from 'src/app/lib/clock.service';
import { TimezoneService } from 'src/app/services/timezone.service';
import { Urls } from 'src/app/lib/urls';
import { GeneralService } from 'src/app/services/general.service';
import { FileOptionPage } from 'src/app/modalpage/file-option/file-option.page';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Downloader, DownloadRequest, NotificationVisibility } from '@ionic-native/downloader/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { IonContent } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';

import * as jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

@Component({
  selector: 'app-event-itinerary',
  templateUrl: './event-itinerary.page.html',
  styleUrls: ['./event-itinerary.page.scss'],
  providers: [DatePipe]
})
export class EventItineraryPage implements OnInit {

  @ViewChild(IonContent, { static: false }) content: IonContent;

  event : any = null;
  prev_page: any = null;
  delegate : any = null;
  user: any = null;
  event_delegate_id: any = null;
  clockService: any = null;
  monthName: any = '';
  selected_ms_date: any = null;
  nowDate: any = null;

  userTimezone: string = '';
  meetings_itinerary: any = null;
  meeting_itinerary: any = null;
  dataIsLoaded: boolean = false;

  filebase64data: any;
  protected autoTable_dim = 0;
  zoom_setting: any = null;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    public env: EnvService,
    public timezoneService: TimezoneService,
		private gen : GeneralService,
    public modalCtrl: ModalController,
    private datePipe: DatePipe,
    public platform: Platform,
    private fileOpener: FileOpener,
    public downloader: Downloader,
    public loadingCtrl: LoadingController,
    public clipboard: Clipboard,

  ) {
    this.clockService = new ClockService();
  }

  ngOnInit() {    
    this.env.requireLogIn();
    this.getZoomSetting();

    this.route.queryParams.subscribe(params => {
      if (params.event && params.prev_page) {
        this.event = JSON.parse(params.event); 
        console.log('phampii', this.event);
        this.prev_page = params.prev_page;
        this.setMSmonths();

        this.env.storage.get('delegate').then((d) => {
          this.delegate = d;
          let delegateTimezone = d.timezone;
          let delegateTimezoneName = delegateTimezone.split(':');
          this.userTimezone = delegateTimezoneName[0].trim();

          this.clockService = new ClockService();
          this.clockService.setTimezone(this.userTimezone).setDateTimeVirtual(this.event).startTimeVirtual();
            
          this.timezoneService.setEventTImezone(this.event.time_zone);
          let format = 'y-m-d';
          this.nowDate = this.getnowDate(format);
          console.log('nowDate', this.nowDate);
          if(this.nowDate){
            if(this.nowDate){
              let count = 0;
              this.event.days.forEach(day => {
                if(day.a_date_orig == this.nowDate){
                  this.selected_ms_date = this.nowDate;
                  count++;
                }
              });

              if(!count){
                this.selected_ms_date = this.event.days[0].a_date_orig;
              }
            }
          }

          this.getItinerarySchedule();
        });
      }
    });    
  }

  goBacktoHome() {
    if(this.prev_page){
      this.router.navigate([this.prev_page]);
    }else{
      this.router.navigate(['enhance-tabs/event-enhance/'+this.event.id]);
    }
  }

  doRefresh(e) {
    this.dataIsLoaded = false;  
    this.meetings_itinerary = null;
    setTimeout(() => {
      this.getItinerarySchedule();
      e.target.complete().then(x=> {
        setTimeout(() => {
          this.content.getScrollElement().then((el) => {
            el.style.transform = null;
          });
        },1000)
      })
    }, 500);
  }

  startPullRefresh(e){
    setTimeout(() => {
      this.content.getScrollElement().then((el) => {
        el.style.transform = null;
      });
    },1000)
  }

  /**
  * this will set the month to be displayed 
  * on meeting schedules
  */
  setMSmonths() {
    if (this.event) {
      let days = this.event.days;

      let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      let first = new Date(days[0].a_date_orig + " " + this.event.start_time);
      let last = new Date(days[days.length - 1].a_date_orig + " " + this.event.start_time);

      this.clockService = new ClockService();
      let first1 = new Date(days[0].a_date_orig + "T" + this.clockService.convertTo24Hrs(this.event.start_time) + ':00Z');
      let last1 = new Date(days[days.length - 1].a_date_orig + "T" + this.clockService.convertTo24Hrs(this.event.start_time) + ':00Z');

      let mon = '';
      if (first1.getMonth() == last1.getMonth()) {
        mon += months[first1.getMonth()];
      } else {
        mon += months[first1.getMonth()] + " - " + months[last1.getMonth()];
      }

      this.monthName = mon;
    }
  }  
  
  selectDay(day, index?) {
    this.selected_ms_date = day.a_date_orig;
    this.dataIsLoaded = false;  
    setTimeout(() => {
      this.dataIsLoaded = true;  
    }, 500);
  }

  getnowDate(format?) {
    let y = this.clockService.today.getFullYear();
    let m = this.clockService.checkTime(this.clockService.today.getMonth() + 1);
    let d = this.clockService.today.getDate();
    let hours = this.clockService.checkTime(this.clockService.today.getHours());
    let min = this.clockService.today.getMinutes();
    let s = this.clockService.today.getSeconds();
    min = this.clockService.checkTime(min);
    s = this.clockService.checkTime(s);
    d = this.clockService.checkTime(d);
    if(format){
      if(format == 'y-m-d'){
        return y + '-' + m + '-' + d;
      }
    }else{
      return y + '-' + m + '-' + d + 'T' + hours + ':' + min + ':' + s + 'Z';
    }
  }

  getItinerarySchedule(){
    this.dataIsLoaded = false;  
    let url = this.env.getUrl(Urls.api_delegate_meetingitinerary);
    let formData = {
      event_id: this.event.id,
      delegate_id: this.delegate.id
    };

    if(this.event.type == 2){
      formData['is_virtual'] = true;
    }

    this.gen.post(url, formData).subscribe(data=>{
      if(data.error == 0){
        this.event_delegate_id = data.event_delegate_id;
        if(data.data){
          this.dataIsLoaded = true;  
          data.data.forEach(res => {
            let temp_data = []; 
            if(res.data){
              res['meeting_date'] = this.datePipe.transform(res.date, 'MMM d, y');
              res.data.forEach((res1, key) => {

                if(res1.start_time_delegate){
                  res1['start_time_delegate'] = res1['start_time_delegate'].replace(" ", "T");
                }
                if(res1.end_time_delegate){
                  res1['end_time_delegate'] = res1['end_time_delegate'].replace(" ", "T");
                }
                let temp_arr = [];
                res1['meeting_time'] = this.datePipe.transform(res1.start_time_delegate, 'h:mm a') +' - '+this.datePipe.transform(res1.end_time_delegate, 'h:mm a');
                res1['other_delegate_fullname'] = this.event_delegate_id == res1.d1_id ? res1.d2_fullname : res1.d1_fullname;
                res1['other_delegate_company'] = this.event_delegate_id == res1.d1_id ? res1.d2_company_name : res1.d1_company_name;
                res1['other_delegate_jobtitle'] = this.event_delegate_id == res1.d1_id ? res1.d2_job_title : res1.d1_job_title;
                if(this.event.type == 1){
                  if(res1.table_type == 3){
                    res1['table'] = 'Table '+res1.table_table_no;
                  }else if(res1.table_type == 2){
                    res1['table'] = 'Booth '+res1.table_table_no;
                  }else if(res1.table_type == 1){
                    res1['table'] = 'VIP '+res1.table_table_no;
                  }
                }else{
                  res1['zoom_email_address'] = this.event_delegate_id == res1.d1_id ? res1.d2_social_media_links.zoom : res1.d1_social_media_links.zoom;
                  if(this.zoom_setting.status == '1'){
                    let url = this.env.getUrl(Urls.api_virtualconference_shortenurl);
                    if(this.delegate.email == res1.d1_email){
                      // res1['meeting_link'] = res1.zoom_meeting_link_1;
                      let type = "s"; //start
                      url += '?t=' + type;
                      url += '&c=' + res1.zoom_id;
                      res1['meeting_link'] = url;
                    }else{
                      //res1['meeting_link'] = res1.zoom_meeting_link_2;
                      let type = "j";
                      url += '?t=' + type;
                      url += '&c=' + res1.zoom_id;
                      res1['meeting_link'] = url;
                    }
                  }
                }
                temp_arr.push(this.datePipe.transform(res1.start_time_delegate, 'h:mm a') +' - '+this.datePipe.transform(res1.end_time_delegate, 'h:mm a'));
                temp_arr.push(this.event_delegate_id == res1.d1_id ? res1.d2_fullname : res1.d1_fullname);
                temp_arr.push(this.event_delegate_id == res1.d1_id ? res1.d2_company_name : res1.d1_company_name);
                temp_arr.push(this.event_delegate_id == res1.d1_id ? res1.d2_job_title : res1.d1_job_title);
                if(this.event.type == 1){
                  if(res1.table_type == 3){
                    temp_arr.push('Table '+res1.table_table_no);
                  }else if(res1.table_type == 2){
                    temp_arr.push('Booth '+res1.table_table_no);
                  }else if(res1.table_type == 1){
                    temp_arr.push('VIP '+res1.table_table_no);
                  }
                }else{
                  temp_arr.push(this.event_delegate_id == res1.d1_id ? res1.d2_social_media_links.zoom : res1.d1_social_media_links.zoom);
                  if(this.zoom_setting.status == '1'){
                    let url = this.env.getUrl(Urls.api_virtualconference_shortenurl);
                    if(this.delegate.email == res1.d1_email){
                      // res1['meeting_link'] = res1.zoom_meeting_link_1;
                      let type = "s"; //start
                      url += '?t=' + type;
                      url += '&c=' + res1.zoom_id;
                      temp_arr.push(url);
                    }else{
                      //res1['meeting_link'] = res1.zoom_meeting_link_2;
                      let type = "j";
                      url += '?t=' + type;
                      url += '&c=' + res1.zoom_id;
                      temp_arr.push(url);
                    }
                  }
                }

                temp_data.push(temp_arr);
              });
              res['meeting_data'] = temp_data;
            }
          });
          this.meetings_itinerary = data.data;
        }
      }
    });
  }

  ics_itinerary = [];
  async fileOptionModal(type) {
    const modal = await this.modalCtrl.create({
      component: FileOptionPage,
      cssClass:'my-custom-modal-css',
      componentProps: {
        type: type,
        // note: this.notes,
        // event_id: this.meeting.event_id
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    if(data){
      if(type == 'send'){
        if(data.pdf_file && data.ical_file){
          this.sendMultipleFile(this.meetings_itinerary);
        }else{
          if(data.pdf_file){
            this.sendPDF(this.meetings_itinerary);
          }
          if(data.ical_file){
            this.sendICS();
          }
        }
        this.env.toast('Your final itinerary has been sent. Please check your mail.', 'toastsuccess');
        
      }else{

        if(data.pdf_file){
          this.downloadPDF(this.meetings_itinerary);
        }
        if(data.ical_file){
          this.downloadICS();
        }
      }
    }
  }

  async sendICS(){
    const ics = require('ics')
    
    this.meetings_itinerary.forEach((meeting) => {
      if(meeting.data){
        meeting.data.forEach((data) => {
          if(data){
            let yr = parseInt(this.datePipe.transform(data.start_time_delegate, 'yyyy'));
            let mon = parseInt(this.datePipe.transform(data.start_time_delegate, 'M'));
            let date = parseInt(this.datePipe.transform(data.start_time_delegate, 'd'));
            let hr = parseInt(this.datePipe.transform(data.start_time_delegate, 'H'));
            let min = parseInt(this.datePipe.transform(data.start_time_delegate, 'm'));

            let e_yr = parseInt(this.datePipe.transform(data.end_time_delegate, 'yyyy'));
            let e_mon = parseInt(this.datePipe.transform(data.end_time_delegate, 'M'));
            let e_date = parseInt(this.datePipe.transform(data.end_time_delegate, 'd'));
            let e_hr = parseInt(this.datePipe.transform(data.end_time_delegate, 'H'));
            let e_min = parseInt(this.datePipe.transform(data.end_time_delegate, 'm'));

            // start: [2018, 1, 15, 12, 15],
            // Year, Month, Date, HH, MM
  
            let title = '';
            if(this.event_delegate_id == data.d1_id){
              title = 'Face2face Meeting with '+ data.d2_fullname;
            }else{
              title = 'Face2face Meeting with '+ data.d1_fullname;
            }

            let temp_itinerary;
            if(this.event.type == 1){
              temp_itinerary = {
                title: title,
                start: [yr, mon, date, hr, min],
                end: [e_yr, e_mon, e_date, e_hr, e_min],
                // duration: { minutes: parseInt(data.timeslot_interval) }
              };
            }else{
              temp_itinerary = {
                title: title,
                start: [yr, mon, date, hr, min],
                end: [e_yr, e_mon, e_date, e_hr, e_min],
                // duration: { minutes: parseInt(data.timeslot_interval) },
              };

              if(this.zoom_setting.status == '1'){
                if(this.delegate.email == data.d1_email){
                  //start
                  temp_itinerary['url'] = data.zoom_meeting_link_1;
                  temp_itinerary['description'] = 'This serves as your Zoom Meeting Link '+ data.zoom_meeting_link_1;
                }else{
                  //join
                  temp_itinerary['url'] = data.zoom_meeting_link_2;
                  temp_itinerary['description'] = 'This serves as your Zoom Meeting Link '+ data.zoom_meeting_link_2;
                }
              }
            }

            if(this.event_delegate_id == data.d1_id){
              temp_itinerary['attendees'] = [{ 
                name: data.d2_fullname, 
                email: data.d2_email, 
                rsvp: true, 
                partstat: 'ACCEPTED', 
                role: data.d2_job_title 
              }]
            }else{
              temp_itinerary['attendees'] = [{ 
                name: data.d1_fullname, 
                email: data.d1_email, 
                rsvp: true, 
                partstat: 'ACCEPTED', 
                role: data.d1_job_title 
              }]
            }

            this.ics_itinerary.push(temp_itinerary);
  
            // const { error, value } = ics.createEvents([
            //   {
            //     title: 'Lunch',
            //     start: [2018, 1, 15, 12, 15],
            //     duration: { minutes: 45 }
            //   },
            //   {
            //     title: 'Dinner',
            //     start: [2018, 1, 15, 12, 15],
            //     duration: { hours: 1, minutes: 30 }
            //   }
            // ]);
          }
        });
      }
    });

    if(this.ics_itinerary){
      const { error, value } = ics.createEvents(this.ics_itinerary);

      let fileName = this.event.name+' Final Itinerary';
      let path = this.getDownloadPath();

      var file = new File([value], fileName+".ics", {type: "text/calendar;charset=utf-8"});
      var blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
      this.env.file.writeFile(path, fileName+".ics", value, {replace: true})

      //saveAs.saveAs(file);
      let url = this.env.getUrl(Urls.api_delegates_senditineraries);
      let formData = new FormData();
      formData.append('file_name', fileName);
      formData.append('file', blob);
      formData.append('b64_file', value);
      formData.append('event_name', this.event.name);
      formData.append('file_type', 'ics');
      formData.append('delegate_email', this.delegate.email);
  
      this.gen.post(url, formData).subscribe(data=>{
        if(data.error == 0){
  
        }
      });
    }
  }

  async downloadICS(){
    
    const ics = require('ics');

    this.meetings_itinerary.forEach((meeting) => {
      console.log('meeting.data',meeting.data);
      if(meeting.data){
        meeting.data.forEach((data) => {
          if(data){
            let yr = parseInt(this.datePipe.transform(data.start_time_delegate, 'yyyy'));
            let mon = parseInt(this.datePipe.transform(data.start_time_delegate, 'M'));
            let date = parseInt(this.datePipe.transform(data.start_time_delegate, 'd'));
            let hr = parseInt(this.datePipe.transform(data.start_time_delegate, 'H'));
            let min = parseInt(this.datePipe.transform(data.start_time_delegate, 'm'));

            let e_yr = parseInt(this.datePipe.transform(data.end_time_delegate, 'yyyy'));
            let e_mon = parseInt(this.datePipe.transform(data.end_time_delegate, 'M'));
            let e_date = parseInt(this.datePipe.transform(data.end_time_delegate, 'd'));
            let e_hr = parseInt(this.datePipe.transform(data.end_time_delegate, 'H'));
            let e_min = parseInt(this.datePipe.transform(data.end_time_delegate, 'm'));

            // start: [2018, 1, 15, 12, 15],
            // Year, Month, Date, HH, MM
  
            let title = '';
            if(this.event_delegate_id == data.d1_id){
              title = 'Face2face Meeting with '+ data.d2_fullname;
            }else{
              title = 'Face2face Meeting with '+ data.d1_fullname;
            }

            let temp_itinerary;
            if(this.event.type == 1){
              temp_itinerary = {
                title: title,
                start: [yr, mon, date, hr, min],
                end: [e_yr, e_mon, e_date, e_hr, e_min],
                // duration: { minutes: parseInt(data.timeslot_interval) }
              };
            }else{
              temp_itinerary = {
                title: title,
                start: [yr, mon, date, hr, min],
                end: [e_yr, e_mon, e_date, e_hr, e_min],
                // duration: { minutes: parseInt(data.timeslot_interval) },
              };

              if(this.zoom_setting.status == '1'){
                if(this.delegate.email == data.d1_email){
                  //start
                  temp_itinerary['url'] = data.zoom_meeting_link_1;
                  temp_itinerary['description'] = 'This serves as your Zoom Meeting Link '+ data.zoom_meeting_link_1;
                }else{
                  //join
                  temp_itinerary['url'] = data.zoom_meeting_link_2;
                  temp_itinerary['description'] = 'This serves as your Zoom Meeting Link '+ data.zoom_meeting_link_2;
                }
              }
            }

            if(this.event_delegate_id == data.d1_id){
              temp_itinerary['attendees'] = [{ 
                name: data.d2_fullname, 
                email: data.d2_email, 
                rsvp: true, 
                partstat: 'ACCEPTED', 
                role: data.d2_job_title 
              }]
            }else{
              temp_itinerary['attendees'] = [{ 
                name: data.d1_fullname, 
                email: data.d1_email, 
                rsvp: true, 
                partstat: 'ACCEPTED', 
                role: data.d1_job_title 
              }]
            }

            // const event = {
            //   start: [2018, 5, 30, 6, 30],
            //   duration: { hours: 6, minutes: 30 },
            //   title: 'Bolder Boulder',
            //   description: 'Annual 10-kilometer run in Boulder, Colorado',
            //   location: 'Folsom Field, University of Colorado (finish line)',
            //   url: 'http://www.bolderboulder.com/',
            //   geo: { lat: 40.0095, lon: 105.2669 },
            //   categories: ['10k races', 'Memorial Day Weekend', 'Boulder CO'],
            //   status: 'CONFIRMED',
            //   busyStatus: 'BUSY',
            //   organizer: { name: 'Admin', email: 'Race@BolderBOULDER.com' },
            //   attendees: [
            //     { name: 'Adam Gibbons', email: 'adam@example.com', rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' },
            //     { name: 'Brittany Seaton', email: 'brittany@example2.org', dir: 'https://linkedin.com/in/brittanyseaton', role: 'OPT-PARTICIPANT' }
            //   ]
            // }

            this.ics_itinerary.push(temp_itinerary);
  
            // const { error, value } = ics.createEvents([
            //   {
            //     title: 'Lunch',
            //     start: [2018, 1, 15, 12, 15],
            //     duration: { minutes: 45 }
            //   },
            //   {
            //     title: 'Dinner',
            //     start: [2018, 1, 15, 12, 15],
            //     duration: { hours: 1, minutes: 30 }
            //   }
            // ]);
          }
        });
      }
    });

    if(this.ics_itinerary){
      const { error, value } = ics.createEvents(this.ics_itinerary);

      console.log('value rhan', value);
      
      let fileName = this.event.name+' Final Itinerary';
      let path = this.getDownloadPath();

      if (this.platform.is('mobileweb')) {

        console.log('broweser')
        var file = new File([value], this.env.rmSpace(fileName+".ics"), {type: "text/calendar;charset=utf-8"});
        saveAs.saveAs(file);
        this.env.toast(this.event.name + "_" + this.delegate.fullname + "'s Final Itinerary has been downloaded", 'toastsuccess');

      } else {
        console.log('device')

        // for serve
        // var file = new File([value], this.env.rmSpace(fileName+".ics"), {type: "text/calendar;charset=utf-8"});
        // saveAs.saveAs(file);

        const loader = await this.env.loadingCtrl.create();
        await loader.present();

        setTimeout(() => {
          loader.dismiss();

          this.env.file.writeFile(path, this.env.rmSpace(this.event.name + "_" + this.delegate.fullname + "'s Final Itinerary.ics"), value, {replace: true})
          this.env.toast(this.event.name + " : " + this.delegate.fullname + "'s Final Itinerary has been downloaded", 'toastsuccess');
          this.fileOpener.open(path + this.env.rmSpace(this.event.name + "_" + this.delegate.fullname + "'s Final Itinerary.ics"), "text/calendar").then((res: any) => {
          }).catch(e => {
            console.log("e", e);
          });
        }, 1000);
      }

      if (error) {
        console.log(error)
        return;
      }

    }
  }

  /* print filtered meeting scheduled list */
  protected sendPDF(data){
    let a = this;

    let doc;
    if(a.event.type == 1){
      doc = new jsPDF.default();
    }else{
      doc = new jsPDF.default({
        orientation: "landscape"
      });
    }

    doc.setTextColor(40);
    //doc.setFontStyle('normal');
    doc.setFontSize(13);

    let file_name = a.event.name + " : " + a.delegate.fullname + "'s meeting schedules ";
  
    let letter_head = "/assets/images/f2f_logo.png";
    a.toDataURL(letter_head, function(dataUrl){
      let headerTitle = file_name;

      let headerY = 20;
      if(letter_head){
        // addImage(imageData, format, x, y, width, height, alias, compression, rotation)
        doc.addImage(dataUrl, 'PNG', 15, 15, 45, 10, '', 'FAST');
        headerY = headerY + 15;
      }
      // text(text, x, y, optionsopt, transform)
      doc.text(headerTitle, 15, headerY, {maxWidth: 180});

      let headerTitle_dim = doc.getTextDimensions(headerTitle);
      let splitTitle = doc.splitTextToSize(headerTitle, 180, {fontSize:13});
      let headerTitle_height = (headerTitle_dim.h * splitTitle.length) + 2;  

      doc.setFontSize(11);
      doc.text(a.event.event_date, 15, headerTitle_height + headerY, {maxWidth: 180});
      
      let eventDate_dim = doc.getTextDimensions(a.event.event_date);
      let spliteventDate = doc.splitTextToSize(a.event.event_address,180,{fontSize:10});
      a.autoTable_dim = (eventDate_dim.h * spliteventDate.length) + headerTitle_height + headerY + 1; 

      data.forEach(element => {
        if(element.data){
          let rows = element.data;
          if(element.data){

            if(a.event.type == 1){
              autoTable(doc,
                {
                  theme: 'striped',
                  columnStyles: { 
                    europe: { halign: 'center' },
                    0: {  
                      cellWidth: 30,
                      fontSize: 8
                    },
                    1: {  
                      cellWidth: 35,  
                      fontSize: 8
                    },
                    2: {  
                      cellWidth: 50,  
                      fontSize: 8
                    },
                    3: {  
                      cellWidth: 48,  
                      fontSize: 8
                    },
                    4: {  
                      cellWidth: 18,  
                      fontSize: 8
                    },
                  },
                  head: [
                    [{ content: element.meeting_date, colSpan: 6, styles: { halign: 'center', fillColor: [104, 139, 6], textColor: [256, 256, 256] } }],
                    [
                      { content: 'Meeting time'},
                      { content: 'Delegate Name'},
                      { content: 'Company'},
                      { content: 'Position'},
                      { content: 'Table No'},
                    ]
                  ],
                  body: element.meeting_data,
                  margin: { top: a.autoTable_dim },
                  styles: { 
                    fillColor: [204, 204, 204], 
                    textColor: [68, 68, 68]
                  },
                }
              );
            }else{
              if(a.zoom_setting.status == '1'){
                autoTable(doc,
                  {
                    theme: 'striped',
                    columnStyles: { 
                      europe: { halign: 'center' },
                      0: {  
                        cellWidth: 30,
                        fontSize: 8
                      },
                      1: {  
                        cellWidth: 35,  
                        fontSize: 8
                      },
                      2: {  
                        cellWidth: 50,  
                        fontSize: 8
                      },
                      3: {  
                        cellWidth: 40,  
                        fontSize: 8
                      },
                      4: {  
                        cellWidth: 50,  
                        fontSize: 8
                      },
                      5: {   
                        fontSize: 8
                      }
                    },
                    head: [
                      [{ content: element.meeting_date, colSpan: 6, styles: { halign: 'center', fillColor: [104, 139, 6], textColor: [256, 256, 256] } }],
                      [
                        { content: 'Meeting time'},
                        { content: 'Delegate Name'},
                        { content: 'Company'},
                        { content: 'Position'},
                        { content: 'Zoom Email Address Id'},
                        { content: 'Zoom Meeting URL', styles: { cellWidth: 'wrap'}},
                      ]
                    ],
                    body: element.meeting_data,
                    margin: { top: a.autoTable_dim },
                    styles: { fillColor: [204, 204, 204], textColor: [68, 68, 68] },
                  }
                );
              }else{
                autoTable(doc,
                  {
                    theme: 'striped',
                    columnStyles: { 
                      europe: { halign: 'center' },
                      0: {  
                        cellWidth: 30,
                        fontSize: 8
                      },
                      1: {  
                        cellWidth: 45,  
                        fontSize: 8
                      },
                      2: {  
                        cellWidth: 65,  
                        fontSize: 8
                      },
                      3: {  
                        cellWidth: 70,  
                        fontSize: 8
                      },
                      4: {  
                        cellWidth: 45,  
                        fontSize: 8
                      },
                    },
                    head: [
                      [{ content: element.meeting_date, colSpan: 6, styles: { halign: 'center', fillColor: [104, 139, 6], textColor: [256, 256, 256] } }],
                      [
                        { content: 'Meeting time'},
                        { content: 'Delegate Name'},
                        { content: 'Company'},
                        { content: 'Position'},
                        { content: 'Zoom Email Address Id'}
                      ]
                    ],
                    body: element.meeting_data,
                    margin: { top: a.autoTable_dim },
                    styles: { fillColor: [204, 204, 204], textColor: [68, 68, 68] },
                  }
                );
              }
            }
          }
        }
      });

      var fileBlob = doc.output('blob');
      var reader = new FileReader();

      reader.readAsDataURL(fileBlob); 
      reader.onloadend = function() { // for blob to base64
        a.filebase64data = reader.result; 
        if(a.filebase64data){
          let url = a.env.getUrl(Urls.api_delegates_senditineraries);
          let formData = new FormData();
          formData.append('file_name', file_name);
          formData.append('file', fileBlob);
          formData.append('b64_file', a.filebase64data);
          formData.append('event_name', a.event.name);
          formData.append('delegate_email', a.delegate.email);
      
          a.gen.post(url, formData).subscribe(send=>{
            if(send.error == 0){

            }
          });
        }
      }
    });
  }

  /* print filtered meeting scheduled list */
  downloadPDF(data){
    let a = this;

    let doc;
    if(a.event.type == 1){
      doc = new jsPDF.default();
    }else{
      doc = new jsPDF.default({
        orientation: "landscape"
      });
    }
    
    doc.setTextColor(40);
    //doc.setFontStyle('normal');
    doc.setFontSize(13);

    let file_name = a.event.name + " : " + a.delegate.fullname + "'s meeting schedules ";
  
    let letter_head = "/assets/images/f2f_logo.png";
    a.toDataURL(letter_head, async function(dataUrl){
      let headerTitle = file_name;

      let headerY = 20;
      if(letter_head){
        // addImage(imageData, format, x, y, width, height, alias, compression, rotation)
        doc.addImage(dataUrl, 'PNG', 15, 15, 45, 10, '', 'FAST');
        headerY = headerY + 15;
      }
      // text(text, x, y, optionsopt, transform)
      doc.text(headerTitle, 15, headerY, {maxWidth: 180});

      let headerTitle_dim = doc.getTextDimensions(headerTitle);
      let splitTitle = doc.splitTextToSize(headerTitle, 180, {fontSize:13});
      let headerTitle_height = (headerTitle_dim.h * splitTitle.length) + 2;  
      doc.setFontSize(11);
      doc.text(a.event.event_date, 15, headerTitle_height + headerY, {maxWidth: 180});
      
      let eventDate_dim = doc.getTextDimensions(a.event.event_date);
      let spliteventDate = doc.splitTextToSize(a.event.event_address,180,{fontSize:10});
      a.autoTable_dim = (eventDate_dim.h * spliteventDate.length) + headerTitle_height + headerY + 1; 

      data.forEach(element => {
        if(element.data){
          let rows = element.data;
          if(element.data){
            if(a.event.type == 1){
              autoTable(doc,
                {
                  theme: 'striped',
                  tableWidth: 'auto',
                  columnStyles: { 
                    europe: { halign: 'center' },
                    0: {  
                      cellWidth: 30,
                      fontSize: 8
                    },
                    1: {  
                      cellWidth: 35,  
                      fontSize: 8
                    },
                    2: {  
                      cellWidth: 50,  
                      fontSize: 8
                    },
                    3: {  
                      cellWidth: 48,  
                      fontSize: 8
                    },
                    4: {  
                      cellWidth: 18,  
                      fontSize: 8
                    },
                  },
                  head: [
                    [{ content: element.meeting_date, colSpan: 6, styles: { halign: 'center', fillColor: [104, 139, 6], textColor: [256, 256, 256] } }],
                    [
                      {content: 'Meeting time'},
                      {content: 'Delegate Name'},
                      {content: 'Company'},
                      {content: 'Position'},
                      {content: 'Table No'},
                    ]
                  ],
                  body: element.meeting_data,
                  margin: { top: a.autoTable_dim },
                  styles: { fillColor: [204, 204, 204], textColor: [68, 68, 68] },
                }
              );
            }else{
              if(a.zoom_setting.status == '1'){
                autoTable(doc,
                  {
                    theme: 'striped',
                    columnStyles: { 
                      europe: { halign: 'center' },
                      0: {  
                        cellWidth: 30,
                        fontSize: 8
                      },
                      1: {  
                        cellWidth: 35,  
                        fontSize: 8
                      },
                      2: {  
                        cellWidth: 50,  
                        fontSize: 8
                      },
                      3: {  
                        cellWidth: 40,  
                        fontSize: 8
                      },
                      4: {  
                        cellWidth: 50,  
                        fontSize: 8
                      },
                      5: {   
                        fontSize: 8
                      }
                    },
                    head: [
                      [{ content: element.meeting_date, colSpan: 6, styles: { halign: 'center', fillColor: [104, 139, 6], textColor: [256, 256, 256] } }],
                      [
                        { content: 'Meeting time'},
                        { content: 'Delegate Name'},
                        { content: 'Company'},
                        { content: 'Position'},
                        { content: 'Zoom Email Address Id'},
                        { content: 'Zoom Meeting URL', styles: { cellWidth: 'wrap'}},
                      ]
                    ],
                    body: element.meeting_data,
                    margin: { top: a.autoTable_dim },
                    styles: { fillColor: [204, 204, 204], textColor: [68, 68, 68] },
                  }
                );
              }else{
                autoTable(doc,
                  {
                    theme: 'striped',
                    columnStyles: { 
                      europe: { halign: 'center' },
                      0: {  
                        cellWidth: 30,
                        fontSize: 8
                      },
                      1: {  
                        cellWidth: 45,  
                        fontSize: 8
                      },
                      2: {  
                        cellWidth: 65,  
                        fontSize: 8
                      },
                      3: {  
                        cellWidth: 70,  
                        fontSize: 8
                      },
                      4: {  
                        cellWidth: 45,  
                        fontSize: 8
                      },
                    },
                    head: [
                      [{ content: element.meeting_date, colSpan: 6, styles: { halign: 'center', fillColor: [104, 139, 6], textColor: [256, 256, 256] } }],
                      [
                        { content: 'Meeting time'},
                        { content: 'Delegate Name'},
                        { content: 'Company'},
                        { content: 'Position'},
                        { content: 'Zoom Email Address Id'}
                      ]
                    ],
                    body: element.meeting_data,
                    margin: { top: a.autoTable_dim },
                    styles: { fillColor: [204, 204, 204], textColor: [68, 68, 68] },
                  }
                );
              }
            } 
          }
        }
      });

      var fileBlob = doc.output('blob');
      var reader = new FileReader();
      let path = a.getDownloadPath();

      if (a.platform.is('mobileweb')) {

        console.log('broweser')
        doc.save(a.event.name + ":" + a.delegate.fullname + "'s Final Itinerary.pdf");
        a.env.toast(a.event.name + ":" + a.delegate.fullname + "'s Final Itinerary has been downloaded", 'toastsuccess');

      } else {
        console.log('device');
        const loader = await a.env.loadingCtrl.create();
        await loader.present();

        //for serve
        //doc.save(a.event.name + ":" + a.delegate.fullname + "'s Final Itinerary.pdf");
        
        setTimeout(() => {
          loader.dismiss();
          a.env.file.writeFile(path, a.env.rmSpace(a.event.name + "_" + a.delegate.fullname + "'s Final Itinerary.pdf"), fileBlob, {replace: true})
          a.env.toast(a.event.name + " : " + a.delegate.fullname + "'s Final Itinerary has been downloaded", 'toastsuccess');
          a.fileOpener.open(path + a.env.rmSpace(a.event.name + "_" + a.delegate.fullname + "'s Final Itinerary.pdf"), "application/pdf").then((res: any) => {
          }).catch(e => {
            console.log("e", e);
          });
        }, 1000);
      }
    });
  }
  
  toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  /* print filtered meeting scheduled list */
  protected sendMultipleFile(data){
    let a = this;

    let doc;
    if(a.event.type == 1){
      doc = new jsPDF.default();
    }else{
      doc = new jsPDF.default({
        orientation: "landscape"
      });
    }
    
    doc.setTextColor(40);
    //doc.setFontStyle('normal');
    doc.setFontSize(13);

    let file_name = a.event.name + " : " + a.delegate.fullname + "'s meeting schedules ";
  
    let letter_head = "/assets/images/f2f_logo.png";
    a.toDataURL(letter_head, function(dataUrl){
      let headerTitle = file_name;

      let headerY = 20;
      if(letter_head){
        // addImage(imageData, format, x, y, width, height, alias, compression, rotation)
        doc.addImage(dataUrl, 'PNG', 15, 15, 45, 10, '', 'FAST');
        headerY = headerY + 15;
      }
      // text(text, x, y, optionsopt, transform)
      doc.text(headerTitle, 15, headerY, {maxWidth: 180});

      let headerTitle_dim = doc.getTextDimensions(headerTitle);
      let splitTitle = doc.splitTextToSize(headerTitle, 180, {fontSize:13});
      let headerTitle_height = (headerTitle_dim.h * splitTitle.length) + 2;  
      doc.setFontSize(11);
      doc.text(a.event.event_date, 15, headerTitle_height + headerY, {maxWidth: 180});
      
      let eventDate_dim = doc.getTextDimensions(a.event.event_date);
      let spliteventDate = doc.splitTextToSize(a.event.event_address,180,{fontSize:10});
      a.autoTable_dim = (eventDate_dim.h * spliteventDate.length) + headerTitle_height + headerY + 1; 

      data.forEach(element => {
        if(element.data){
          let rows = element.data;
          if(element.data){
            if(a.event.type == 1){
              autoTable(doc,
                {
                  theme: 'striped',
                  columnStyles: { 
                    europe: { halign: 'center' },
                    0: {  
                      cellWidth: 30,
                      fontSize: 8
                    },
                    1: {  
                      cellWidth: 35,  
                      fontSize: 8
                    },
                    2: {  
                      cellWidth: 50,  
                      fontSize: 8
                    },
                    3: {  
                      cellWidth: 48,  
                      fontSize: 8
                    },
                    4: {  
                      cellWidth: 18,  
                      fontSize: 8
                    },
                  },
                  head: [
                    [{ content: element.meeting_date, colSpan: 6, styles: { halign: 'center', fillColor: [104, 139, 6], textColor: [256, 256, 256] } }],
                    [
                      {content: 'Meeting time'},
                      {content: 'Delegate Name'},
                      {content: 'Company'},
                      {content: 'Position'},
                      {content: 'Table No'},
                    ]
                  ],
                  body: element.meeting_data,
                  margin: { top: a.autoTable_dim },
                  styles: { fillColor: [204, 204, 204], textColor: [68, 68, 68] },
                }
              );
            }else{
              if(a.zoom_setting.status == '1'){
                autoTable(doc,
                  {
                    theme: 'striped',
                    columnStyles: { 
                      europe: { halign: 'center' },
                      0: {  
                        cellWidth: 30,
                        fontSize: 8
                      },
                      1: {  
                        cellWidth: 35,  
                        fontSize: 8
                      },
                      2: {  
                        cellWidth: 50,  
                        fontSize: 8
                      },
                      3: {  
                        cellWidth: 40,  
                        fontSize: 8
                      },
                      4: {  
                        cellWidth: 50,  
                        fontSize: 8
                      },
                      5: {   
                        fontSize: 8
                      }
                    },
                    head: [
                      [{ content: element.meeting_date, colSpan: 6, styles: { halign: 'center', fillColor: [104, 139, 6], textColor: [256, 256, 256] } }],
                      [
                        { content: 'Meeting time'},
                        { content: 'Delegate Name'},
                        { content: 'Company'},
                        { content: 'Position'},
                        { content: 'Zoom Email Address Id'},
                        { content: 'Zoom Meeting URL', styles: { cellWidth: 'wrap'}},
                      ]
                    ],
                    body: element.meeting_data,
                    margin: { top: a.autoTable_dim },
                    styles: { fillColor: [204, 204, 204], textColor: [68, 68, 68] },
                  }
                );
              }else{
                autoTable(doc,
                  {
                    theme: 'striped',
                    columnStyles: { 
                      europe: { halign: 'center' },
                      0: {  
                        cellWidth: 30,
                        fontSize: 8
                      },
                      1: {  
                        cellWidth: 45,  
                        fontSize: 8
                      },
                      2: {  
                        cellWidth: 65,  
                        fontSize: 8
                      },
                      3: {  
                        cellWidth: 70,  
                        fontSize: 8
                      },
                      4: {  
                        cellWidth: 45,  
                        fontSize: 8
                      },
                    },
                    head: [
                      [{ content: element.meeting_date, colSpan: 6, styles: { halign: 'center', fillColor: [104, 139, 6], textColor: [256, 256, 256] } }],
                      [
                        { content: 'Meeting time'},
                        { content: 'Delegate Name'},
                        { content: 'Company'},
                        { content: 'Position'},
                        { content: 'Zoom Email Address Id'}
                      ]
                    ],
                    body: element.meeting_data,
                    margin: { top: a.autoTable_dim },
                    styles: { fillColor: [204, 204, 204], textColor: [68, 68, 68] },
                  }
                );
              }
            }
          }
        }
      });

      var fileBlob = doc.output('blob');
      var reader = new FileReader();

      reader.readAsDataURL(fileBlob); 
      reader.onloadend = function() { // for blob to base64
        a.filebase64data = reader.result; 
        if(a.filebase64data){
          let url = a.env.getUrl(Urls.api_delegates_sendmultipleitineraries);
          let formData = new FormData();

          const ics = require('ics')
    
          a.meetings_itinerary.forEach((meeting) => {
            if(meeting.data){
              meeting.data.forEach((data) => {
                if(data){
                  let yr = parseInt(a.datePipe.transform(data.start_time_delegate, 'yyyy'));
                  let mon = parseInt(a.datePipe.transform(data.start_time_delegate, 'M'));
                  let date = parseInt(a.datePipe.transform(data.start_time_delegate, 'd'));
                  let hr = parseInt(a.datePipe.transform(data.start_time_delegate, 'H'));
                  let min = parseInt(a.datePipe.transform(data.start_time_delegate, 'm'));

                  let e_yr = parseInt(a.datePipe.transform(data.end_time_delegate, 'yyyy'));
                  let e_mon = parseInt(a.datePipe.transform(data.end_time_delegate, 'M'));
                  let e_date = parseInt(a.datePipe.transform(data.end_time_delegate, 'd'));
                  let e_hr = parseInt(a.datePipe.transform(data.end_time_delegate, 'H'));
                  let e_min = parseInt(a.datePipe.transform(data.end_time_delegate, 'm'));
      
                  // start: [2018, 1, 15, 12, 15],
                  // Year, Month, Date, HH, MM
        
                  let title = '';
                  if(a.event_delegate_id == data.d1_id){
                    title = 'Face2face Meeting with '+ data.d2_fullname;
                  }else{
                    title = 'Face2face Meeting with '+ data.d1_fullname;
                  }
      
                  let temp_itinerary;
                  if(a.event.type == 1){
                    temp_itinerary = {
                      title: title,
                      start: [yr, mon, date, hr, min],
                      end: [e_yr, e_mon, e_date, e_hr, e_min],
                      // duration: { minutes: parseInt(data.timeslot_interval) }
                    };
                  }else{
                    temp_itinerary = {
                      title: title,
                      start: [yr, mon, date, hr, min],
                      end: [e_yr, e_mon, e_date, e_hr, e_min],
                      // duration: { minutes: parseInt(data.timeslot_interval) },
                    };

                    if(a.zoom_setting.status == '1'){
                      if(a.delegate.email == data.d1_email){
                        //start
                        temp_itinerary['url'] = data.zoom_meeting_link_1;
                        temp_itinerary['description'] = 'This serves as your Zoom Meeting Link '+ data.zoom_meeting_link_1;
                      }else{
                        //join
                        temp_itinerary['url'] = data.zoom_meeting_link_2;
                        temp_itinerary['description'] = 'This serves as your Zoom Meeting Link '+ data.zoom_meeting_link_2;
                      }
                    }
                  }

                  if(a.event_delegate_id == data.d1_id){
                    temp_itinerary['attendees'] = [{ 
                      name: data.d2_fullname, 
                      email: data.d2_email, 
                      rsvp: true, 
                      partstat: 'ACCEPTED', 
                      role: data.d2_job_title 
                    }]
                  }else{
                    temp_itinerary['attendees'] = [{ 
                      name: data.d1_fullname, 
                      email: data.d1_email, 
                      rsvp: true, 
                      partstat: 'ACCEPTED', 
                      role: data.d1_job_title 
                    }]
                  }
      
                  a.ics_itinerary.push(temp_itinerary);
                }
              });
            }
          });

          formData.append('pdf_file_name', file_name);
          formData.append('pdf_file', fileBlob);
          formData.append('pdf_b64_file', a.filebase64data);

          if(a.ics_itinerary){
            const { error, value } = ics.createEvents(a.ics_itinerary);
      
            let fileName = a.event.name+' Final Itinerary';
            var blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
            //saveAs.saveAs(file);
        
            formData.append('ics_file_name', fileName);
            formData.append('ics_file', blob);
            formData.append('ics_b64_file', value);
          }

          formData.append('event_name', a.event.name);
          formData.append('delegate_email', a.delegate.email);
      
          a.gen.post(url, formData).subscribe(send=>{
            if(send.error == 0){

            }
          });
        }
      }
    });
  }

  public getDownloadPath() {
    if (this.platform.is('ios')) {
        return this.env.file.documentsDirectory;
    }
    return this.env.file.externalRootDirectory + "/Download/";
  }

  gotoZoomLink(meeting_details){
    console.log(meeting_details);
    let url;
    if(meeting_details.delegate_email == meeting_details.d2_email){
      //start
      url = meeting_details.zoom_meeting_link_1;
    }else{
      //join
      url = meeting_details.zoom_meeting_link_2;
    }

    this.env.iab.create(url, `_system`);
  }

  copyZoomLink(meeting_details){
    console.log(meeting_details);
    let url;
    if(meeting_details.delegate_email == meeting_details.d2_email){
      //start
      this.clipboard.copy(meeting_details.zoom_meeting_link_1);
    }else{
      //join
      this.clipboard.copy(meeting_details.zoom_meeting_link_2);
    }
    this.env.toast('Copy to Clipboard', 'toastsuccess');
  }

  getZoomSetting(){
    let url = this.env.getUrl(Urls.api_virtualconference_getzoomsettings);

    this.gen.get(url).subscribe(data=>{
      if(data.error == 0){
        this.zoom_setting = data.data;
      }
    });
  }
}