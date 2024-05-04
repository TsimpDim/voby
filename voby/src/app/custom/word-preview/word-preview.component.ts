import { Component, Input, OnInit } from '@angular/core';
import { RelatedWord, Word } from 'src/app/interfaces';

@Component({
  selector: 'voby-word-preview',
  templateUrl: './word-preview.component.html',
  styleUrls: ['./word-preview.component.scss']
})
export class WordPreviewComponent {

  // RelatedWord|Word
  @Input() word: any|undefined = undefined;
}
