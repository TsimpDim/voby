import { Component, HostListener } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { FormControl, FormGroup } from '@angular/forms';
import { COMMA } from '@angular/cdk/keycodes';
import { Tag, Word } from 'src/app/interfaces';
import { getCountryEmoji } from 'src/app/countries';
import { VobyService } from 'src/app/services/voby.service';
import { HotkeysService } from 'src/app/services/hotkeys.service';
import { WordFormComponent } from 'src/app/components/forms/word-form/word-form.component';
import { SetFormComponent } from 'src/app/components/forms/set-form/set-form.component';
import { SnackbarComponent } from 'src/app/components/custom/snackbar/snackbar.component';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'voby-word-list-view',
  templateUrl: './word-list-view.component.html',
  styleUrls: ['./word-list-view.component.scss']
})
export class WordListViewComponent {

  classId: number = -1;
  setId: number = -1;
  needSet: boolean = true;

  selectedWord: Word | undefined;
  selectedWordOverride: number | undefined;
  filteredWords: Word[] = [];
  paramsSubscription$: Subscription | undefined;
  vclass: any | undefined;
  set: any | undefined;
  loadingHeader = false;
  loadingWords = false;
  showingFavorites = false;
  numberOfWords: number = 0;
  numberOfPages: number = 0;
  pagesToDisplay: number[] = [];
  currentPage: number = 1;
  searchForm: FormGroup;
  allTags: Tag[] = [];
  selectedTags: Tag[] = [];
  searchTags: Tag[] = [];
  shortcutSubscriptions$: Subscription[] = [];
  getCountryEmoji = getCountryEmoji;
  wordViewRelatedWord: Word|undefined;
  separatorKeysCodes: number[] = [COMMA];
  navigationSubscription$: Subscription|undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public voby: VobyService,
    private _snackBar: MatSnackBar,
    private hotkeys: HotkeysService,
  ) {
    this.searchForm = new FormGroup({
      search: new FormControl()
    })
  }

  ngOnInit() {
    this.hotkeys.shortcuts$.subscribe(shortcuts => {
      for (const s of this.shortcutSubscriptions$) {
        s.unsubscribe();
      }

      this.shortcutSubscriptions$ = [];

      for (const s of shortcuts) {
        this.shortcutSubscriptions$.push(s.subscribe());
      }
    });
    
    this.needSet = window.location.pathname.includes('set');
    this.paramsSubscription$ = this.route.params.subscribe(params => {
      if (!this.needSet) {
        this.classId = +(params['id']); // (+) converts string 'id' to a number
      } else {
        this.setId = +(params['id']);
      }

      this.initializeComponentData();
    });
  }

  ngOnDestroy() {
    this.paramsSubscription$?.unsubscribe();
    for (const s of this.shortcutSubscriptions$) {
      s.unsubscribe();
    }
  }

  initializeComponentData() {
    this.dialog.closeAll();
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.vclass = state['selectedClass'];
      if (Object.keys(state).includes('selectedSet')) {
        this.set = state['selectedSet'];
      }
      
      if (state['selectedWord']) {
        this.selectedWordOverride = (state['selectedWord'] as Word).id;
      }
    }

    if (this.needSet) {
      this.getSet(this.setId);
    } else {
      this.getVClass(this.classId);
    }

    this.getAllTags();
  }

  deselectWord() {
    this.selectedWord = undefined;
  }

  createWord() {
    const dialogRef = this.dialog.open(WordFormComponent, {
      width: '30%',
      data: {
        setId: this.set.id,
        allTags: this.allTags,
        vclassId: this.vclass.id,
        edit: false,
        suggestedWord: this.searchForm.get('search')?.value
      }
    });
    dialogRef.componentInstance.relatedWordClicked.subscribe((word: any) => this.selectOrRedirectWord(word));

    dialogRef.afterClosed().subscribe(data => {
      if (!data) {
        return;
      }

      if (localStorage.getItem('sort') === 'date_asc') {
        this.filteredWords.push(data.word);
      } else {
        this.filteredWords.unshift(data.word);
      }

      if (data.word.related_words) {
        data.word.related_words.forEach((rw: any) => {
          const idx = this.filteredWords.findIndex((w: any) => w.id === rw.id);
          if (idx !== -1) {
            this.filteredWords[idx].related_words.push({id:data.word.id, word:data.word.word, set:data.word.set});
          }
        });
      }

      this.allTags.push(...data.newTags);
      this.selectWord(data.word.id);
    });
  }

  editSet() {
    const dialogRef = this.dialog.open(SetFormComponent, {
      width: '30%',
      data: {
        classId: this.vclass.id,
        setId: this.setId,
        name: this.set.name
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.set.name = res.name;
      }
    })
  }

  deleteSet() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {});
    dialogRef.afterClosed().subscribe(res => {
      if (res.confirmed === true) {
        this.voby.deleteSet(this.setId)
        .subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (error: any) => {
            this.loadingHeader = false;
            this._snackBar.openFromComponent(SnackbarComponent, {
              data: {
                message: 'Error: ' + error.statusText,
                icon: 'error'
              },
              duration: 3 * 1000
            });
          },
          complete: () => this.loadingHeader = false
        })
      }
    })
  }

  getAllTags() {
    this.loadingHeader = true;
    this.voby.getTags()
    .subscribe({
      next: (data: any) => {
        this.allTags = data;

        for (let t of data) {
          this.searchTags.push(t);
        }
      },
      error: (error: any) => {
        this.loadingHeader = false;
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: 'Error: ' + error.statusText,
            icon: 'error'
          },
          duration: 3 * 1000
        });
      },
      complete: () => {
        if (this.filteredWords) { this.loadingHeader = false } 
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
  }

  selectWord(id: number) {
    this.selectedWord = this.filteredWords.find((o: any) => o.id === id);
  }

  selectedWordDeleted() {
    const idx = this.filteredWords.findIndex(w => w.id === this.selectedWord?.id);
    if (idx !== -1) {
      this.filteredWords.splice(idx, 1);
      if (this.filteredWords.length === 0) {
        this.currentPage = this.currentPage -= 1;
        if (this.currentPage < 0) { this.selectedWord = undefined }
        this.search();
      } else {
        this.selectWord(this.filteredWords[0].id);
      }
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
    this.loadingHeader = true;
    this.voby.getClass(classId)
    .subscribe({
      next: (data: any) => {
        this.vclass = data;
        this.search();
      },
      error: () => {
        this.loadingHeader = false;
      },
      complete: () => this.loadingHeader = false
    })
  }

  getSet(setId: number) {
    this.loadingHeader = true;
    this.voby.getSet(setId)
    .subscribe({
      next: (data: any) => {
        this.set = data;
        this.vclass = this.set.vclass_info;
        this.search();
      },
      error: () => {
        this.loadingHeader = false;
      },
      complete: () => this.loadingHeader = false
    })
  }

  getWords(classId: number, setId: number|undefined = undefined, page: number = 1, searchTerm: string|undefined = undefined,  tags: Tag[]|undefined = undefined) {
    this.loadingWords = true;
    this.deselectWord();
    this.numberOfPages = 0;
    this.filteredWords.splice(0, this.filteredWords.length);

    this.voby.getWords(classId, setId, searchTerm, tags, this.showingFavorites, page, 50)
    .subscribe({
      next: (data: any) => {
        data['results'].forEach((nW: any) => {
          this.filteredWords.push(nW);
        });

        this.numberOfWords = data['count'];
        this.numberOfPages = Math.ceil(data['count'] / 50);
        if (this.numberOfPages > 5) {
          this.pagesToDisplay.splice(0, this.pagesToDisplay.length);
          let startingPage = this.currentPage - 3;
          if (startingPage < 0) { startingPage = 0 }

          let endingPage = this.currentPage + 2;
          if (endingPage > this.numberOfPages) { endingPage = this.numberOfPages }

          for(let i = startingPage; i < endingPage; i++) {
            this.pagesToDisplay.push(i);
          }  
        }

        if (this.selectedWordOverride) {
          this.selectWord(this.selectedWordOverride);
          this.selectedWordOverride = undefined;
        } else {
          this.selectWord(this.filteredWords[0].id);
        }
        
        window.scroll({ 
          top: 0, 
          left: 0, 
          behavior: 'smooth' 
        });
      },
      error: () => {
        this.loadingWords = false;
      },
      complete: () => this.loadingWords = false
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

  removeTag(tagId: number) {
    const indexToRemove = this.selectedTags.findIndex(t => t.id === tagId);
    const removedTag = this.selectedTags.splice(indexToRemove, 1);
    this.searchTags.push(removedTag[0]);
  }

  editWord() {
    const dialogRef = this.dialog.open(WordFormComponent, {
      width: '30%',
      height: '70%',
      data: {
        vclassId: this.vclass.id,
        word: this.selectedWord,
        allTags: this.allTags,
        edit: true
      }
    });
    dialogRef.componentInstance.relatedWordClicked.subscribe((word: any) => this.selectOrRedirectWord(word));

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
      // this.search();
    }
  }

  toggleShowFavorites() {
    this.showingFavorites = !this.showingFavorites;
    this.search();
  }

  search() {
    this.getWords(
      this.vclass?.id,
      this.set?.id,
      this.currentPage,
      this.searchForm.get('search')?.value,
      this.selectedTags
    )

    if (this.filteredWords.length === 0) {
      this.deselectWord();
      this.numberOfPages = 0;
    }
  }

  displayTranslations(translations: {id: number, value: string}[]) {
    return translations.map(o => o.value).join(' / ');
  }

  selectOrRedirectWord(word: any) {
    if (word?.set === this.setId) {
      this.dialog.closeAll();
      this.selectWord(word.id);
    } else {
      this.router.navigate([`/set/${word?.set}`], {state: {selectedWord: word}})
    }
  }

  @HostListener('document:keydown.alt.w', ['$event']) openWordFormAlt(event: KeyboardEvent) {
    event.preventDefault();
    this.createWord();
  }

  @HostListener('document:keydown.meta.w', ['$event']) openWordFormMeta(event: KeyboardEvent) {
    event.preventDefault();
    this.createWord();
  }
}
