import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'voby-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent {

  fontIcon: string = 'favorite_border';
  isFavorite: boolean = false;
  FONT_ICON_MAPPING: Record<string, string> = {
    'false': 'favorite_border',
    'true': 'favorite'
  };

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    this.fontIcon = this.FONT_ICON_MAPPING[this.isFavorite.toString() as string];
  }

}
