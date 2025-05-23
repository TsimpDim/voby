import { Component, ElementRef, EventEmitter, HostListener, Inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatSnackBar as MatSnackBar } from '@angular/material/snack-bar';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { Subscription } from 'rxjs';
import { PassedDataOnWordCreate, PassedDataOnWordEdit, RelatedWord, Tag, Word } from 'src/app/interfaces';
import { WordPreviewComponent } from '../../word-preview/word-preview.component';
import { VobyService } from 'src/app/services/voby.service';
import { ExperienceService } from 'src/app/services/experience.service';
import { FormDataService } from 'src/app/services/form-data.service';
import { SnackbarComponent } from '../../custom/snackbar/snackbar.component';
import { stringSimilarity } from 'src/app/string-similarity';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { NgFor, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'voby-word-form',
    templateUrl: './word-form.component.html',
    styleUrls: ['./word-form.component.scss'],
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatChipsModule, NgFor, MatIconModule, MatAutocompleteModule, NgIf, MatOptionModule, MatButtonModule, MatDialogModule, WordPreviewComponent]
})
export class WordFormComponent implements OnInit, OnDestroy {

  wordForm: FormGroup;
  loading = false;
  examples: any[] = [];
  passedData: PassedDataOnWordCreate | PassedDataOnWordEdit;
  dataForParent: any = {};
  deletedExamples: any[] = [];
  similarWords: RelatedWord[] = [];
  suggestedRelatedWords: RelatedWord[] = [];
  formDataSubscription$: Subscription = new Subscription();

  @ViewChild('relatedWordInput') relatedWordInput: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('wordInput') wordInput: ElementRef<HTMLInputElement> | undefined;
  @ViewChild(WordPreviewComponent) wordPreviewPanel?: WordPreviewComponent;
  @Output() relatedWordClicked: EventEmitter<any> = new EventEmitter();

  filteredRelatedWords: RelatedWord[] = [];
  filteredTags: Tag[] = [];
  tagsToBeCreated: string[] = [];
  tagsToBeAttached: Tag[] = [];
  tagsToBeDetached: Tag[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  translations: {id: number, value: string}[] = [];
  translationsToBeCreated: string[] = [];
  translationsToBeDeleted: {id: number, value: string}[] = [];
  wordViewRelatedWord: Word|undefined = undefined;
  allWordsOfClass: Word[] = [];
  linkingIconsActive: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<WordFormComponent>,
    public voby: VobyService,
    private _snackBar: MatSnackBar,
    private exp: ExperienceService,
    private formData: FormDataService,
    @Inject(MAT_DIALOG_DATA) data: PassedDataOnWordCreate | PassedDataOnWordEdit
  ) {
    let initialWord = '';
    if (data.edit) {
      initialWord = (data as PassedDataOnWordEdit).word.word;
    }
    if ((data as PassedDataOnWordCreate).suggestedWord) {
      initialWord = (data as PassedDataOnWordCreate).suggestedWord;
    }

    const relatedWords: any[] = [];
    const wordTags: any[] = [];
    if (data.edit) {
      (data as PassedDataOnWordEdit).word.translations.forEach(e => {
        this.translations.push(e);
      });

      (data as PassedDataOnWordEdit).word.related_words.forEach(e => {
        relatedWords.push(e);
      });

      (data as PassedDataOnWordEdit).word.tags.forEach(e => {
        wordTags.push(e);
      });
    }

    this.wordForm = new FormGroup({
      word: new FormControl(initialWord, [Validators.required]),
      translation: new FormControl([], [Validators.required]),
      plural: new FormControl(data.edit ? (data as PassedDataOnWordEdit).word.plural : '', []),
      general: new FormControl(data.edit ? (data as PassedDataOnWordEdit).word.general : '', []),
      relatedWords: new FormControl(data.edit ? relatedWords : [], []),
      tags: new FormControl(data.edit ? wordTags : [], [])
    });

    if (data.edit) {
      for (const ex of (data as PassedDataOnWordEdit).word.examples) {
        this.wordForm.addControl(this.examples.length + 'tx', new FormControl(ex.text, [Validators.required]));
        this.wordForm.addControl(this.examples.length + 'tr', new FormControl(ex.translation, [Validators.required]));
        this.examples.push([this.examples.length, ex.id]);
      }
    } else {
      this.addExampleFormControls();
    }

    this.passedData = data;
    this.getWordsOfClass();
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

  getWordsOfClass() {
    this.voby.getWords(
      this.passedData.vclassId,
      undefined,
      undefined,
      undefined,
      false,
      1,
      999,
      true
    ).subscribe({
      next: (data: any) => {
        this.allWordsOfClass = data['results'];
        this.filterTags();
        this.filterWords();
        this.checkSimilar();
      },
      error: () => {}
    });
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
    let newFilteredRelatedWords = this.allWordsOfClass
      ?.filter((word) => word.word.toLowerCase().includes(this.relatedWordInput?.nativeElement.value.toLowerCase() || '')) // Suggest the word the user searched
      .filter(w => !relatedWordsValue.find((rw: RelatedWord) => w.id === rw.id)) // Don't show already chosen words

    if (this.passedData.edit) {
      newFilteredRelatedWords = newFilteredRelatedWords.filter(w => w.id !== (this.passedData as PassedDataOnWordEdit).word.id);
    }

    this.filteredRelatedWords = newFilteredRelatedWords;
  }

  filterTags() {
    const input = this.tagInput?.nativeElement.value.toLowerCase();
    const currentTags = this.wordForm.get('tags')?.value as Tag[];
    let newTagsValue = this.passedData.allTags.filter(tag => currentTags.findIndex(ct => ct.id === tag.id) === -1);

    if (input) {
      newTagsValue = this.passedData.allTags
        ?.filter(tag => tag.value.toLowerCase().includes(this.tagInput?.nativeElement.value.toLowerCase() || ''))
        .filter(tag => !currentTags.filter(ct => ct.id === tag.id));
    }

    this.filteredTags = newTagsValue;
  }

  removeRelatedWord(id: number) {
    const relatedWordsValue = this.wordForm.get('relatedWords')?.value;
    const index = relatedWordsValue.findIndex((w: any) => w.id === id);

    if (index >= 0) {
      relatedWordsValue.splice(index, 1);
    }

    this.filterWords();
    this.checkSimilar();
  }

  selectRelatedWord(event: any, wordId: number) {
    if (event.ctrlKey) {
      const word = this.allWordsOfClass.find(rW => rW.id == wordId);
      const setId = (this.passedData as PassedDataOnWordCreate).setId;

      if (setId && word) {
        if (!word.sets.includes(setId)) {
          word.sets.push(setId);
          this.voby.editSets(word.sets, wordId).subscribe({
            next: () => {
              this.voby.getWord(word.id).subscribe(word => {
                this.dialogRef.close({word});
              });
            }
          });
        } else {
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: {
              message: `The word '${word.word}' is already linked to the current set`,
              icon: 'info'
            },
            duration: 3 * 1000
          });
        }
      }
    } else {
      const newValue = this.allWordsOfClass?.find((word) => word.id === wordId) as RelatedWord;
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
      this.checkSimilar();
    }
  }

  selectTag(event: MatAutocompleteSelectedEvent) {
    const selectedTag = this.passedData.allTags?.find((tag: Tag) => tag.id == event.option.value) as Tag;
    if (selectedTag) {
      const currentTags = this.wordForm.get('tags')?.value || [];
      (currentTags as Tag[]).push(selectedTag);
      
      // On Edit, we should check if the tag.words attribute already contains the word id
      // On Create, we do not want to create a new tag, but add the word.id to the selected tag
      if (this.passedData.edit) {
        if (!selectedTag.word.includes((this.passedData as PassedDataOnWordEdit).word.id)) {
          this.tagsToBeAttached.push(selectedTag);
        } else {
          // This is to cover the case where we are editing a word, de-selecting a word that was already attached to the word by mistake,
          // and then selecting the same tag again. In this case the tag should not be in the 'toBeDetached' list any longer, and instead
          // it should not be touched at all
          const indexToRemove = this.tagsToBeDetached.findIndex(t => t.id === selectedTag.id);
          this.tagsToBeDetached.splice(indexToRemove, 1);
        }
      } else {
        this.tagsToBeAttached.push(selectedTag);
      }

      this.wordForm.get('tags')?.setValue(currentTags);
    }

    if (this.tagInput) {
      this.tagInput.nativeElement.value = '';
    }

    this.filterTags();
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
      (this.passedData as PassedDataOnWordEdit).word.id,
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

        for (let tag of this.tagsToBeDetached) {
          this.voby.removeWordFromTag(tag.id, word.id).subscribe({
            next: () => {
              const deletedIndex = word.tags.findIndex((t:any) => t.id === tag.id);
              this.dataForParent.word.tags.splice(deletedIndex, 1);
            },
          });
        }

        this.dataForParent.newTags = [];
        for (let tag of this.tagsToBeCreated) {
          this.voby.createTag(word.id, tag).subscribe({
            next: (data) => {
              this.dataForParent.word.tags.push(data);
              this.dataForParent.newTags.push(data);
            },
          });
        }

        for (let tag of this.tagsToBeAttached) {
          this.voby.addWordToTag(tag.id, word.id).subscribe({
            next: () => {
              this.dataForParent.word.tags.push(tag);
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
      [(this.passedData as PassedDataOnWordCreate).setId],
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
              this.dataForParent = undefined;
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

        this.dataForParent.newTags = [];
        for (let tagToCreate of this.tagsToBeCreated) {
          this.voby.createTag(word.id, tagToCreate).subscribe({
            next: (data) => {
              this.dataForParent.word.tags.push(data);
              this.dataForParent.newTags.push(data);
            }
          });
        }

        for (let tagToAttach of this.tagsToBeAttached) {
          this.voby.addWordToTag(tagToAttach.id, word.id).subscribe({
            next: () => {
              this.dataForParent.word.tags.push(tagToAttach);
            }
          });
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

  relatedWordHover(event: MouseEvent, id:number){ 
    this.voby.getWord(id).subscribe({
      next: (data: any) => {
        this.wordViewRelatedWord = data as Word;
        if (this.wordPreviewPanel) {
          const { clientX, clientY } = event;
          let posX = clientX;
          let posY = clientY;

          const hoverTargetRect = (event.target as HTMLElement).getBoundingClientRect();
          const offsetY = 0;
          const offsetX = 0;

          posX = hoverTargetRect.left + offsetX;
          posY = hoverTargetRect.bottom + offsetY;

          this.wordPreviewPanel.updatePosition(posX, posY);
        }
      },
      error: () => {}
    })  
  }

  relatedWordExit() {
    setTimeout(() => {
      this.wordViewRelatedWord = undefined;
    }, 500);
  }

  checkSimilar() {
    const word = this.wordInput?.nativeElement.value.toLowerCase() || '';
    const similarWords = this.allWordsOfClass.filter(w => stringSimilarity(w.word, word) >= 0.8);
    let suggestedRelatedWords: Word[] = this.allWordsOfClass
      .filter(w => stringSimilarity(w.word, word) >= 0.8 || (word.length > 5 && w.word.includes(word)))
      .filter(w => !(this.wordForm.get('relatedWords')?.value.map((rW: RelatedWord) => rW.id).includes(w.id))) // Don't suggest already chosen words
      .filter((w, i, arr) => arr.findIndex(v => v.id === w.id) === i); // Don't show words with the same ID twice
      
    if (this.passedData.edit) {
      const wordBeingEdited = suggestedRelatedWords.findIndex(w => w.id == (this.passedData as PassedDataOnWordEdit).word.id);
      suggestedRelatedWords.splice(wordBeingEdited, 1);
    }
    
    this.similarWords = similarWords;
    this.suggestedRelatedWords = suggestedRelatedWords;
  }

  addTranslation(event: MatChipInputEvent): void {
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

  removeTranslation(translation: string): void {
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

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      const currentTags = this.wordForm.get('tags')?.value;
      if (currentTags.includes(value)) {
        return;
      }

      if (!currentTags) {
        this.wordForm.patchValue({'tags':[{id: 0, value: value}]});
      } else {
        ((currentTags as any[]).push({id: 0, value: value}))
        this.wordForm.patchValue({'tags': currentTags});
      }

      if (this.passedData.allTags.findIndex(f => f.value === value) === -1) {
        this.tagsToBeCreated.push(value);
      }
    }

    event.chipInput!.clear();
  }

  removeTag(tagToBeRemoved: Tag): void {
    const currentTags = this.wordForm.get('tags')?.value as Tag[];
    if (!currentTags) {
      return;
    }

    const index = currentTags.findIndex(o => o.value === tagToBeRemoved.value);
    if (index >= 0) {
      this.tagsToBeDetached.push(currentTags.splice(index, 1)[0]);
      this.wordForm.patchValue({'tags': currentTags});
    }

    const indexCreated = this.tagsToBeCreated.findIndex(o => o === tagToBeRemoved.value);
    if (indexCreated >= 0) {
      this.tagsToBeCreated.splice(index, 1);
    }

    const indexAttached = this.tagsToBeAttached.findIndex(o => o.value === tagToBeRemoved.value);
    if (indexAttached >= 0) {
      this.tagsToBeAttached.splice(index, 1);
    }

    this.filterTags();
  }

  emitRelatedWordClicked() {
    this.relatedWordClicked.emit(this.wordViewRelatedWord);
  }

  @HostListener('document:keydown.control', ['$event']) 
  activateLinkIcon(event: KeyboardEvent) {
    this.linkingIconsActive = true;
  }

  @HostListener('document:keyup.control', ['$event']) 
  deactivateLinkIcon(event: KeyboardEvent) {
    this.linkingIconsActive = false;
  }
}
