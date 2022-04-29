import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/User';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  userRegister(user: User) {
    this.authService.register(user).subscribe({
      next: (response) => {
        this.authService.setAuthorizationToken(response.accessToken)
      },
      error: (error) => console.log(error),
      complete: () => {
        console.log('Success!')
        this.router.navigateByUrl('/')
      }
    })
  }
}
