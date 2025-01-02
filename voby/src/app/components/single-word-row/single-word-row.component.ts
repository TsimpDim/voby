import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Word } from 'src/app/interfaces';
import { VobyService } from 'src/app/services/voby.service';

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
