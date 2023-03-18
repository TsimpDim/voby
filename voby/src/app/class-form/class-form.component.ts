import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { COUNTRIES } from '../countries';
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

  constructor(
    public dialogRef: MatDialogRef<ClassFormComponent>,
    public voby: VobyService
  ) {
    this.classForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      sourceLanguage: new FormControl('', [Validators.required]),
      targetLanguage: new FormControl('', [Validators.required])
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    this.createClass(this.classForm.get('name')?.value, this.classForm.get('sourceLanguage')?.value, this.classForm.get('targetLanguage')?.value);
  }

  createClass(className: string, sourceLanguage: string, targetLanguage: string) {
    this.voby.createClasses(className, sourceLanguage, targetLanguage)
    .subscribe({
      next: () => {
        this.dialogRef.close();
      },
      error: () => {
        this.loading = false;
      },
      complete: () => this.loading = false
    })
  }
}
