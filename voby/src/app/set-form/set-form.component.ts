import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../custom/snackbar/snackbar.component';
import { VobyService } from '../_services/voby.service';

@Component({
  selector: 'voby-set-form',
  templateUrl: './set-form.component.html',
  styleUrls: ['./set-form.component.scss']
})
export class SetFormComponent {
  setForm: FormGroup;
  loading = false;
  data: {setId: number, name: string};

  constructor(
    public dialogRef: MatDialogRef<SetFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: {setId: number, name: string},
    public voby: VobyService,
    private _snackBar: MatSnackBar
  ) {
    this.setForm = new FormGroup({
      name: new FormControl(data.name, [Validators.required, Validators.maxLength(25)])
    });
    this.data = data;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    this.updateSet(this.data.setId, this.setForm.get('name')?.value)
  }

  updateSet(setId: number, name: string) {
    this.voby.updateSet(setId, name)
    .subscribe({
      next: (data) => {
        this.dialogRef.close(data);
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
}
