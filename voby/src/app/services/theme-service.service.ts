import { Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkThemeClass = 'dark-theme';

  constructor(private overlay: OverlayContainer) {}

  enableDarkTheme() {
    document.body.classList.add(this.darkThemeClass);
    this.overlay.getContainerElement().classList.add(this.darkThemeClass);
  }

  disableDarkTheme() {
    document.body.classList.remove(this.darkThemeClass);
    this.overlay.getContainerElement().classList.remove(this.darkThemeClass);
  }

  toggleTheme() {
    if (document.body.classList.contains(this.darkThemeClass)) {
      this.disableDarkTheme();
    } else {
      this.enableDarkTheme();
    }
  }

  isDarkThemeEnabled(): boolean {
    return document.body.classList.contains(this.darkThemeClass);
  }
}
