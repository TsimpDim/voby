import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COUNTRIES } from '../countries';
import { SnackbarComponent } from '../custom/snackbar/snackbar.component';
import { VobyService } from '../_services/voby.service';

export interface DialogData {
  className: string;
}

@Component({
  selector: 'voby-class-form',
  templateUrl: './class-form.component.html',
  styleUrls: ['./class-form.component.scss']
})
export class ClassFormComponent {

  loading = false;
  classForm: FormGroup;
  countries = COUNTRIES;
  data: {classId: number, name: string, source_language: string, target_language: string};

  constructor(
    public dialogRef: MatDialogRef<ClassFormComponent>,
    public voby: VobyService,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) data: {classId: number, name: string, source_language: string, target_language: string},
  ) {
    this.classForm = new FormGroup({
      name: new FormControl(data ? data.name : '', [Validators.required, Validators.maxLength(25)]),
      sourceLanguage: new FormControl(data ? data.source_language : '', [Validators.required]),
      targetLanguage: new FormControl(data ? data.target_language : '', [Validators.required])
    });

    this.data = data;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    if (this.data === null) {
      this.createClass(this.classForm.get('name')?.value, this.classForm.get('sourceLanguage')?.value, this.classForm.get('targetLanguage')?.value);
    } else {
      this.updateClass(this.data.classId, this.classForm.get('name')?.value, this.classForm.get('sourceLanguage')?.value, this.classForm.get('targetLanguage')?.value);
    }
  }

  updateClass(classId: number, name: string, sourceLanguage: string, targetLanguage: string) {
    this.voby.updateClass(classId, name, sourceLanguage, targetLanguage)
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

  createClass(className: string, sourceLanguage: string, targetLanguage: string) {
    this.voby.createClass(className, sourceLanguage, targetLanguage)
    .subscribe({
      next: () => {
        this.dialogRef.close();
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
