import { Component, Input, OnInit } from '@angular/core';
import { RelatedWord, Word } from 'src/app/interfaces';

@Component({
  selector: 'voby-word-view',
  templateUrl: './word-view.component.html',
  styleUrls: ['./word-view.component.scss']
})
export class WordViewComponent {

  // RelatedWord|Word
  @Input() word: any|undefined = undefined;
}
