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
  examples: number[] = [];
  passedData: PassedData;
  dataForParent: any = {};

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

  removeExampleFormControls(idx: number) {
    this.wordForm.removeControl(idx + 'tx');
    this.wordForm.removeControl(idx + 'tr');
  }

  addExample() {
    this.addExampleFormControls();
    this.examples.push(this.examples.length);
  }

  removeExample(id: number) {
    this.removeExampleFormControls(id);
    this.examples.splice(id, 1);
  }

  submit() {
    console.log(this.wordForm.controls);

    this.voby.createWord(
      this.passedData.setId,
      this.wordForm.get('word')?.value,
      this.wordForm.get('translation')?.value,
      this.wordForm.get('general')?.value
    )
    .subscribe({
      next: (word: any) => {
        this.dataForParent = { word };

        for (let ex of this.examples) {
          const tx = this.wordForm.get(ex + 'tx')?.value;
          const tr = this.wordForm.get(ex + 'tr')?.value;

          this.voby.createExample(word.id, tx, tr).subscribe({
            next: (data) => {
              if (!Object.keys(this.dataForParent).includes('examples')) {
                this.dataForParent['examples'] = [data];
              } else {
                this.dataForParent['examples'].push(data);
              }
            },
            error: () => {},
            complete: () => {
              this.dialogRef.close(this.dataForParent);
            }
          });
        }
      },
      error: () => {
        this.loading = false;
      },
      complete: () => { 
        this.loading = false;
        this.dialogRef.close(this.dataForParent);
      }
    });
  }
}
