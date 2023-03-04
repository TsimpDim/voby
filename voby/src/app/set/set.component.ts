import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { WordFormComponent } from '../word-form/word-form.component';
interface word {
  id: number;
  text: string;
  translation: string;
  examples: {text: string, translation: string}[];
  genericInfo: string;
  relatedWords: string[];
}
@Component({
  selector: 'voby-set',
  templateUrl: './set.component.html',
  styleUrls: ['./set.component.scss']
})
export class SetComponent implements OnInit {

  id: number = -1;
  @ViewChild('searchInput') searchInput: ElementRef | undefined;

  sets: {id: number, class: number, sourceLanguage: string, destinationLanguage: string, name: string, items: word[]}[] = 
    [
      {
        id: 123,
        class: 1,
        sourceLanguage: '🇩🇪',
        destinationLanguage: '🇬🇧',
        name: 'OESD Model Prufung B1 Deutsch',
        items: [
          {
            id: 1,
            text: "Ananassaft",
            translation: "Pineapple juice",
            examples: [{text:'Ich mag Ananasaft', translation: 'I like pineapple juice'}, {text:'Meine Meinung nach Ananasaft ist...', translation: 'My opinion on pineapple juice is...'}],
            genericInfo: "",
            relatedWords: []
          },
          {
            id: 2,
            text: "Ausgezeichnet",
            translation: "Extraordinary",
            examples: [{text:'Das ist ausgezeichnet', translation: "That's extraordinary"}],
            genericInfo: "Very positive word. Can be easily used instead of 'very good'",
            relatedWords: ["Gut", "Perfekt"]
          },
          {
            id: 3,
            text: "Eislaufen",
            translation: "Ice skating",
            examples: [{text:'Eislaufen gefällt mir', translation: 'I like ice skating'}],
            genericInfo: "",
            relatedWords: ["laufen", "eis"]
          },
        ],
      },
      {
        id: 1234,
        class: 1,
        sourceLanguage: '🇩🇪',
        destinationLanguage: '🇬🇧',
        name: 'New set',
        items: [],
      }
    ];

  selectedWord: word | undefined = undefined;
  filteredWords: word[] = [];
  paramsSubscription: Subscription | undefined;
  set: any | undefined;

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {}

  ngOnInit() {
    this.paramsSubscription = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      this.set = this.sets.find(s => s.id === this.id);
    });

    if (this.setExists()) {
      this.search();
    }
  }

  ngOnDestroy() {
    this.paramsSubscription?.unsubscribe();
  }

  setExists(): boolean {
    return this.sets.findIndex(s => s.id === this.id) >= 0;
  }

  selectWord(id: number) {
    this.selectedWord = this.set.items.find((o: any) => o.id === id);
  }

  openWordForm() {
    this.dialog.open(WordFormComponent, {
      width: '30%',
    });
  }

  search() {
    let newWords: word[] = [];
    this.set.items.forEach((i: any) => newWords.push(i));

    if(this.searchInput) {
      if(this.searchInput?.nativeElement.value !== '') {
        newWords = this.set.items.filter((w: any) => w.text.toLowerCase().includes(this.searchInput?.nativeElement.value.toLowerCase())) || [];
      }
    }

    this.filteredWords.splice(0, this.filteredWords.length);
    newWords.forEach(nW => {
      this.filteredWords.push(nW);
    });
  }
}
