import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { UserLevel as UserLevel, experienceLevelMapping } from '../user-levels';
import { AuthService } from '../_services/auth.service';
import { ExperienceService } from '../_services/experience.service';

@Component({
  selector: 'voby-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit {
  public isLoggedIn: Boolean | null = null;
  routerSubscription: Subscription | undefined;
  userExperience: any;
  userLevel: UserLevel = {level: 0, threshold: 0};
  userLevelProgress: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private exp: ExperienceService
  ) {
    this.exp.experience$.subscribe({
      next: (experience: any) => {
        this.userExperience = experience;
      }
    });

    this.exp.userLevel$.subscribe({
      next: (level: UserLevel) => {
        this.userLevel = level;
      }
    });

    combineLatest([this.exp.experience$, this.exp.userLevel$]).subscribe(([experience, level]) => {
      this.userLevelProgress = (experience % 100 / 100) * 100;
    })
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
