import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  validRoutes: string[] = ['/', '/login', '/register'];
  isOnValidRoute!: boolean;
  routeSubscription!: Subscription;

  constructor(private uiService: UiService, private router: Router) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) this.uiService.checkRoute(this.validRoutes, val.url);
    });
    this.routeSubscription = this.uiService.isOnValidRoute().subscribe(boolean => this.isOnValidRoute = boolean);
   }

  ngOnInit(): void {
  }

}
