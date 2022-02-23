
import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { EnvService } from 'src/app/lib/env.service';
import { ModalController, IonContent } from '@ionic/angular';
import { Urls } from 'src/app/lib/urls';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.page.html',
  styleUrls: ['./chatbox.page.scss'],
})
export class ChatboxPage implements OnInit {

  @ViewChild(IonContent, {read: '', static: true}) content: IonContent;

  @Input() my_id: any = null;
  @Input() chat_with_id: any = null;
  @Input() event_id: any = null;
  @Input() messageToSend: any = '';
  @Input() convo: any = null;

  apiToken = this.env.generateToken();
  baseUrl = this.env.getUrl('');

  /**
   * the element of infi scroll
   * we need to hold it here for the infi completion
   */
  infiEl: any = null;
  chatWidthIsTyping: boolean = false;
  sendButton: boolean = false;
  debounce: any = false;



  private mutationObserver: MutationObserver;

  constructor(
    public env: EnvService,
    public modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.reset();
    console.log('chatbox pumasok', this.env.push_click_counter);
    this.env.push_click_counter = 0;

    this.env.storage.set('chatbox_active', true);

    this.debounce = this.env.debounce(f => {
      let data = {
        chatWith: this.chat_with_id,
        event_id: this.event_id
      }
      this.env.chatSocket.emit('stop typing', data);
    }, 1000);

    this.env.chatSocket.on('messages', data => {
      console.log('sdaa',data);
      if(!this.env.chatSocket.messages){
        this.sortMessage(data.data);
      } else {
        this.env.chatSocket.messages.current_page = data.data.current_page;

        data.data = this.sortMessage(data.data, true);

        data.data.datas.forEach(val => {
          this.env.chatSocket.messages.datas.unshift(val);
        });
        if(this.infiEl){
          this.infiEl.target.complete();
        }
      }
      this.content.scrollToBottom();

      if(!this.convo){
        this.convo = this.env.chatSocket.convo;
      }
    }); 

    this.env.chatSocket.removeListener('chat message');
    this.env.chatSocket.on('chat message', data => {
      if( parseInt(data.data.event_id) == parseInt(this.event_id) ){
        
        if(!this.convo){
          this.convo = this.env.chatSocket.convo;
        }

        if(data.data.chat_conversation_id == this.convo.id){
          this.content.scrollToBottom();
          this.env.chatSocket.messages.datas.push(data.data);

          this.setMessageAsRead(data.data);
        }
      }
    });

    this.env.chatSocket.removeListener('is typing');
    this.env.chatSocket.on('is typing', data => {
      if( parseInt(data.event_id) == parseInt(this.event_id) ){

        if(!this.convo){
          this.convo = this.env.chatSocket.convo;
        }

        if(data.chat_conversation_id == this.convo.id){
          this.chatWidthIsTyping = true;
          this.content.scrollToBottom();
        }
      }
    });

    this.env.chatSocket.removeListener('stop typing');
    this.env.chatSocket.on('stop typing', data => {
      this.chatWidthIsTyping = false;
    });

    this.env.storage.get('Devicetoken').then((devicetoken) => {
      this.env.storage.get('token').then((token) => {
        if(devicetoken){
          this.env.chatSocket.setVar('baseUrl', this.env.getUrl(''))
            .setVar('apiToken', token)
            .setVar('currentLogedInUserId', this.env.payload.jti)
            .setVar('devicetoken', devicetoken)
            .setVar('deviceid', this.env.deviceid)
            .setVar('event_id', this.event_id)
            .setVar('chat_with_id', this.chat_with_id)
            .getConvo();
        }else{
          this.env.setDeviceToken();
        }
      });
    });
  }

  setMessageAsRead(data: any = null){
    if(parseInt(this.env.payload.jti) != parseInt(data.user_id)){
      let url = this.env.getUrl(Urls.api_chat_setasread);
      url += "?id=" + data.id;
      this.env.http.get<any>(url, this.env.getHttpOptions())
      .subscribe(f => {
        if(this.convo){
          this.convo.unread = false;
        }
      });
    }
  }

  reset(){
    console.log('reset');
    this.env.chatSocket.removeListener('messages');
    this.env.chatSocket.removeListener('chat message');

    this.env.chatSocket.messages = null;
    this.env.chatSocket.convo = null;
    this.infiEl = null;
  }

  /**
   * @param e 
   */
  infiScroll(e){
    let msg = this.env.chatSocket.messages;
    if(msg.current_page < msg.total_page){
      this.infiEl = e;

      this.env.chatSocket.getMessages('prepend', (msg.current_page + 1), msg.lastId);
    } else {
      e.target.complete();
    }
  }

  /**
   * for some reason array.sort() not working on mobile device
   * so we have to sort the messages here manually
   */
  sortMessage(data, returnData = false){
    let msgs = data.datas;
    const _msgs = [];

    msgs.forEach((val, key) => {
      let date = new Date(val.created_at);
      let calcDay = this.calculateDays(date);

      let nextIndex = key + 1;

      if(msgs[nextIndex]){
        let nextMsg = msgs[nextIndex];
        let nextDate = new Date(nextMsg.created_at);
        let calcNextDate = this.calculateDays(nextDate);

        if(calcDay.difference_in_days < calcNextDate.difference_in_days){ /* the next msg sent earlier than today */
          val['date_divider'] = this.getDivider(calcDay, date);
        }
      } else {
        val['date_divider'] = this.getDivider(calcDay, date);
      }
      if(returnData){
        _msgs.push(val);
      } else {
        _msgs.unshift(val);
      }

    });
    data.datas = _msgs;

    if(returnData){
      return data;
    } else {
      this.env.chatSocket.messages = data;
    }
  }

  /**
   * return the specifc divider for date
   * @param calcDay 
   */
  getDivider(calcDay, date){
    let divider = "today";

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    if(calcDay.difference_in_days > 0){
      let remainingDaysTonextWeek = 7 - calcDay.day_no_in_week2;
      let lastDayOfWeek = remainingDaysTonextWeek + calcDay.date2;
      let firstDayOfWeek = lastDayOfWeek - 6;

      if(calcDay.difference_in_days == 1){
        divider = 'yesterday';
      } 
      else if(firstDayOfWeek <= calcDay.date1 && lastDayOfWeek >= calcDay.date1){
        divider = days[calcDay.day_no_in_week1 - 1];
      } 
      else {
        divider = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
      }
    }
    return divider;
  }

  /**
   * calculate the number of day in between
   * two dates
   * @param date1 the first date to compare must be less than the date2
   * @param date2 must be greater than date1
   * the 2 params is an instance of javascript Data() class
   * return obj
   */
  calculateDays(date1, date2: any = null){
    if(!date2){
      date2 = new Date();
    }
    /* rebuild the date to ensure no time will be included */
    date1 = date1.getFullYear() + '-' + (date1.getMonth() + 1) + '-' + date1.getDate();
    date1 = new Date(date1);
    date2 = date2.getFullYear() + '-' + (date2.getMonth() + 1) + '-' + date2.getDate();
    date2 = new Date(date2);

    /* calculate the time difference of two dates */
    let Difference_In_Time = date2.getTime() - date1.getTime(); 

    /* calculate the no. of days between two dates */ 
    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 

    return {
      difference_in_days: Difference_In_Days,
      day_no_in_week1: date1.getDay() + 1,
      day_no_in_week2: date2.getDay() + 1,
      date1: date1.getDate(),
      date2: date2.getDate(),
    }
  }

  dismiss(data) {
    this.convo = null;
    this.env.storage.remove('chatbox_active');
    this.modalCtrl.dismiss(data);
  }
 
  sendMessage(){
    if(this.sendButton){
      this.env.storage.get('Devicetoken').then((devicetoken) => {
        this.env.storage.get('token').then((token) => {
          if(devicetoken){
            if(this.messageToSend.length){
              let param = {
                token: token,
                baseUrl: this.baseUrl,
                uripath: '/api/chat/savemessage',
                convo: this.env.chatSocket.convo,
                Devicetoken: devicetoken, //this.env.devicetoken,
                Deviceid: this.env.deviceid
              }
              let form = {
                  request_type: 'mobile',
                  senderid: this.env.payload.jti,
                  receiverid: this.chat_with_id,
                  msg: this.messageToSend,
                  convoid: this.env.chatSocket.convo.id,
                  attachmentIds: null,
                  token: token
              };
              let _data = {
                form: form,
                param: param,
              }

              this.messageToSend = "";
              this.sendButton = false;
              let el = document.getElementById('texarea-container');
              el.innerHTML = "";
              this.env.chatSocket.emit('chat message', _data);
            }

          }else{
            this.env.setDeviceToken();
          }
        });
      });
    }
  }

  /**
   * emit is typing to user
   */
  isTyping (){

    let el = document.getElementById('texarea-container');
    if(el.innerHTML === '<br>'){
      this.messageToSend = "";
      el.innerHTML = ""
    }

    this.sendButton = /\S/.test(this.messageToSend);
    
    /* if(this.messageToSend.length){
      this.sendButton = true;
    } else {
      this.sendButton = false;
    } */

    let c = this.env.chatSocket.convo;

    let data = {
      chatWith: c['user'+c.chatWith],
      event_id: this.event_id,
      chat_conversation_id: this.convo.id
    }

    this.env.chatSocket.emit('is typing', data);
    this.debounce();
  }

  /**
   * redirect user to delegates profile page
   */
  goToProfile(){
    this.dismiss(null);
    this.env.redirect('/delegate-profile/'+this.chat_with_id+'/'+this.event_id);
  }
}
