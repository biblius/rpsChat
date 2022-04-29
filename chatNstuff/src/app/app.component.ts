import { Observable, Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = 'chatNstuff';

  isLoggedIn!: boolean;
  loggedInSub: Subscription;

  constructor(private authService: AuthService) {
    this.loggedInSub = this.authService.loggedIn.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
    })
  }

  ngOnInit() { }
}
