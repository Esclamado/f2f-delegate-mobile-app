import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/lib/env.service';
import { Urls } from 'src/app/lib/urls';

// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
// import { File } from '@ionic-native/file';

@Injectable({
  providedIn: 'root',
})
export class NotesService {

  constructor(
    public env: EnvService
  ) { }

  save(data: any){

    const formData = new FormData();
    for (let propt in data) {
      formData.append(propt,data[propt]);
    }

    let url = this.env.getUrl(Urls.mapi_notes_save);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

  /**
   * make an API call to fetch all notes
   * @param params 
   */
  getAllNotes(params){
    let url = this.env.getUrl(Urls.mapi_notes_get);
    url += this.env.createUrlParam(params);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  /**
   * retrieve specific note by other delegate id 
   * and meeting schedule id
   * or the note id itself
   * @param params 
   *    - msid  = meeting schedule id
   *    - myedid = current user's event_delegate_id
   *    - other_deid = current user's scheduled event_delegate_id
   *    OR
   *    - note_id = note id
   */
  getNote(params){
    let url = this.env.getUrl(Urls.mapi_event_note);
    url += this.env.createUrlParam(params);
    return this.env.http.get<any>(url, this.env.getHttpOptions());
  }

  /**
   * send the note to delegate
   * @param formData 
   */
  sendToEmail(formData){
    let url = this.env.getUrl(Urls.mapi_notes_sendtoemail);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }

  deleteNote(formData) {
    let url = this.env.getUrl(Urls.mapi_notes_delete);
    return this.env.http.post<any>(url, formData, this.env.getHttpOptions());
  }
}
