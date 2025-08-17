import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Word } from 'src/app/interfaces';
import { VobyService } from 'src/app/services/voby.service';
import { FavoriteComponent } from '../custom/favorite/favorite.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'voby-single-word-row',
  templateUrl: './single-word-row.component.html',
  styleUrls: ['./single-word-row.component.scss'],
  imports: [
    MatCardModule,
    MatRippleModule,
    NgClass,
    MatIconModule,
    MatTooltipModule,
    FavoriteComponent,
  ],
})
export class SingleWordRowComponent {
  constructor(private voby: VobyService) {}

  @Input() word: Word = {} as Word;
  @Input() selected = false;
  @Output() wordFavorited = new EventEmitter<any>();

  displayTranslations(translations: { id: number; value: string }[]) {
    return translations.map((o) => o.value).join(' / ');
  }

  toggleFavorite(id: number, favorite: boolean) {
    this.voby.editWordFavorite(id, !favorite).subscribe({
      next: () => {
        this.wordFavorited.emit({ id: this.word.id, favorite });
      },
    });
  }
}
