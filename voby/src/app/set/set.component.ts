import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { getCountryEmoji } from '../countries';
import { SetFormComponent } from '../set-form/set-form.component';
import { WordFormComponent } from '../word-form/word-form.component';
import { VobyService } from '../_services/voby.service';

interface word {
  id: number;
  word: string;
  translation: string;
  examples: {text: string, translation: string, id: number}[];
  general: string;
  favorite: boolean;
  relatedWords: string[];
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
  getCountryEmoji = getCountryEmoji;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public voby: VobyService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.vclass = state['selectedClass'];
      this.set = state['selectedSet'];
      if (localStorage.getItem('sort') == 'date_asc') {
        this.set.words.sort((a: any, b: any) => a.created > b.created)
      } else {
        this.set.words.sort((a: any, b: any) => a.created < b.created)
      }

      this.selectedWord = this.set.words[0];
    }
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
  }

  selectWord(id: number) {
    this.selectedWord = this.set.words.find((o: any) => o.id === id);
  }

  openWordForm() {
    const dialogRef = this.dialog.open(WordFormComponent, {
      width: '30%',
      data: {
        setId: this.set.id,
        edit: false
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data !== undefined && data.word && data.examples) {
        data.examples.forEach((e: any) => data.word.examples.push(e));
      }

      if (localStorage.getItem('sort') === 'date_asc') {
        this.set.words.push(data.word);
      } else {
        this.set.words.unshift(data.word);
      }
      this.set.words_today += 1;
      this.search();
    });
  }

  deleteSelectedWord() {
    if (this.selectedWord) {
      this.voby.deleteWord(this.selectedWord.id)
      .subscribe({
        next: () => {
          this.set.words.splice(this.set.words.findIndex((w: any) => w.id === this.selectedWord?.id), 1);
          this.selectedWord = undefined;
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
        this.search();
      },
      error: () => {
        this.loading = false;
      },
      complete: () => this.loading = false
    })
  }

  toggleFavorite(wordId: number, favorite: boolean) {
    this.voby.editWordFavorite(wordId, !favorite)
    .subscribe({
      next: () => {
        this.set.words.find((w: word) => w.id === wordId).favorite = !favorite;
      }
    });
  }

  deleteSet() {
    this.voby.deleteSet(this.id)
    .subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading = false;
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
      this.set.name = res.name;
    })
  }

  editWord() {
    const dialogRef = this.dialog.open(WordFormComponent, {
      width: '30%',
      data: {
        word: this.selectedWord,
        edit: true
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        let word = this.set.words.find((w: any) => w.id === this.selectedWord?.id);
        word.word = res.word;
        word.translation = res.translation;
        word.general = res.general;
        word.examples = res.examples;
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
        newWords = this.set.words.filter((w: any) => w.word.toLowerCase().includes(this.searchInput?.nativeElement.value.toLowerCase())) || [];
      }
    }

    this.filteredWords.splice(0, this.filteredWords.length);
    newWords.forEach(nW => {
      this.filteredWords.push(nW);
    });
  }
}
