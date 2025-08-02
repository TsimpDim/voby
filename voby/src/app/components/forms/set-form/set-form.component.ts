import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar as MatSnackBar } from '@angular/material/snack-bar';
import { VobyService } from 'src/app/services/voby.service';
import { SnackbarComponent } from '../../custom/snackbar/snackbar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';


@Component({
    selector: 'voby-set-form',
    templateUrl: './set-form.component.html',
    styleUrls: ['./set-form.component.scss'],
    standalone: true,
    providers: [{provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}],
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatButtonModule]
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
