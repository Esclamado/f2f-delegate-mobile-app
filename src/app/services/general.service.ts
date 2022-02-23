import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { EnvService } from 'src/app/lib/env.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  constructor(
    private http: HttpClient,
    private router: Router,
    public env: EnvService,
  ) {}

  public memberActive = false;

  post(url, postData): Observable<any> {
    let httpOptions = this.env.getHttpOptions();
    return this.http.post<any>(url, postData, httpOptions);
  }

  get(url): Observable<any> {
    let httpOptions = this.env.getHttpOptions();
    return this.http.get<any>(url, httpOptions);
  }
}
