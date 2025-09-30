import { AfterViewInit, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { experienceLevelMapping, UserLevel } from 'src/app/user-levels';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ThemeSwitcherComponent } from '../custom/theme-switcher/theme-switcher.component';
import {
  fadeAwayAnimation,
  levelAnimation,
  baseIncrementAnimation,
} from './header.animation';

@Component({
  selector: 'voby-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeAwayAnimation, baseIncrementAnimation, levelAnimation],
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    ThemeSwitcherComponent,
  ],
})
export class HeaderComponent implements AfterViewInit {
  public isLoggedIn: boolean | null = null;
  routerSubscription: Subscription | undefined;
  userExperience: any;
  userLevel: UserLevel = { level: 0, threshold: 0 };
  userLevelProgress: any;
  userExperienceDiff = 0;
  streak = 0;
  remainingExp: any;
  animationState = 'visible';
  skipHeader = false;
  ROUTES_TO_SKIP = ['/login', '/register'];

  constructor(
    private router: Router,
    private authService: AuthService,
    private profile: ProfileService,
  ) {
    this.profile.experience$.subscribe({
      next: (experience: any) => {
        this.userExperienceDiff = experience - this.userExperience;
        this.userExperience = experience;
        setTimeout(() => {
          this.animationState = 'shake';
          setTimeout(() => {
            this.animationState = 'invisible';
          }, 1000);
        }, 200);
      },
    });

    this.profile.userLevel$.subscribe({
      next: (level: UserLevel) => {
        this.userLevel = level;
      },
    });

    this.profile.streak$.subscribe({
      next: (streak: number) => {
        this.streak = streak;
      },
    });

    combineLatest([
      this.profile.experience$,
      this.profile.userLevel$,
    ]).subscribe(([experience, level]) => {
      const nextLevelThreshold =
        experienceLevelMapping.find((l) => l.level == level.level + 1)
          ?.requiredXp || 0;
      const prevLevelThreshold =
        experienceLevelMapping.find((l) => l.level == level.level)
          ?.requiredXp || 0;
      this.remainingExp = nextLevelThreshold - experience;
      if (!nextLevelThreshold) {
        this.userLevelProgress = 0;
      } else {
        this.userLevelProgress =
          ((experience - prevLevelThreshold) /
            (nextLevelThreshold - prevLevelThreshold)) *
          100;
      }
    });
  }

  ngAfterViewInit(): void {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.ROUTES_TO_SKIP.find((r) => this.router.url.includes(r))) {
          this.skipHeader = true;
          return;
        }
        this.checkIsLoggedIn();
      }
    });
  }

  goHome() {
    this.router.navigateByUrl('/');
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  goToOptions() {
    this.router.navigateByUrl('/options');
  }

  checkIsLoggedIn() {
    this.isLoggedIn = this.authService.getIsLoggedIn();
    if (this.isLoggedIn) {
      this.skipHeader = false;
    }
    return this.isLoggedIn;
  }

  logout() {
    this.authService.logout();
  }
}
