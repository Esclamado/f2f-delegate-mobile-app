
import { Injectable, Inject } from '@angular/core';
import { cookie } from './cookie';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class environment {

    constructor(
        private http: HttpClient,
        private cookie: cookie
    ) {}

    

    /* 


    
    getToken():string{
        return 'true';
    }

    deleteCookie():any{
        return this.cookie.deleteCookie('token', '.'+this.domain);
    }

    
    


    showLoader(){
        this.document.body.classList.add("loading");
    }

    hideLoader(){
        this.document.body.classList.remove("loading");
    } */
}