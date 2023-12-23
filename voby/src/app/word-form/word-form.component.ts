import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VobyService } from '../_services/voby.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ExperienceService } from '../_services/experience.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../custom/snackbar/snackbar.component';
import { stringSimilarity } from '../string-similarity';
import { MatChipInputEvent } from '@angular/material/chips';
import { FormDataService } from '../_services/form-data.service';
import { Subscription } from 'rxjs';

interface RelatedWord {
  id: number;
  word: string;
}

interface PassedDataOnCreate {
  setId: number,
  allWords: RelatedWord[],
  edit: boolean,
  suggestedWord: string
};

interface PassedDataOnEdit {
  word: Word,
  allWords: RelatedWord[],
  edit: boolean
};

interface Word {
  id: number;
  word: string;
  translations: {id: number, value: string}[];
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
export class WordFormComponent implements OnInit, OnDestroy {

  wordForm: FormGroup;
  loading = false;
  examples: any[] = [];
  passedData: PassedDataOnCreate | PassedDataOnEdit;
  dataForParent: any = {};
  deletedExamples: any[] = [];
  similarWords: RelatedWord[] = [];
  formDataSubscription$: Subscription = new Subscription();

  @ViewChild('relatedWordInput') relatedWordInput: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('wordInput') wordInput: ElementRef<HTMLInputElement> | undefined;

  filteredRelatedWords: RelatedWord[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  translations: {id: number, value: string}[] = [];
  translationsToBeCreated: string[] = [];
  translationsToBeDeleted: {id: number, value: string}[] = [];

  constructor(
    public dialogRef: MatDialogRef<WordFormComponent>,
    public voby: VobyService,
    private _snackBar: MatSnackBar,
    private exp: ExperienceService,
    private formData: FormDataService,
    @Inject(MAT_DIALOG_DATA) data: PassedDataOnCreate | PassedDataOnEdit
  ) {
    let initialWord = '';
    if (data.edit) {
      initialWord = (data as PassedDataOnEdit).word.word;
    }
    if ((data as PassedDataOnCreate).suggestedWord) {
      initialWord = (data as PassedDataOnCreate).suggestedWord;
    }

    const relatedWords: any[] = [];
    if (data.edit) {
      (data as PassedDataOnEdit).word.translations.forEach(e => {
        this.translations.push(e);
      });

      (data as PassedDataOnEdit).word.related_words.forEach(e => {
        relatedWords.push(e);
      })
    }

    this.wordForm = new FormGroup({
      word: new FormControl(initialWord, [Validators.required]),
      translation: new FormControl([], [Validators.required]),
      plural: new FormControl(data.edit ? (data as PassedDataOnEdit).word.plural : '', []),
      general: new FormControl(data.edit ? (data as PassedDataOnEdit).word.general : '', []),
      relatedWords: new FormControl(data.edit ? relatedWords : [], [])
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
  }

  ngOnDestroy(): void {
    this.formDataSubscription$?.unsubscribe();
    this.formData.clearQueue();
  }

  ngOnInit(): void {
    this.formDataSubscription$ = this.formData.formControlValue$.subscribe((change) => {
      if (change && this.wordForm && change.fieldName !== 'null') {
        this.wordForm.get(change.fieldName)?.setValue(change.newValue);
      }
    });
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
    if (this.translations.length === 0) {
      return;
    }
    this.voby.editWord(
      (this.passedData as PassedDataOnEdit).word.id,
      this.wordForm.get('word')?.value,
      this.wordForm.get('plural')?.value,
      this.wordForm.get('general')?.value,
      this.wordForm.get('relatedWords')?.value.map((w: RelatedWord) => w.id)
    )
    .subscribe({
      next: (word: any) => {
        const newExamples: Word[] = [];
        this.dataForParent = { word };

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
              }
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
              }
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

        this.dataForParent.word.examples = newExamples;

        for (let translation of this.translationsToBeCreated) {
          this.voby.createTranslation(word.id, translation).subscribe({
            next: (data) => {
              this.dataForParent.word.translations.push(data);
              const updateId = this.translations.findIndex(t => t.value === translation);
              this.translations[updateId].id = (data as any).id;
            },
            error: (error: any) => {
              this.loading = false;
              this.dataForParent = undefined;
              this._snackBar.openFromComponent(SnackbarComponent, {
                data: {
                  message: 'Error: ' + error.statusText,
                  icon: 'error'
                },
                duration: 3 * 1000
              });
            }
          })
        }

        for (let translation of this.translationsToBeDeleted) {
          this.voby.deleteTranslation(translation.id).subscribe({
            next: () => {
              const deletedIndex = this.dataForParent.word.translations.findIndex((t:any) => t.id === translation.id);
              this.dataForParent.word.translations.splice(deletedIndex, 1);
            },
          });
        }

        this.dialogRef.close(this.dataForParent);
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
    if (this.translations.length === 0) {
      return;
    }
    this.voby.createWord(
      (this.passedData as PassedDataOnCreate).setId,
      this.wordForm.get('word')?.value,
      this.wordForm.get('plural')?.value,
      this.wordForm.get('general')?.value,
      this.wordForm.get('relatedWords')?.value.map((w: RelatedWord) => w.id)
    )
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
              this.voby.deleteWord(word.id).subscribe();
              this.dataForParent = undefined
              this._snackBar.openFromComponent(SnackbarComponent, {
                data: {
                  message: 'Error: ' + error.statusText,
                  icon: 'error'
                },
                duration: 3 * 1000
              });
            }
          });
        }

        for (let translation of this.translationsToBeCreated) {
          this.voby.createTranslation(word.id, translation).subscribe({
            next: (data) => {
              this.dataForParent.word.translations.push(data);
              const updateId = this.translations.findIndex(t => t.value === translation);
              this.translations[updateId].id = (data as any).id;
            },
            error: (error: any) => {
              this.loading = false;
              this.voby.deleteWord(word.id).subscribe();
              this.dataForParent = undefined;
              this._snackBar.openFromComponent(SnackbarComponent, {
                data: {
                  message: 'Error: ' + error.statusText,
                  icon: 'error'
                },
                duration: 3 * 1000
              });
            }
          })
        }

        this.dialogRef.close(this.dataForParent);
      },
      error: () => {
        this.loading = false;
      },
      complete: () => { 
        this.loading = false;
        this.exp.add(2);
      }
    });
  }

  checkSimilar() {
    const word = this.wordInput?.nativeElement.value.toLowerCase() || '';
    const similarWords = (this.passedData as PassedDataOnCreate | PassedDataOnEdit).allWords.filter(w => stringSimilarity(w.word, word) >= 0.8);
    this.similarWords = similarWords;
  }

  displaySimilarWords() {
    return this.similarWords.map((w: any) => `${w.word} (${w.set_name})`).join('< | >');
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.translations.push({id: 0, value: value});
      const translationsValue = this.wordForm.get('translation')?.value;
      if (!translationsValue) {
        this.wordForm.patchValue({'translation':[{id: 0, value: value}]});
      } else {
        ((translationsValue as any[]).push({id: 0, value: value}))
        this.wordForm.patchValue({'translation': translationsValue});
      }

      this.translationsToBeCreated.push(value);
    }

    event.chipInput!.clear();
  }

  remove(translation: string): void {
    const index = this.translations.findIndex(o => o.value === translation);
    if (index >= 0) {
      this.translationsToBeDeleted.push(this.translations.splice(index, 1)[0]);
      const translationsValue = this.wordForm.get('translation')?.value;
      if (translationsValue) {
        translationsValue.splice(index, 1);
        this.wordForm.patchValue({'translation': translationsValue});
      }
    }

    const indexCreated = this.translationsToBeCreated.findIndex(o => o === translation);
    if (indexCreated >= 0) {
      this.translationsToBeCreated.splice(index, 1);
    }
  }
}
