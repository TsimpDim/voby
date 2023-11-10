import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { getCountryEmoji } from '../countries';
import { WordFormComponent } from '../word-form/word-form.component';
import { VobyService } from '../_services/voby.service';
import { HotkeysService } from '../_services/hotkeys.service';

interface word {
  id: number;
  word: string;
  set: number;
  set_name: string;
  translation: string;
  examples: {text: string, translation: string, id: number}[];
  general: string;
  plural: string;
  favorite: boolean;
  related_words: any[];
  created: string
}

@Component({
  selector: 'voby-all-words',
  templateUrl: './all-words.component.html',
  styleUrls: ['./all-words.component.scss']
})
export class AllWordsComponent implements OnInit {

  classId: number = -1;
  @ViewChild('searchInput') searchInput: ElementRef | undefined;

  selectedWord: word | undefined = undefined;
  filteredWords: word[] = [];
  paramsSubscription: Subscription | undefined;
  vclass: any | undefined;
  loading = false;
  showingFavorites = false;
  allWords: word[] = [];
  shortcutSubscriptions$: Subscription[] = [];
  getCountryEmoji = getCountryEmoji;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public voby: VobyService,
    private hotkeys: HotkeysService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.vclass = state['selectedClass'];
      this.allWords = state['allWords'];

      if (localStorage.getItem('sort') == 'date_asc') {
        this.allWords.sort((a: any, b: any) => a.created > b.created ? 1 : -1)
      } else {
        this.allWords.sort((a: any, b: any) => a.created < b.created ? 1 : -1)
      }

      this.selectedWord = this.allWords[0];
    }

    this.hotkeys.shortcuts$.subscribe(shortcuts => {
      for (const s of shortcuts) {
        this.shortcutSubscriptions$.push(s.subscribe());
      }
    });
  }

  ngOnInit() {
    this.paramsSubscription = this.route.params.subscribe(params => {
      this.classId = +params['id']; // (+) converts string 'id' to a number
    });

    if (!this.vclass) {
      this.getAllWordsOfClass(this.classId);
    } else {
      this.search();
    }
  }

  ngOnDestroy() {
    this.paramsSubscription?.unsubscribe();
  }

  selectWord(id: number) {
    this.selectedWord = this.allWords.find((o: any) => o.id === id);
  }

  goToSet(id: number) {
    this.router.navigate(['/set/'+id]);
  }
  
  deleteSelectedWord() {
    if (this.selectedWord) {
      this.voby.deleteWord(this.selectedWord.id)
      .subscribe({
        next: () => {
          const deletedWordIdx = this.allWords.findIndex((w: any) => w.id === this.selectedWord?.id);
          this.allWords.splice(deletedWordIdx, 1);
          if (this.allWords.length > 0) {
            this.selectWord(this.allWords[deletedWordIdx].id);
          }
          this.search();
        },
        error: () => {
          this.loading = false;
        },
        complete: () => this.loading = false
      })
    }
  }

  sortDateDesc() {
    localStorage.setItem('sort', 'date_desc')
    this.getAllWordsOfClass(this.classId, 'date_desc');
  }

  sortDateAsc() {
    localStorage.setItem('sort', 'date_asc')
    this.getAllWordsOfClass(this.classId, 'date_asc');
  }

  getAllWordsOfClass(classId: number, sort = localStorage.getItem('sort') || 'date_desc') {
    this.loading = true;
    this.voby.getAllWordsOfClass(classId, sort)
    .subscribe({
      next: (data: any) => {
        this.allWords = data['words'];
        this.vclass = data['vclass_info'];
        this.selectedWord = this.allWords[0];
        this.search();
      },
      error: () => {
        this.loading = false;
      },
      complete: () => this.loading = false
    })
  }

  toggleFavorite(id: number, favorite: boolean) {
    this.voby.editWordFavorite(id, !favorite)
    .subscribe({
      next: () => {
        const word = this.allWords.find((w: word) => w.id === id);
        if (word) {
          word.favorite = !favorite;
        }
      }
    });
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
        let word = this.allWords.find((w: any) => w.id === this.selectedWord?.id);
        if (!word) {
          return;
        }

        Object.assign(word, res.word);

        if (word && word.related_words) {
          word.related_words.forEach((rw: any) => {
            const idx = this.allWords.findIndex((w: any) => w.id === rw.id);
            if (idx !== -1) {
              const rwRws = this.allWords[idx].related_words;
              if (rwRws.findIndex((w:any) => w.id === word?.id) === -1) {
                rwRws.push({id:word?.id, word:word?.word, set:word?.set});
              }
            }
          });
        }

        const wordIdx = this.allWords.findIndex(w => w.id === word?.id);
        this.allWords[wordIdx].word = word.word;
      }
    })
  }

  toggleShowFavorites() {
    if (this.showingFavorites) {
      this.search();
      this.showingFavorites = false;
    } else {
      let newWords: word[] = [];
      this.allWords.filter((w: word) => w.favorite === true).forEach((i: any) => newWords.push(i));
      this.filteredWords.splice(0, this.filteredWords.length);
      newWords.forEach(nW => {
        this.filteredWords.push(nW);
      });
      this.showingFavorites = true;
    }
  }

  search() {
    let newWords: word[] = [];
    this.allWords.forEach((i: any) => newWords.push(i));

    if(this.searchInput) {
      if(this.searchInput?.nativeElement.value !== '') {
        const searchTerm = this.searchInput?.nativeElement.value.toLowerCase();
        newWords = this.allWords.filter(
          (w: any) => 
            w.word.toLowerCase().includes(searchTerm) || 
            w.translations.filter((w: any) => w.value.toLowerCase().includes(searchTerm)).length > 0
          );
      }
    }

    this.filteredWords.splice(0, this.filteredWords.length);
    newWords.forEach(nW => {
      this.filteredWords.push(nW);
    });
  }

}
