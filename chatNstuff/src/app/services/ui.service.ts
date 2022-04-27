import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class UiService {
  private showAddUser: boolean = false;
  addUserSubject = new Subject<any>();
  private hasRouteSubject = new Subject<any>();

  constructor(private router: Router) {
    router.events.subscribe(val => {
      if(val instanceof NavigationEnd){
        this.showAddUser = false;
      }
    })
   }
  
  toggleAddUser(): void {
    this.showAddUser = !this.showAddUser;
    this.addUserSubject.next(this.showAddUser);
  }

  checkRoute(validRoutes: string[], currentRoute: string) {
    let isOnValidRoute = false;
    validRoutes.forEach(route => {
      if (route == currentRoute) {
        isOnValidRoute = true;
        return;
      }
    })
    this.hasRouteSubject.next(isOnValidRoute);
  }

  isOnValidRoute(): Observable<any> {
    return this.hasRouteSubject.asObservable();
  }
}
