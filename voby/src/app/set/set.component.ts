import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { getCountryEmoji } from '../countries';
import { SnackbarComponent } from '../custom/snackbar/snackbar.component';
import { SetFormComponent } from '../set-form/set-form.component';
import { WordFormComponent } from '../word-form/word-form.component';
import { VobyService } from '../_services/voby.service';
import { HotkeysService } from '../_services/hotkeys.service';
import { Tag, Word } from '../interfaces';

@Component({
  selector: 'voby-set',
  templateUrl: './set.component.html',
  styleUrls: ['./set.component.scss']
})
export class SetComponent implements OnInit {

  id: number = -1;
  @ViewChild('searchInput') searchInput: ElementRef | undefined;

  selectedWord: Word | undefined = undefined;
  filteredWords: Word[] = [];
  paramsSubscription$: Subscription | undefined;
  setWords: any | undefined;
  setWordsToday: number = 0;
  set: any | undefined;
  vclass: any | undefined;
  loading = true;
  showingFavorites = false;
  allTags: Tag[] = [];
  searchTags: Tag[] = [];
  selectedTags: Tag[] = [];
  allWords: any[] = [];
  getCountryEmoji = getCountryEmoji;
  shortcutSubscriptions$: Subscription[] = [];
  suggestedWord: string | undefined = undefined;
  tagFrequency: any = {};
  wordViewRelatedWord: Word|undefined = undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    public voby: VobyService,
    private hotkeys: HotkeysService,
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.vclass = state['selectedClass'];
      this.set = state['selectedSet']['name'];
    }

    this.hotkeys.shortcuts$.subscribe(shortcuts => {
      for (const s of this.shortcutSubscriptions$) {
        s.unsubscribe();
      }

      this.shortcutSubscriptions$ = [];

      for (const s of shortcuts) {
        this.shortcutSubscriptions$.push(s.subscribe());
      }
    });
  }

  ngOnInit() {
    this.paramsSubscription$ = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
    });

    if (!this.setWords) {
      this.getSetWords(this.id);
    } else {
      this.search();
    }

    this.getAllTags();
  }

  ngOnDestroy() {
    this.paramsSubscription$?.unsubscribe();
    for (const s of this.shortcutSubscriptions$) {
      s.unsubscribe();
    }
  }

  selectWord(id: number) {
    this.selectedWord = this.setWords.find((o: any) => o.id === id);
  }

  removeTag(tagId: number) {
    const indexToRemove = this.selectedTags.findIndex(t => t.id === tagId);
    const removedTag = this.selectedTags.splice(indexToRemove, 1);
    this.searchTags.push(removedTag[0]);
    this.search();
    this.calculateTagFrequency();
  }

  addTagToSearch(selectedTagId: number) {
    const newTag = this.allTags.find((tag) => tag.id == selectedTagId) as Tag;
    if (newTag) {
      if (!this.selectedTags.includes(newTag)) {
        this.selectedTags.push(newTag);
      }

      const tagIndexToBeRemoved = this.searchTags.findIndex(t => t.id === newTag.id);
      this.searchTags.splice(tagIndexToBeRemoved, 1);
    }

    this.search();
  }

  createWord() {
    const dialogRef = this.dialog.open(WordFormComponent, {
      width: '30%',
      data: {
        setId: this.set.id,
        allWords: this.allWords,
        allTags: this.allTags,
        edit: false,
        suggestedWord: this.suggestedWord
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (!data) {
        return;
      }

      if (localStorage.getItem('sort') === 'date_asc') {
        this.setWords.push(data.word);
      } else {
        this.setWords.unshift(data.word);
      }

      if (data.word.related_words) {
        data.word.related_words.forEach((rw: any) => {
          const idx = this.setWords.findIndex((w: any) => w.id === rw.id);
          if (idx !== -1) {
            this.setWords[idx].related_words.push({id:data.word.id, word:data.word.word, set:data.word.set});
          }
        });
      }

      this.allWords.push({id: data.word.id, word: data.word.word, set: data.word.set});
      this.allTags.push(...data.newTags);
      this.setWordsToday += 1;
      this.calculateTagFrequency();
      this.selectWord(data.word.id);
      this.search();
    });
  }

  getAllTags() {
    this.loading = true;
    this.voby.getTags()
    .subscribe({
      next: (data: any) => {
        this.allTags = data;

        for (let t of data) {
          this.searchTags.push(t);
        }
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
        if (this.setWords) { this.loading = false } 
      }
    })
  }

  getFullWordFromId(id: number) {
    return this.allWords.find(w => w.id === id);
  }

  deleteSelectedWord() {
    if (this.selectedWord) {
      this.voby.deleteWord(this.selectedWord.id)
      .subscribe({
        next: () => {
          const deletedWordIdx = this.setWords.findIndex((w: any) => w.id === this.selectedWord?.id);
          this.setWords.splice(deletedWordIdx, 1);
          if (this.setWords.length > 0) {
            this.selectWord(this.setWords[deletedWordIdx].id);
          }
          this.calculateTagFrequency();
          this.search();
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

  sortDateDesc() {
    localStorage.setItem('sort', 'date_desc')
    this.getSetWords(this.id, 'date_desc');
  }

  sortDateAsc() {
    localStorage.setItem('sort', 'date_asc')
    this.getSetWords(this.id, 'date_asc');
  }

  getSetWords(id: number, sort = localStorage.getItem('sort') || 'date_desc') {
    this.loading = true;
    this.voby.getSetWords(id, sort)
    .subscribe({
      next: (data: any) => {
        this.setWords = data.words;
        this.selectedWord = this.setWords[0];
        this.setWordsToday = data.words_today;
        this.set = data.set_info;
        this.vclass = data.vclass_info;
        if (localStorage.getItem('sort') == 'date_asc') {
          this.setWords.sort((a: any, b: any) => a.created > b.created)
        } else { 
          this.setWords.sort((a: any, b: any) => a.created < b.created)
        }
  
        this.selectedWord = this.setWords[0];
        this.getAllWordsOfClass(data.vclass_info.id);
        this.calculateTagFrequency();
        this.search();
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

  calculateTagFrequency(words: Word[] = this.setWords) {
    if (words !== undefined) {
      this.tagFrequency = words.flatMap((w: Word) => (w.tags || []).map(t => t.id)).reduce((x: any, y: any) => ((x[y] = (x[y] || 0) + 1 ), x), {});
    }
  }
 
  getAllWordsOfClass(classId: number) {
    this.voby.getAllWordsOfClass(classId)
    .subscribe({
      next: (data: any) => {
        this.allWords = data.words;
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

  toggleFavorite(id: number, favorite: boolean) {
    this.voby.editWordFavorite(id, !favorite)
    .subscribe({
      next: () => {
        this.setWords.find((w: Word) => w.id === id).favorite = !favorite;
      }
    });
  }

  deleteSet() {
    this.voby.deleteSet(this.id)
    .subscribe({
      next: () => {
        this.router.navigate(['/']);
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

  editSet() {
    const dialogRef = this.dialog.open(SetFormComponent, {
      width: '30%',
      data: {
        classId: this.vclass.id,
        setId: this.id,
        name: this.set.name
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.set.name = res.name;
      }
    })
  }

  editWord() {
    const dialogRef = this.dialog.open(WordFormComponent, {
      width: '30%',
      data: {
        word: this.selectedWord,
        allWords: this.allWords,
        allTags: this.allTags,
        edit: true
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        let word = this.setWords.find((w: any) => w.id === this.selectedWord?.id);
        Object.assign(word, res.word);

        if (word.related_words) {
          word.related_words.forEach((rw: any) => {
            const idx = this.setWords.findIndex((w: any) => w.id === rw.id);
            if (idx !== -1) {
              const rwRws = this.setWords[idx].related_words;
              if (rwRws.findIndex((w:any) => w.id === word.id) === -1) {
                rwRws.push({id:word.id, word:word.word, set:word.set});
              }
            }
          });
        }

        const wordIdx = this.allWords.findIndex(w => w.id === word.id);
        this.allWords[wordIdx].word = word.word;
        this.allWords[wordIdx].tags = word.tags;
        this.allTags.push(...res.newTags);
        this.calculateTagFrequency();
      }
    })
  }

  deselectWord() {
    this.selectedWord = undefined;
  }

  toggleShowFavorites() {
    if (this.showingFavorites) {
      this.search();
      this.showingFavorites = false;
    } else {
      let newWords: Word[] = [];
      if (this.selectedTags.length === 0) {
        this.setWords.filter((w: Word) => w.favorite === true).forEach((i: any) => newWords.push(i));
      } else {
        this.setWords.filter((w: Word) => w.favorite === true && w.tags.some(t => this.selectedTags.map(sT => sT.id).includes(t.id))).forEach((i: any) => newWords.push(i));
      }

      this.filteredWords.splice(0, this.filteredWords.length);
      newWords.forEach(nW => {
        this.filteredWords.push(nW);
      });
      this.showingFavorites = true;
    }
  }

  search() {
    let newWords: Word[] = [];
    this.setWords.forEach((i: any) => newWords.push(i));

    if(this.searchInput) {
      if(this.searchInput?.nativeElement.value !== '') {
        this.suggestedWord = this.searchInput?.nativeElement.value;
        const searchTerm = this.searchInput?.nativeElement.value.toLowerCase();

        newWords = this.setWords.filter(
          (w: any) => 
            w.word.toLowerCase().includes(searchTerm) || 
            w.translations.filter((w: any) => w.value.toLowerCase().includes(searchTerm)).length > 0
          );
      } else {
        this.suggestedWord = '';
      }
    }

    if (this.selectedTags.length > 0) {
      newWords = newWords.filter(nW => nW.tags.some(t => this.selectedTags.map(sT => sT.id).includes(t.id)));
    }

    this.filteredWords.splice(0, this.filteredWords.length);
    newWords.forEach(nW => {
      this.filteredWords.push(nW);
    });

    if (this.filteredWords.length === 0) {
      this.deselectWord();
    }
  }

  @HostListener('document:keydown.alt.w', ['$event']) openWordFormAlt(event: KeyboardEvent) {
    event.preventDefault();
    this.createWord();
  }

  @HostListener('document:keydown.alt.e', ['$event']) editWordFormAlt(event: KeyboardEvent) {
    event.preventDefault();
    this.editWord();
  }

  @HostListener('document:keydown.meta.w', ['$event']) openWordFormMeta(event: KeyboardEvent) {
    event.preventDefault();
    this.createWord();
  }

  displayTranslations(translations: {id: number, value: string}[]) {
    return translations.map(o => o.value).join(' / ');
  }
}
