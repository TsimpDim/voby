import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar as MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserShortcut } from 'src/app/interfaces';
import { VobyService } from 'src/app/services/voby.service';
import { SnackbarComponent } from 'src/app/components/custom/snackbar/snackbar.component';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LoadingIndComponent } from '../../components/custom/loading-ind/loading-ind.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'voby-options',
    templateUrl: './options.component.html',
    styleUrls: ['./options.component.scss'],
    imports: [NgIf, LoadingIndComponent, MatCardModule, NgFor, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatOptionModule, MatInputModule, ReactiveFormsModule]
})
export class OptionsComponent implements OnInit {
  userShortcuts: UserShortcut[] = [];
  loading = true;
  shortcutsForm: FormGroup = new FormGroup({});
  options: any[] = [];
  defaultShortcuts: UserShortcut[] = [
    {
      key_1: 'ALT/META',
      key_2: 'W',
      result: 'Create word',
      id: -1
    },
    {
      key_1: 'ALT/META',
      key_2: 'E',
      result: 'Edit word',
      id: -2
    },
    {
      key_1: 'ALT/META',
      key_2: 'F',
      result: 'Search',
      id: -3
    }
  ];

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
