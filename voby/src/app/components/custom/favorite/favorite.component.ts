import { Component, Input } from '@angular/core';

@Component({
  selector: 'voby-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent {

  @Input() isFavorite: boolean = false;

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }
}
