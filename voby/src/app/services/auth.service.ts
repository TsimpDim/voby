import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(username: String, password: String) {
    return this.http.post(environment.apiUrl + '/auth/login/', {
      username: username,
      password: password,
    });
  }

  register(username: String, password1: String, password2: String) {
    return this.http.post(environment.apiUrl + '/auth/registration/', {
      username: username,
      password1: password1,
      password2: password2,
    });
  }

  logout() {
    if (this.getSessionToken()) {
      this.deleteSessionToken();
      this.router.navigate(['/login']);
    }
  }

  deleteSessionToken() {
    localStorage.removeItem('sessionid');
  }

  storeSessionToken(token: string) {
    localStorage.setItem('sessionid', token);
  }

  getSessionToken() {
    return localStorage.getItem('sessionid');
  }

  getIsLoggedIn() {
    return this.getSessionToken() !== null;
  }
}
