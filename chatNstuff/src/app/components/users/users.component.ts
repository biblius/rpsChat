import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service'
import { User } from '../../User';
import { Subscription } from 'rxjs';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  errorMessage?: string;
  showAddUser!: boolean;
  showAddUserSub!: Subscription;
  userSub!: Subscription;

  constructor(private usersService: UsersService, private uiService: UiService, private router: Router) {
    this.showAddUserSub = this.uiService.addUserSubject.subscribe(response => this.showAddUser = response)
   }

  ngOnInit(): void {
    this.userSub = this.usersService.getUsers().subscribe({
      next: (response) => this.users = response,
      error: (error) => this.errorMessage = error.statusText
    });
  }

  createUser(user: User) {
    this.usersService.createUser(user).subscribe((response) => {
      this.users.push(response.user)
    });
  }

  deleteUser(user: User) {
    this.usersService.deleteUser(user).subscribe({
      next: (user) => {},
      error: (error) => console.log(error),
      complete: () => {
        console.log("User deleted: " + user.username)
        this.users.splice(this.users.indexOf(user), 1);
      }
    })
  };

  toggleAddUser() {
    this.uiService.toggleAddUser();
  }

  toggleOnlineStatus(user: User) {
    user.onlineStatus = !user.onlineStatus;
  }

}
