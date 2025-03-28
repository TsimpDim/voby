import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarComponent } from '../../custom/snackbar/snackbar.component';

@Component({
  selector: 'voby-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {

  registerForm: FormGroup;
  loading = false;
  registered = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {
    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password1: new FormControl('', [Validators.required, Validators.minLength(8)]),
      password2: new FormControl('', [Validators.required, Validators.minLength(8)]),
    }, { validators: this.checkPasswords});
  }

  register() {
    if (this.registerForm.valid) {
      this.loading = true;

      this.authService.register(
        this.registerForm.value.username, this.registerForm.value.password1, this.registerForm.value.password2
      ).subscribe({
        next: (resp) => {
          this.registered = 'key' in resp;
          if (this.registered) {
            this.router.navigate(['login']);
          }
        },
        error: (error: any) => {
          this.loading = false;
          this.registered = false;
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: {
              message: 'Error: ' + error.statusText,
              icon: 'error'
            },
            duration: 3 * 1000
          });
        },
        complete: () => this.loading = false
      })

      this.loading = false;
    }
  }

  checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => { 
    let pass = group.get('password1')?.value;
    let confirmPass = group.get('password2')?.value
    return pass === confirmPass ? null : { notSame: true }
  }
}
