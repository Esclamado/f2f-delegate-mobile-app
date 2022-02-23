import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

/* Font Awesome */
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { IonicStorageModule } from '@ionic/storage';
import { IonicSelectableModule } from 'ionic-selectable';

import { WebView } from '@ionic-native/ionic-webview/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { Device } from '@ionic-native/device/ngx';
import { FCM } from '@ionic-native/fcm/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Downloader } from '@ionic-native/downloader/ngx';

import { Clipboard } from '@ionic-native/clipboard/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Badge } from '@ionic-native/badge/ngx';

import { ActionSheet, ActionSheetOptions } from '@ionic-native/action-sheet/ngx';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxImageCompressService } from 'ngx-image-compress';

/* Modal pages */
import { ChangepasswordPageModule } from 'src/app/modalpage/changepassword/changepassword.module';
import { ChangepasswordPage } from 'src/app/modalpage/changepassword/changepassword.page';
import { SocialMediaPage } from 'src/app/modalpage/social-media/social-media.page';
import { PromptModalPage } from 'src/app/modalpage/prompt-modal/prompt-modal.page';
import { EventFilterPage } from 'src/app/modalpage/event-filter/event-filter.page';
import { FilterDelegatePage } from 'src/app/modalpage/filter-delegate/filter-delegate.page';
import { ScheduleMeetingPage } from 'src/app/modalpage/schedule-meeting/schedule-meeting.page';
import { ScheduleMeetingInfoPage } from 'src/app/modalpage/schedule-meeting-info/schedule-meeting-info.page';
import { PromptModalHeaderPage } from 'src/app/modalpage/prompt-modal-header/prompt-modal-header.page';
import { ReScheduleMeetingPage } from 'src/app/modalpage/re-schedule-meeting/re-schedule-meeting.page';
import { EventMeetingRequestListPage } from 'src/app/modalpage/event-meeting-request-list/event-meeting-request-list.page';
import { CancelMeetingRequestPage } from 'src/app/modalpage/cancel-meeting-request/cancel-meeting-request.page';
import { NoteSendMailPage } from 'src/app/modalpage/note-send-mail/note-send-mail.page'
import { FileOptionPage } from 'src/app/modalpage/file-option/file-option.page';
import { ChatboxPage } from 'src/app/modalpage/chatbox/chatbox.page';
import { CustomSelectablePage } from 'src/app/modalpage/custom-selectable/custom-selectable.page';
import { CustomSelectableStatePage } from 'src/app/modalpage/custom-selectable-state/custom-selectable-state.page';
import { ImageCropperPage } from 'src/app/modalpage/image-cropper/image-cropper.page';
import { ScheduleMeetingEnhancePage } from 'src/app/enhance-modalpage/schedule-meeting-enhance/schedule-meeting-enhance.page';
import { ScheduleMeetingInfoEnhancePage } from 'src/app/enhance-modalpage/schedule-meeting-info-enhance/schedule-meeting-info-enhance.page'
import { PromptModalEnhancePage } from 'src/app/enhance-modalpage/prompt-modal-enhance/prompt-modal-enhance.page';
import { PromptModalHeaderEnhancePage } from 'src/app/enhance-modalpage/prompt-modal-header-enhance/prompt-modal-header-enhance.page'
import { ReScheduleMeetingEnhancePage } from 'src/app/enhance-modalpage/re-schedule-meeting-enhance/re-schedule-meeting-enhance.page';
import { FilterDelegateEnhancePage } from 'src/app/enhance-modalpage/filter-delegate-enhance/filter-delegate-enhance.page'
import { EventMeetingRequestListEnhancePage } from 'src/app/enhance-modalpage/event-meeting-request-list-enhance/event-meeting-request-list-enhance.page';
/* End modal pages */

/* Services */
import { DelegateService } from 'src/app/services/delegate.service';
import { ChatboxEnhancePage } from './enhance-modalpage/chatbox-enhance/chatbox-enhance.page';
import { ChatboxEnhancePageModule } from './enhance-modalpage/chatbox-enhance/chatbox-enhance.module';
import { NoteSendMailEnhancePage } from './enhance-modalpage/note-send-mail-enhance/note-send-mail-enhance.page';
/* End of Services */

library.add(fas, far, fab);

// const config: SocketIoConfig = { url: 'http://panel.face2facescheduler.com:8080', options: {testingmuna: 'hehehehe'} };
const config: SocketIoConfig = { url: '', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    ChangepasswordPage,  //comment for prod
    SocialMediaPage, 
    PromptModalPage, 
    CustomSelectablePage,
    CustomSelectableStatePage,
    EventFilterPage,
    FilterDelegatePage,
    ScheduleMeetingPage,
    ScheduleMeetingInfoPage,
    PromptModalHeaderPage,
    ReScheduleMeetingPage,
    EventMeetingRequestListPage,
    CancelMeetingRequestPage,
    NoteSendMailPage,
    FileOptionPage,
    ChatboxPage,
    ImageCropperPage,
    ScheduleMeetingEnhancePage,
    ScheduleMeetingInfoEnhancePage,
    PromptModalEnhancePage,
    PromptModalHeaderEnhancePage,
    ReScheduleMeetingEnhancePage,
    FilterDelegateEnhancePage,
    EventMeetingRequestListEnhancePage,
    ChatboxEnhancePage,
    NoteSendMailEnhancePage
  ],
  entryComponents: [
    // SocialMediaPage,
    // ChangepasswordPage,
    // PromptModalPage,
    // CustomSelectablePage,
    // CustomSelectableStatePage,
    // EventFilterPage,
    // FilterDelegatePage,
    // ScheduleMeetingPage,
    // ScheduleMeetingInfoPage,
    // PromptModalHeaderPage,
    // ReScheduleMeetingPage,
    // EventMeetingRequestListPage,
    // CancelMeetingRequestPage,
    // NoteSendMailPage,
    // FileOptionPage,
    // ChatboxPage,
    // ImageCropperPage,
    // ScheduleMeetingEnhancePage,
    // ScheduleMeetingInfoEnhancePage,
    // PromptModalEnhancePage,
    // PromptModalHeaderEnhancePage,
    // ReScheduleMeetingEnhancePage,
    // FilterDelegateEnhancePage,
    // EventMeetingRequestListEnhancePage,
    // ChatboxEnhancePage,
    // NoteSendMailEnhancePage,
  ],
  imports: [
    BrowserModule,
    FormsModule, 
    ReactiveFormsModule,
    IonicModule.forRoot({
      rippleEffect: false,
      mode: 'md'
    }),
    IonicStorageModule.forRoot(),
    IonicSelectableModule,
    AppRoutingModule,
    FontAwesomeModule,
    HttpClientModule,
    // ChangepasswordPageModule,
    SocketIoModule.forRoot(config),
    ImageCropperModule,
    // Specify ng-circle-progress as an import
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ImagePicker,
    Crop,
    File,
    FileTransfer,
    FileTransferObject,
    FileOpener,
    ActionSheet,
    Camera,
    WebView,
    PhotoViewer,
    Clipboard,
    ScreenOrientation,
    Device,
    FCM,
    InAppBrowser,
    Downloader,
    Network,
    Badge,
    NgxImageCompressService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
