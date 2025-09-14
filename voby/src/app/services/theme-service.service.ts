import { Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkThemeClass = 'dark-theme';

  constructor(private overlay: OverlayContainer) {
    // Initialize theme based on preference or default
    if (this.getPreferredTheme() === 'dark-theme') {
      this.enableDarkTheme();
    } else {
      this.disableDarkTheme();
    }
  }

  enableDarkTheme() {
    document.body.classList.add(this.darkThemeClass);
    this.overlay.getContainerElement().classList.add(this.darkThemeClass);
    localStorage.setItem('theme', 'dark-theme');
  }

  disableDarkTheme() {
    document.body.classList.remove(this.darkThemeClass);
    this.overlay.getContainerElement().classList.remove(this.darkThemeClass);
    localStorage.setItem('theme', 'light-theme');
  }

  toggleTheme() {
    if (document.body.classList.contains(this.darkThemeClass)) {
      this.disableDarkTheme();
    } else {
      this.enableDarkTheme();
    }
  }

  getPreferredTheme(): 'dark-theme' | 'light-theme' {
    const preference = localStorage.getItem('theme');
    if (preference && preference === 'dark-theme') {
      return preference;
    }

    return 'light-theme';
  }

  isDarkThemeEnabled(): boolean {
    return document.body.classList.contains(this.darkThemeClass);
  }
}
