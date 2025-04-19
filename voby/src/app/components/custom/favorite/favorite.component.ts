import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';

@Component({
    selector: 'voby-favorite',
    templateUrl: './favorite.component.html',
    styleUrls: ['./favorite.component.scss'],
    standalone: true,
    imports: [MatLegacyButtonModule, MatIconModule]
})
export class FavoriteComponent {

  @Input() isFavorite: boolean = false;

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }
}
