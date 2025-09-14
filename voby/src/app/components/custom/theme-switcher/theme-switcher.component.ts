import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from 'src/app/services/theme-service.service';

@Component({
  selector: 'voby-theme-switcher',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss',
})
export class ThemeSwitcherComponent {
  darkThemeEnabled = false;

  constructor(private themeService: ThemeService) {
    this.darkThemeEnabled = this.themeService.isDarkThemeEnabled();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.darkThemeEnabled = this.themeService.isDarkThemeEnabled();
  }
}
