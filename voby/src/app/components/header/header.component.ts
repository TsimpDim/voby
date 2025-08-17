import { AfterViewInit, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import {
  trigger,
  style,
  transition,
  animate,
  keyframes,
  AUTO_STYLE,
  state,
} from '@angular/animations';
import { experienceLevelMapping, UserLevel } from 'src/app/user-levels';
import { AuthService } from 'src/app/services/auth.service';
import { ExperienceService } from 'src/app/services/experience.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'voby-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('animationTrigger', [
      state('visible', style({ opacity: 1 })),
      state('invisible', style({ opacity: 0 })),
      transition('invisible => visible', [
        style({ opacity: 0 }),
        animate('200ms linear'),
      ]),
      state(
        'shake',
        style({
          transform: 'translateX(0) rotate(0)',
          color: '#fed640',
        }),
      ),
      transition('visible => shake', [
        animate('200ms linear', style({ color: '#fffff' })),
        animate('200ms linear', style({ color: '#fed640' })),
        animate('200ms linear', style({ color: '#fffff' })),
      ]),
      transition('shake => invisible', [animate('200ms ease-out')]),
    ]),
    trigger('xpAnimation', [
      transition(':increment', [
        style({ color: '#fed640', fontWeight: '500' }),
        animate('1s ease-out', style('*')),
      ]),
    ]),
    trigger('levelAnimation', [
      transition(':increment', [
        style({ color: '#fed640', fontWeight: '700' }),
        animate(
          '1.2s ease-out',
          keyframes([
            style({
              visibility: AUTO_STYLE,
              transform: 'scale3d(1, 1, 1)',
              easing: 'ease',
              offset: 0,
            }),
            style({
              transform: 'scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg)',
              easing: 'ease',
              offset: 0.1,
            }),
            style({
              transform: 'scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg)',
              easing: 'ease',
              offset: 0.2,
            }),
            style({
              transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)',
              easing: 'ease',
              offset: 0.3,
            }),
            style({
              transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)',
              easing: 'ease',
              offset: 0.4,
            }),
            style({
              transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)',
              easing: 'ease',
              offset: 0.5,
            }),
            style({
              transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)',
              easing: 'ease',
              offset: 0.6,
            }),
            style({
              transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)',
              easing: 'ease',
              offset: 0.7,
            }),
            style({
              transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)',
              easing: 'ease',
              offset: 0.8,
            }),
            style({
              transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)',
              easing: 'ease',
              offset: 0.9,
            }),
            style({ transform: 'scale3d(1, 1, 1)', easing: 'ease', offset: 1 }),
          ]),
        ),
      ]),
    ]),
  ],
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
})
export class HeaderComponent implements AfterViewInit {
  public isLoggedIn: boolean | null = null;
  routerSubscription: Subscription | undefined;
  userExperience: any;
  userLevel: UserLevel = { level: 0, threshold: 0 };
  userLevelProgress: any;
  userExperienceDiff = 0;
  remainingExp: any;
  animationState = 'visible';

  constructor(
    private router: Router,
    private authService: AuthService,
    private exp: ExperienceService,
  ) {
    this.exp.experience$.subscribe({
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

    this.exp.userLevel$.subscribe({
      next: (level: UserLevel) => {
        this.userLevel = level;
      },
    });

    combineLatest([this.exp.experience$, this.exp.userLevel$]).subscribe(
      ([experience, level]) => {
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
      },
    );
  }

  ngAfterViewInit(): void {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
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
    return this.isLoggedIn;
  }

  logout() {
    this.authService.logout();
  }
}
