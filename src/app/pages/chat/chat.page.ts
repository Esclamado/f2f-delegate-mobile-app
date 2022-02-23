import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { ModalController, Events } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ScheduleMeetingPage } from 'src/app/modalpage/schedule-meeting/schedule-meeting.page';
import { ChatboxPage } from 'src/app/modalpage/chatbox/chatbox.page';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  event_id: any = null;
  event_delegate_id: any = null;
  infi_scroll: any = null;

  constructor(
    public env: EnvService,
    public modalCtrl: ModalController,
    protected _route: ActivatedRoute,
    public events: Events
  ) {
    this.env.requireLogIn();
  }

  ngOnInit() {
    this._route.paramMap.subscribe( url_param =>{
      this.event_id = url_param.get('event_id');

      this.env.storage.get('event_delegate_id').then(id => {
        this.event_delegate_id = id;
        this.getConvos();
      });
    });

    this.env.chatSocket.removeListener('new convo msg');
    this.env.chatSocket.on('new convo msg', data => {
      if( parseInt(this.event_id) === parseInt(data.event_id) ){
        this.updateConvo(data);
      }
    });

    this.env.chatSocket.removeListener('get convos');
    this.env.chatSocket.on('get convos', data => {
      let _convos = this.env.chatSocket.setConverseWith(data.data)

      if(!this.env.chatSocket.convos){
        this.env.chatSocket.convos = _convos;
      } else {
          /* todo infinite scroll */
          this.env.chatSocket.convos.current_page = _convos.current_page;
          this.env.chatSocket.convos.next_page = _convos.next_page;
          this.env.chatSocket.convos.previous_page = _convos.previous_page;

          _convos.datas.forEach(val => {
            this.env.chatSocket.convos.datas.push(val);
          });
          if(this.infi_scroll){
            this.infi_scroll.target.complete();
          }
          if(!_convos.next_page){
            this.infi_scroll.target.disabled = true;
          }
      }
    });
  }

  /**
   * sort the convos in newest message first
   */
  sortConvos(){
    this.env.chatSocket.sortConvos();
  }

  /**
   * find the location of specific convo
   * then change the value of data
   * @param convo 
   */
  updateConvo(convo){
    let convos = this.env.chatSocket.convos.datas;

    let convoFOund = false;

    /* need to do this as string because zero if considered as false or null */
    let convoFOundKey: any = 'null'; 

    convos.forEach((c, key) => {
      if(c.id === convo.id){
        convoFOund = true;
        convoFOundKey = key;

        c.last_message = convo.last_message;
        c.last_message_by = convo.last_message_by;
        if(c.last_message_by == this.env.payload.jti){
          c.unread = false;
        } else {
          c.unread = true;
        }
        c.last_message_date_foramatted = convo.last_message_date_foramatted;
      }
    });

    if(convoFOundKey != 'null'){
      let newConvo = convos.splice(convoFOundKey, 1);
      if(newConvo.length){
        this.env.chatSocket.convos.datas.unshift(newConvo[0]);
      }
    }

    if(!convoFOund){
      convo = this.env.chatSocket.setConverseWithHelper(convo, true);
      this.env.chatSocket.convos.datas.unshift(convo);
    }
    /* this.sortConvos(); */
  }

  getConvos(page: any = 1){
    this.env.storage.get('Devicetoken').then((devicetoken) => {
      this.env.storage.get('token').then((token) => {
        if(devicetoken){
          this.env.chatSocket.setVar('baseUrl', this.env.getUrl(''))
          .setVar('apiToken', token)
          .setVar('currentLogedInUserId', this.env.payload.jti)
          .setVar('devicetoken', devicetoken)
          .setVar('deviceid', this.env.deviceid)
          .setVar('event_id', this.event_id);

          if(page == 1){
            this.env.chatSocket.setVar('convos', null);
          }

          this.env.chatSocket.getConvos(page);
        }else{
          this.env.setDeviceToken();
        }
      });
    });
  }

  /**
   * show list of available delegates
   */
  async showDelegatesModal(){
    const modal = await this.modalCtrl.create({
      component: ScheduleMeetingPage,
      componentProps: {
        called_by: 'chat_convos',
        event_id: this.event_id,
        delegate_id: this.event_delegate_id
      }
    });

    modal.present();
    const { data } = await modal.onDidDismiss();
    if(data){
      this.showChatbox(data);
    }
  }

  async openChatBox(convo){
    convo.unread = false;

    let chatwithid = convo.user1;
    if(this.env.payload.jti == convo.user1){
      chatwithid = convo.user2;
    }

    /** 
     * decrement the number of unread messages 
     * and set it on storage
     */
    if(this.env.unread_msg['event_'+this.event_id]){
      if(this.env.unread_msg['event_'+this.event_id].convos['convo_'+convo.id]){
        delete this.env.unread_msg['event_'+this.event_id].convos['convo_'+convo.id];
        this.env.unread_msg['event_'+this.event_id].unread_msg_convo--;

        this.env.storage.set('unread_msg', this.env.unread_msg);
        // console.log('update unread msg count', this.env.unread_msg);
      }
    }

    const modal = await this.modalCtrl.create({
      component: ChatboxPage,
      componentProps: {
        my_id: this.env.payload.jti,
        chat_with_id: chatwithid,
        event_id: this.event_id,
        convo: convo
      }
    });

    modal.present();
  }

  async showChatbox(delegatedata){
    console.log('delegatedata',delegatedata);
    let myid = delegatedata.ed1_delegate_id;
    if(delegatedata.delegate_id == delegatedata.ed1_delegate_id){
      myid = delegatedata.ed2_delegate_id;
    }

    const modal = await this.modalCtrl.create({
      component: ChatboxPage,
      componentProps: {
        my_id: myid,
        chat_with_id: delegatedata.delegate_id,
        event_id: this.event_id,
      }
    });

    modal.present();
  }

  /**
   * infi scroll
   */
  infiScroll(e){
    let convos = this.env.chatSocket.convos;
    let next_page = convos.next_page;
    if(next_page){
      this.infi_scroll = e;
      this.getConvos(next_page);
    } else {
      this.infi_scroll = null;
      e.target.disabled = true;
    }
  }

}
