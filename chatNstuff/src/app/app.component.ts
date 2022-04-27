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

  constructor(private authService: AuthService, private router: Router) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.authService.isLoggedIn().subscribe(bool => {
          this.isLoggedIn = bool
        })
      }
    })
  }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe(bool => {
      this.isLoggedIn = bool
    })
  }
}
