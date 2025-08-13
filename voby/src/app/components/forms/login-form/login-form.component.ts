import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar as MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ExperienceService } from 'src/app/services/experience.service';
import { SnackbarComponent } from '../../custom/snackbar/snackbar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'voby-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
    standalone: true,
    providers: [{provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}],
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule]
})
export class LoginFormComponent {

  loginForm: FormGroup;
  loading = true;
  loggedIn = false;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private _snackBar: MatSnackBar, 
    private exp: ExperienceService
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
            this.exp.forceRefresh();
            this.router.navigate(['/']);
          }
        },
        error: (error: any) => {
          this.loading = false;
          this.loggedIn = false;
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: {
              message: 'Error: ' + error.statusText,
              icon: 'error'
            },
            duration: 3 * 1000
          });
        },
        complete: () => this.loading = false
      });
    }
  }
}
