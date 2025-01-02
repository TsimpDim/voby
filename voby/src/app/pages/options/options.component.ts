import { Component, OnInit, ViewChild } from '@angular/core';
import { VobyService } from '../_services/voby.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SnackbarComponent } from '../custom/snackbar/snackbar.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserShortcut } from '../interfaces';

@Component({
  selector: 'voby-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  userShortcuts: UserShortcut[] = [];
  loading = true;
  shortcutsForm: FormGroup = new FormGroup({});
  options: any[] = [];
  @ViewChild('numTestQuestions') numTestQ: any;

  constructor(
    private voby: VobyService,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.getUserShortcuts();
    this.getOptions();
  }

  initializeForm() {
    for (const [idx, us] of this.userShortcuts.entries()) {
      this.shortcutsForm.addControl(idx + 'k1', new FormControl(us.key_1, [Validators.required]))
      this.shortcutsForm.addControl(idx + 'k2', new FormControl(us.key_2, [Validators.required]))
      this.shortcutsForm.addControl(idx + 'r', new FormControl(us.result, [Validators.required]))
    }

    this.shortcutsForm
    .valueChanges // subscribe to all changes
    .subscribe(
      data => {
        if (this.shortcutsForm.valid) {
          this.updateUserShortcuts();
        }
      }
    );
  }

  getOptions() {
    this.voby.getOptions()
    .subscribe({
      next: (data: any) => {
        this.options = data;
        this.numTestQ.nativeElement.value = data.find((o:any) => o.key === 'numTestQuestions').value;
      },
      error: (error: any) => {
        this.loading = false;
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
  }

  getUserShortcuts() {
    this.voby.getUserShortcuts()
    .subscribe({
      next: (data: any) => {
        this.userShortcuts = data;
        this.initializeForm();
      },
      error: (error: any) => {
        this.loading = false;
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
  }

  addUserShortcut() {
    this.voby.createUserShortcut('ALT', 'a', 'ä')
    .subscribe({
      next: (data: any) => {
        this.userShortcuts.push(data);
        this.initializeForm();
      },
      error: (error: any) => {
        this.loading = false;
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
  }

  deleteUserShortcut(id: number) {
    this.voby.deleteUserShortcut(id)
    .subscribe({
      next: () => {
        this.userShortcuts.splice(this.userShortcuts.findIndex((us: any) => us.id === id), 1);
      },
      error: (error: any) => {
        this.loading = false;
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
  }

  updateUserShortcuts() {
    for (const [idx, us] of this.userShortcuts.entries()) {
      const k1 = this.shortcutsForm.get(idx + 'k1')?.value;
      const k2 = this.shortcutsForm.get(idx + 'k2')?.value;
      const r = this.shortcutsForm.get(idx + 'r')?.value;

      this.voby.updateUserShortcut(us.id, k1, k2, r)
      .subscribe({
        next: () => {},
        error: (error: any) => {
          this.loading = false;
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: {
              message: 'Error: ' + error.statusText,
              icon: 'error'
            },
            duration: 3 * 1000
          });
        },
        complete: () => {
          this.loading = false;
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: {
              message: 'Updated shortcut',
              icon: 'done'
            },
            duration: 3 * 1000
          });
        }
      })
    }
  }

  saveOptions() {
    const numTestQ = this.numTestQ?.nativeElement.value;
    this.voby.updateOptions(numTestQ).subscribe({
      next: () => {},
      error: (error: any) => {
        this.loading = false;
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: 'Error: ' + error.statusText,
            icon: 'error'
          },
          duration: 3 * 1000
        });
      },
      complete: () => {
        this.loading = false;
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: 'Updated shortcut',
            icon: 'done'
          },
          duration: 3 * 1000
        });
      }
    })
  }
}
