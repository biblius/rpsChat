import { Component, OnInit } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  title: string = 'rpsChat';
  isLoggedIn!: boolean;
  loggedInSub!: Subscription;

  constructor(private uiService: UiService, private authService: AuthService, private router: Router) {
    this.loggedInSub = router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.authService.isLoggedIn().subscribe({
          next: (response) => { this.isLoggedIn = response }
        })
      };
    });
  }

  ngOnInit(): void {
  }

  logout() {
    console.log('logout')
    this.authService.logout().subscribe({
      complete: () => {
        this.router.navigateByUrl('/login')
      }
    });
  }

}