import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'voby-word-form',
  templateUrl: './word-form.component.html',
  styleUrls: ['./word-form.component.scss']
})
export class WordFormComponent {

  wordForm: FormGroup;

  examples:{text: string, translation: string}[] = []

  constructor(
    public dialogRef: MatDialogRef<WordFormComponent>
  ) {
    this.wordForm = new FormGroup({
      word: new FormControl('', [Validators.required]),
      translation: new FormControl('', [Validators.required]),
      general: new FormControl('', [])
    });
    this.addExampleFormControls();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  addExampleFormControls() {
    this.wordForm.addControl(this.examples.length + 'tx', new FormControl('', [Validators.required]));
    this.wordForm.addControl(this.examples.length + 'tr', new FormControl('', [Validators.required]));
  }

  removeExampleFormControls(id: number) {
    this.wordForm.removeControl(id + 'tx');
    this.wordForm.removeControl(id + 'tr');
  }

  addExample() {
    this.addExampleFormControls();
    this.examples.push({text: '', translation: ''});
  }

  removeExample(id: number) {
    this.removeExampleFormControls(id);
    this.examples.splice(id, 1);
  }

  submit() {
    console.log("submitted");
  }
}
