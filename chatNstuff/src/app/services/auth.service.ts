import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from './../User';
import { Observable, of, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn!: boolean;
  loggedIn = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {
    this.checkLogIn()
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.checkLogIn();
      }
    })
  }

  login(user: User): Observable<any> {
    return this.http.post<User>(environment.apiProxy + '/login', { username: user.username, password: user.password })
  }

  register(user: User): Observable<any> {
    return this.http.post<User>(environment.apiProxy + '/register', { username: user.username, password: user.password })
  }

  logout(): Observable<any> {
    localStorage.clear();
    this.checkLogIn();
    return this.http.get(environment.apiProxy + '/logout');
  }

  getAuthorizationToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  setAuthorizationToken(token: string): void {
    localStorage.setItem('accessToken', token)
  }

  checkLogIn() {
    if (localStorage.getItem('accessToken')) {
      this.isLoggedIn = true;
    }
    else {
      this.isLoggedIn = false;
    }
    this.loggedIn.next(this.isLoggedIn);
  }

}
