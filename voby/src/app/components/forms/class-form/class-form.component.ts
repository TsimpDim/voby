import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar as MatSnackBar } from '@angular/material/snack-bar';
import { COUNTRIES } from 'src/app/countries';
import { VobyService } from 'src/app/services/voby.service';
import { SnackbarComponent } from '../../custom/snackbar/snackbar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';


export interface DialogData {
  className: string;
}

@Component({
    selector: 'voby-class-form',
    templateUrl: './class-form.component.html',
    styleUrls: ['./class-form.component.scss'],
    providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } }],
    imports: [MatCardModule, MatIconModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatDialogModule, MatButtonModule]
})
export class ClassFormComponent {

  loading = false;
  classForm: FormGroup;
  countries = COUNTRIES;
  data: {
    classId: number,
    name: string,
    sourceLanguage: string,
    targetLanguage: string,
    firstClass: boolean,
    edit: boolean
  };

  constructor(
    public dialogRef: MatDialogRef<ClassFormComponent>,
    public voby: VobyService,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) data: {classId: number, name: string, sourceLanguage: string, targetLanguage: string, firstClass: boolean, edit: boolean},
  ) {
    this.classForm = new FormGroup({
      name: new FormControl(data ? data.name : '', [Validators.required, Validators.maxLength(25)]),
      sourceLanguage: new FormControl(data ? data.sourceLanguage : '', [Validators.required]),
      targetLanguage: new FormControl(data ? data.targetLanguage : '', [Validators.required])
    });

    this.data = data;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    if (!this.data.edit) {
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
