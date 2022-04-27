import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/User';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  message?: string;
  showAddUser!: boolean;

  subscription!: Subscription

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void { }

  userLogin(user: User) {
    this.authService.login(user).subscribe({
      next: (response) => { console.log(response) },
      error: (error) => console.log(error),
      complete: () => {
        console.log('Success!')
        this.router.navigateByUrl('/')
      }
    })
  }
}
