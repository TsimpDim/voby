import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VobyService } from 'src/app/_services/voby.service';
import { Word } from 'src/app/interfaces';

@Component({
  selector: 'voby-single-word-row',
  templateUrl: './single-word-row.component.html',
  styleUrls: ['./single-word-row.component.scss']
})
export class SingleWordRowComponent {

  constructor(
    private voby: VobyService
  ) { }

  @Input() word: Word = {} as Word;
  @Input() selected: boolean = false;
  @Output() wordFavorited: EventEmitter<any> = new EventEmitter();

  displayTranslations(translations: {id: number, value: string}[]) {
    return translations.map(o => o.value).join(' / ');
  }

  toggleFavorite(id: number, favorite: boolean) {
    this.voby.editWordFavorite(id, !favorite)
    .subscribe({
      next: () => {
        this.wordFavorited.emit({id:this.word.id, favorite});
      }
    });
  }
}
