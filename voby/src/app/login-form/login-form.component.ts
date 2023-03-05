import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'voby-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {

  loginForm: FormGroup;
  loading = true;
  loggedIn = false;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.loggedIn = false;

      this.authService.login(this.loginForm.value.username, this.loginForm.value.password)
      .subscribe({
        next: (resp: any) => {
          this.loading = false;
          this.loggedIn = 'key' in resp;
          if (this.loggedIn) {
            this.authService.storeSessionToken(resp['key']);
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.loading = false;
          this.loggedIn = false;
        },
        complete: () => this.loading = false
      });
    }
  }
}
