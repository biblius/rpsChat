import { HttpClient, HttpResponse } from '@angular/common/http';
import { User } from './../User';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  login(user: User): Observable<any> {
    return this.http.post<User>(environment.apiUrl + '/login', { username: user.username, password: user.password })
  }

  register(user: User): Observable<any> {
    return this.http.post<User>(environment.apiUrl + '/register', { username: user.username, password: user.password })
  }

  logout(): Observable<any> {
    return this.http.get(environment.apiUrl + '/logout');
  }

  getAuthorizationToken(): string {
    return document.cookie.slice(12).replace('%20', ' ');
  }

  isLoggedIn(): Observable<boolean> {
    let isLogged: boolean;
    if (document.cookie) {
      isLogged = true;
    }
    else isLogged = false
    return of(isLogged)
  }

}
