import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VobyService } from '../_services/voby.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { HotkeysService } from '../_services/hotkeys.service';
import { ExperienceService } from '../_services/experience.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../custom/snackbar/snackbar.component';
import { Subscription } from 'rxjs';

interface RelatedWord {
  id: number;
  word: string;
}

interface PassedDataOnCreate {
  setId: number,
  allWords: RelatedWord[],
  edit: boolean
};

interface PassedDataOnEdit {
  word: Word,
  allWords: RelatedWord[],
  edit: boolean
};

interface Word {
  id: number;
  word: string;
  translation: string;
  plural: string;
  examples: {text: string, translation: string, id: number}[];
  general: string;
  related_words: {id: number, word: string}[];
}

@Component({
  selector: 'voby-word-form',
  templateUrl: './word-form.component.html',
  styleUrls: ['./word-form.component.scss']
})
export class WordFormComponent implements OnInit {

  wordForm: FormGroup;
  loading = false;
  examples: any[] = [];
  passedData: PassedDataOnCreate | PassedDataOnEdit;
  dataForParent: any = {};
  deletedExamples: any[] = [];
  focusedInput: any;
  shortcutSubscriptions$: Subscription[] = [];

  @ViewChild('relatedWordInput') relatedWordInput: ElementRef<HTMLInputElement> | undefined;
  filteredRelatedWords: RelatedWord[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    public dialogRef: MatDialogRef<WordFormComponent>,
    public voby: VobyService,
    private hotkeys: HotkeysService,
    private _snackBar: MatSnackBar,
    private exp: ExperienceService,
    @Inject(MAT_DIALOG_DATA) data: PassedDataOnCreate | PassedDataOnEdit
  ) {
    this.wordForm = new FormGroup({
      word: new FormControl(data.edit ? (data as PassedDataOnEdit).word.word : '', [Validators.required]),
      translation: new FormControl(data.edit ? (data as PassedDataOnEdit).word.translation : '', [Validators.required]),
      plural: new FormControl(data.edit ? (data as PassedDataOnEdit).word.plural : '', []),
      general: new FormControl(data.edit ? (data as PassedDataOnEdit).word.general : '', []),
      relatedWords: new FormControl(data.edit ? (data as PassedDataOnEdit).word.related_words : [], [])
    });

    if (data.edit) {
      for (const ex of (data as PassedDataOnEdit).word.examples) {
        this.wordForm.addControl(this.examples.length + 'tx', new FormControl(ex.text, [Validators.required]));
        this.wordForm.addControl(this.examples.length + 'tr', new FormControl(ex.translation, [Validators.required]));
        this.examples.push([this.examples.length, ex.id]);
      }
    } else {
      this.addExampleFormControls();
    }

    this.passedData = data;
    this.filterWords();
    this.hotkeys.shortcuts$.subscribe(shortcuts => {
      for (const s of shortcuts) {
        this.shortcutSubscriptions$.push(s.subscribe());
      }
    });
  }

  ngOnInit(): void {
    document.getElementById('word-form-container')?.addEventListener('focusin', (event: any) => {
      if(event.target.nodeName !== 'INPUT') {
        return;
      }

      this.focusedInput = event.target;
    })
  }

  ngOnDestroy(): void {
    for (const s of this.shortcutSubscriptions$) {
      s.unsubscribe();
    }
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
    this.examples.push([this.examples.length, -1]);
  }

  removeExample(id: number) {
    this.removeExampleFormControls(id);
    const splicedItems = this.examples.splice(id, 1);
    this.deletedExamples.push(splicedItems[0]);
  }

  filterWords() {
    const relatedWordsValue = this.wordForm.get('relatedWords')?.value;
    let newFilteredRelatedWords = this.passedData.allWords
      ?.filter((word) => word.word.toLowerCase().includes(this.relatedWordInput?.nativeElement.value.toLowerCase() || ''))
      .filter(w => !relatedWordsValue.find((rw: RelatedWord) => w.id === rw.id))

    if (this.passedData.edit) {
      newFilteredRelatedWords = newFilteredRelatedWords.filter(w => w.id !== (this.passedData as PassedDataOnEdit).word.id);
    }

    this.filteredRelatedWords = newFilteredRelatedWords;
  }

  removeRelatedWord(id: number) {
    const relatedWordsValue = this.wordForm.get('relatedWords')?.value;
    const index = relatedWordsValue.findIndex((w: any) => w.id === id);

    if (index >= 0) {
      relatedWordsValue.splice(index, 1);
    }

    this.filterWords();
  }

  selectRelatedWord(event: MatAutocompleteSelectedEvent) {
    const newValue = this.passedData.allWords?.find((word) => word.id == event.option.value) as RelatedWord;
    if (newValue) {
      const relatedWords = this.wordForm.get('relatedWords')?.value || [];
      const newRw = {id: newValue.id, word: newValue.word};
      (relatedWords as RelatedWord[]).push(newRw);
      this.wordForm.get('relatedWords')?.setValue(relatedWords);
    }

    if (this.relatedWordInput) {
      this.relatedWordInput.nativeElement.value = '';
    }

    this.filterWords();
  }

  submit() {
    if (this.passedData.edit) {
      this.editWord();
    } else {
      this.createWord();
    }
  }

  editWord() {
    this.voby.editWord(
      (this.passedData as PassedDataOnEdit).word.id,
      this.wordForm.get('word')?.value,
      this.wordForm.get('translation')?.value,
      this.wordForm.get('plural')?.value,
      this.wordForm.get('general')?.value,
      this.wordForm.get('relatedWords')?.value.map((w: RelatedWord) => w.id)
    )
    .subscribe({
      next: (word) => {
        const newExamples: Word[] = [];
        for (let ex of this.examples) {
          const tx = this.wordForm.get(ex[0] + 'tx')?.value;
          const tr = this.wordForm.get(ex[0] + 'tr')?.value;

          if (ex[1] !== -1) { // editing existing examples
            this.voby.updateExample(ex[1], tx, tr).subscribe({
              next: (data) => {
                newExamples.push(data as Word);
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
              complete: () => {}
            });
          } else { // create new one
            this.voby.createExample((word as any).id, tx, tr).subscribe({
              next: (data) => {
                newExamples.push(data as Word);
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
              complete: () => {}
            });
          }
        }

        for (let dex of this.deletedExamples) {
          this.voby.deleteExample(dex[1]).subscribe({
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
            complete: () => {}
          });
        }

        (word as any).examples = newExamples;
        this.dialogRef.close(word);
      },
      error: () => {
        this.loading = false;
      },
      complete: () => { 
        this.loading = false;
      }
    }); 
  }

  createWord() {
    this.voby.createWord(
      (this.passedData as PassedDataOnCreate).setId,
      this.wordForm.get('word')?.value,
      this.wordForm.get('translation')?.value,
      this.wordForm.get('plural')?.value,
      this.wordForm.get('general')?.value,
      this.wordForm.get('relatedWords')?.value.map((w: RelatedWord) => w.id)    )
    .subscribe({
      next: (word: any) => {
        this.dataForParent = { word };

        for (let ex of this.examples) {
          const tx = this.wordForm.get(ex[0] + 'tx')?.value;
          const tr = this.wordForm.get(ex[0] + 'tr')?.value;

          this.voby.createExample(word.id, tx, tr).subscribe({
            next: (data) => {
              this.dataForParent.word['examples'].push(data);
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
        this.exp.add(2);
      }
    });
  }
}
