import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'
import { User } from '../User';
import { environment } from 'src/environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(environment.apiProxy + '/users');
  }
  createUser(user: User): Observable<any> {
    return this.http.post<User>(environment.apiProxy + '/register', {username: user.username, password: user.password});
  }
  deleteUser(user: User): Observable<User> {
    return this.http.delete<User>(environment.apiProxy + '/users/' + user._id);
  }
  toggleOnlineStatus(user: User): Observable<User> {
    return this.http.put<User>(environment.apiProxy + '/users/' + user._id + '/toggleOnlineStatus', {});
  }
  getActiveUser(): Observable<User> {
    return this.http.get<User>(environment.apiProxy + '/users/activeUser')
  }
}
