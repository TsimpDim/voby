import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VobyService } from '../_services/voby.service';

interface PassedData {
  setId: number
};

@Component({
  selector: 'voby-word-form',
  templateUrl: './word-form.component.html',
  styleUrls: ['./word-form.component.scss']
})
export class WordFormComponent {

  wordForm: FormGroup;
  loading = false;
  examples:{text: string, translation: string}[] = []
  passedData: PassedData;

  constructor(
    public dialogRef: MatDialogRef<WordFormComponent>,
    public voby: VobyService,
    @Inject(MAT_DIALOG_DATA) data: PassedData
  ) {
    this.wordForm = new FormGroup({
      word: new FormControl('', [Validators.required]),
      translation: new FormControl('', [Validators.required]),
      general: new FormControl('', [])
    });
    this.addExampleFormControls();
    this.passedData = data;
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
    this.voby.createWord(
      this.passedData.setId,
      this.wordForm.get('word')?.value,
      this.wordForm.get('translation')?.value,
      this.wordForm.get('general')?.value
    )
    .subscribe({
      next: () => {
      },
      error: () => {
        this.loading = false;
      },
      complete: () => this.loading = false
    })
  }
}
