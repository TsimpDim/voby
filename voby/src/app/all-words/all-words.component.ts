import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { getCountryEmoji } from '../countries';
import { WordFormComponent } from '../word-form/word-form.component';
import { VobyService } from '../_services/voby.service';
import { HotkeysService } from '../_services/hotkeys.service';
import { Tag, Word } from '../interfaces';
import { SnackbarComponent } from '../custom/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'voby-all-words',
  templateUrl: './all-words.component.html',
  styleUrls: ['./all-words.component.scss']
})
export class AllWordsComponent implements OnInit {

  classId: number = -1;
  @ViewChild('searchInput') searchInput: ElementRef | undefined;

  selectedWord: Word | undefined = undefined;
  filteredWords: Word[] = [];
  paramsSubscription: Subscription | undefined;
  vclass: any | undefined;
  loading = false;
  showingFavorites = false;
  numberOfWords: number = 0;
  numberOfPages: number = 0;
  currentPage: number = 1;
  searchForm: FormGroup;
  allTags: Tag[] = [];
  selectedTags: Tag[] = [];
  searchTags: Tag[] = [];
  tagFrequency: any = {};
  shortcutSubscriptions$: Subscription[] = [];
  getCountryEmoji = getCountryEmoji;
  wordViewRelatedWord: Word|undefined = undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public voby: VobyService,
    private _snackBar: MatSnackBar,
    private hotkeys: HotkeysService,
    private formBuilder: FormBuilder
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.vclass = state['selectedClass'];
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

    this.searchForm = new FormGroup({
      search: new FormControl()
    })
  }

  ngOnInit() {
    this.paramsSubscription = this.route.params.subscribe(params => {
      this.classId = +params['id']; // (+) converts string 'id' to a number
    });

    if (!this.filteredWords || !this.vclass) {
      this.search();
      this.getVClass(this.classId);
    } else {
      this.search();
    }

    this.getAllTags();
  }

  ngOnDestroy() {
    this.paramsSubscription?.unsubscribe();
    for (const s of this.shortcutSubscriptions$) {
      s.unsubscribe();
    }
  }

  deselectWord() {
    this.selectedWord = undefined;
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
        if (this.filteredWords) { this.loading = false } 
      }
    })
  }

  getFullWordFromId(id: number) {
    return this.filteredWords.find(w => w.id === id);
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

  selectWord(id: number) {
    this.selectedWord = this.filteredWords.find((o: any) => o.id === id);
  }

  goToSet(id: number) {
    this.router.navigate(['/set/'+id]);
  }

  deleteSelectedWord() {
    if (this.selectedWord) {
      this.voby.deleteWord(this.selectedWord.id)
      .subscribe({
        next: () => {
          this.search();
          this.calculateTagFrequency();
        },
        error: () => {
          this.loading = false;
        },
        complete: () => this.loading = false
      })
    }
  }

  sortDateDesc() {
    localStorage.setItem('sort', '-created')
    this.search();
  }

  sortDateAsc() {
    localStorage.setItem('sort', 'created')
    this.search();
  }

  getVClass(classId: number) {
    this.loading = true;
    this.voby.getClass(classId)
    .subscribe({
      next: (data: any) => {
        this.vclass = data;
      },
      error: () => {
        this.loading = false;
      },
      complete: () => this.loading = false
    })
  }

  getAllWordsOfClass(classId: number, page: number = 1, searchTerm: string|undefined = undefined,  sort = localStorage.getItem('sort') || '-created') {
    this.loading = true;
    this.deselectWord();
    this.numberOfPages = 0;
    this.filteredWords.splice(0, this.filteredWords.length);

    this.voby.getAllWordsOfClass(classId, searchTerm, this.showingFavorites, page, 50, sort)
    .subscribe({
      next: (data: any) => {
        data['results'].forEach((nW: any) => {
          this.filteredWords.push(nW);
        });

        this.numberOfWords = data['count'];
        this.numberOfPages = Math.ceil(data['count'] / 50);
        this.selectedWord = this.filteredWords[0];
        this.calculateTagFrequency();
        window.scroll({ 
          top: 0, 
          left: 0, 
          behavior: 'smooth' 
        });
      },
      error: () => {
        this.loading = false;
      },
      complete: () => this.loading = false
    })
  }

  processFavoritedWord(data: {id:number, favorite:boolean}) {
    const idx = this.filteredWords.findIndex((w: Word) => w.id === data.id);
    this.filteredWords[idx].favorite = !data.favorite;
  }

  toggleFavorite(id: number, favorite: boolean) {
    this.voby.editWordFavorite(id, !favorite)
    .subscribe({
      next: () => {
        const word = this.filteredWords.find((w: Word) => w.id === id);
        if (word) {
          word.favorite = !favorite;
        }
      }
    });
  }

  calculateTagFrequency(words: Word[] = this.filteredWords) {
    if (words !== undefined) {
      this.tagFrequency = words.flatMap((w: Word) => (w.tags || []).map(t => t.id)).reduce((x: any, y: any) => ((x[y] = (x[y] || 0) + 1 ), x), {});
    }
  }

  removeTag(tagId: number) {
    const indexToRemove = this.selectedTags.findIndex(t => t.id === tagId);
    const removedTag = this.selectedTags.splice(indexToRemove, 1);
    this.searchTags.push(removedTag[0]);
    this.search();
    this.calculateTagFrequency();
  }

  editWord() {
    const dialogRef = this.dialog.open(WordFormComponent, {
      width: '30%',
      data: {
        word: this.selectedWord,
        allWords: [],
        allTags: this.allTags,
        edit: true
      },
    });

    dialogRef.afterClosed().subscribe((res: any) => {
      this.processEditedWord(res);
    })
  }

  processEditedWord(data: any) {
    if (data) {
      let word = this.filteredWords.find((w: any) => w.id === this.selectedWord?.id);
      if (!word) {
        return;
      }

      Object.assign(word, data.word);

      if (word && word.related_words) {
        word.related_words.forEach((rw: any) => {
          const idx = this.filteredWords.findIndex((w: any) => w.id === rw.id);
          if (idx !== -1) {
            const rwRws = this.filteredWords[idx].related_words;
            if (rwRws.findIndex((w:any) => w.id === word?.id) === -1) {
              rwRws.push({id:word?.id, word:word?.word, set:word?.set});
            }
          }
        });
      }

      const wordIdx = this.filteredWords.findIndex(w => w.id === word?.id);
      this.filteredWords[wordIdx].word = word.word;
      this.calculateTagFrequency();
      this.search();
    }
  }

  toggleShowFavorites() {
    if (this.showingFavorites) {
      this.search();
      this.showingFavorites = false;
    } else {
      let newWords: Word[] = [];
      this.filteredWords.filter((w: Word) => w.favorite === true).forEach((i: any) => newWords.push(i));
      this.filteredWords.splice(0, this.filteredWords.length);
      newWords.forEach(nW => {
        this.filteredWords.push(nW);
      });
      this.showingFavorites = true;
    }
  }

  search() {
    this.getAllWordsOfClass(
      this.classId,
      this.currentPage,
      this.searchForm.get('search')?.value,
    )

    if (this.filteredWords.length === 0) {
      this.deselectWord();
      this.numberOfPages = 0;
    }
  }

  displayTranslations(translations: {id: number, value: string}[]) {
    return translations.map(o => o.value).join(' / ');
  }
}
