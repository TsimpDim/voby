import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { COUNTRIES } from 'src/app/countries';
import { VobyService } from 'src/app/services/voby.service';
import { SnackbarComponent } from '../../custom/snackbar/snackbar.component';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyOptionModule } from '@angular/material/legacy-core';
import { MatLegacySelectModule } from '@angular/material/legacy-select';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { NgIf, NgFor } from '@angular/common';

export interface DialogData {
  className: string;
}

@Component({
    selector: 'voby-class-form',
    templateUrl: './class-form.component.html',
    styleUrls: ['./class-form.component.scss'],
    standalone: true,
    imports: [NgIf, MatLegacyCardModule, MatIconModule, ReactiveFormsModule, MatLegacyFormFieldModule, MatLegacyInputModule, MatLegacySelectModule, NgFor, MatLegacyOptionModule, MatLegacyDialogModule, MatLegacyButtonModule]
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
