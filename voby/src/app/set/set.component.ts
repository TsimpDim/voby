import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

interface word {
  id: number;
  word: string;
  translation: string;
  examples: {text: string, translation: string, id: number}[];
  general: string;
  plural: string;
  favorite: boolean;
  related_words: any[];
  created: string
}

@Component({
  selector: 'voby-set',
  templateUrl: './set.component.html',
  styleUrls: ['./set.component.scss']
})
export class SetComponent implements OnInit {

  id: number = -1;
  @ViewChild('searchInput') searchInput: ElementRef | undefined;

  selectedWord: word | undefined = undefined;
  filteredWords: word[] = [];
  paramsSubscription: Subscription | undefined;
  set: any | undefined;
  vclass: any | undefined;
  loading = false;
  showingFavorites = false;
  allWords: any[] = [];
  getCountryEmoji = getCountryEmoji;
  shortcutSubscriptions$: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    public voby: VobyService,
    private hotkeys: HotkeysService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.vclass = state['selectedClass'];
      this.set = state['selectedSet'];
      this.allWords = state['allWords'];

      if (localStorage.getItem('sort') == 'date_asc') {
        this.set.words.sort((a: any, b: any) => a.created > b.created)
      } else {
        this.set.words.sort((a: any, b: any) => a.created < b.created)
      }

      this.selectedWord = this.set.words[0];
    }

      this.hotkeys.shortcuts$.subscribe(shortcuts => {
      for (const s of shortcuts) {
        this.shortcutSubscriptions$.push(s.subscribe());
      }
    });
  }

  ngOnInit() {
    this.paramsSubscription = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
    });

    if (!this.set) {
      this.getSet(this.id);
    } else {
      this.search();
    }
  }

  ngOnDestroy() {
    this.paramsSubscription?.unsubscribe();
    for (const s of this.shortcutSubscriptions$) {
      s.unsubscribe();
    }
  }

  selectWord(id: number) {
    this.selectedWord = this.set.words.find((o: any) => o.id === id);
  }

  openWordForm() {
    const dialogRef = this.dialog.open(WordFormComponent, {
      width: '30%',
      data: {
        setId: this.set.id,
        allWords: this.allWords,
        edit: false
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (!data) {
        return;
      }

      if (localStorage.getItem('sort') === 'date_asc') {
        this.set.words.push(data.word);
      } else {
        this.set.words.unshift(data.word);
      }

      if (data.word.related_words) {
        data.word.related_words.forEach((rw: any) => {
          const idx = this.set.words.findIndex((w: any) => w.id === rw.id);
          if (idx !== -1) {
            this.set.words[idx].related_words.push({id:data.word.id, word:data.word.word, set:data.word.set});
          }
        });
      }

      this.allWords.push({id: data.word.id, word: data.word.word, set: data.word.set});
      this.set.words_today += 1;
      this.selectWord(data.word.id);
      this.search();
    });
  }

  deleteSelectedWord() {
    if (this.selectedWord) {
      this.voby.deleteWord(this.selectedWord.id)
      .subscribe({
        next: () => {
          const deletedWordIdx = this.set.words.findIndex((w: any) => w.id === this.selectedWord?.id);
          this.set.words.splice(deletedWordIdx, 1);
          if (this.set.words.length > 0) {
            this.selectWord(this.set.words[deletedWordIdx].id);
          }
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
    this.getSet(this.id, 'date_desc');
  }

  sortDateAsc() {
    localStorage.setItem('sort', 'date_asc')
    this.getSet(this.id, 'date_asc');
  }

  getSet(id: number, sort = localStorage.getItem('sort') || 'date_desc') {
    this.voby.getSet(id, sort)
    .subscribe({
      next: (data: any) => {
        this.set = data;
        this.vclass = data.vclass_info
        this.selectedWord = this.set.words[0];
        this.getAllWordsOfClass(data.vclass);
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
        this.set.words.find((w: word) => w.id === id).favorite = !favorite;
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
        edit: true
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        let word = this.set.words.find((w: any) => w.id === this.selectedWord?.id);
        Object.assign(word, res);

        if (word.related_words) {
          word.related_words.forEach((rw: any) => {
            const idx = this.set.words.findIndex((w: any) => w.id === rw.id);
            if (idx !== -1) {
              const rwRws = this.set.words[idx].related_words;
              if (rwRws.findIndex((w:any) => w.id === word.id) === -1) {
                rwRws.push({id:word.id, word:word.word, set:word.set});
              }
            }
          });
        }

        const wordIdx = this.allWords.findIndex(w => w.id === word.id);
        this.allWords[wordIdx].word = word.word;
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
      let newWords: word[] = [];
      this.set.words.filter((w: word) => w.favorite === true).forEach((i: any) => newWords.push(i));
      this.filteredWords.splice(0, this.filteredWords.length);
      newWords.forEach(nW => {
        this.filteredWords.push(nW);
      });
      this.showingFavorites = true;
    }
  }

  search() {
    let newWords: word[] = [];
    this.set.words.forEach((i: any) => newWords.push(i));

    if(this.searchInput) {
      if(this.searchInput?.nativeElement.value !== '') {
        const searchTerm = this.searchInput?.nativeElement.value.toLowerCase();
        newWords = this.set.words.filter(
          (w: any) => 
            w.word.toLowerCase().includes(searchTerm) || 
            w.translation.toLowerCase().includes(searchTerm)
          );
      }
    }

    this.filteredWords.splice(0, this.filteredWords.length);
    newWords.forEach(nW => {
      this.filteredWords.push(nW);
    });

    if (this.filteredWords.length === 0) {
      this.deselectWord();
    }
  }
}
