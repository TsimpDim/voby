import { AfterViewInit, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { UserLevel as UserLevel, experienceLevelMapping } from '../user-levels';
import { AuthService } from '../_services/auth.service';
import { ExperienceService } from '../_services/experience.service';
import { trigger, style, transition, animate} from '@angular/animations';

@Component({
  selector: 'voby-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('valueAnimation', [
      transition(':increment', [
          style({ color: '#fed640', fontWeight: '500' }),
          animate('1s ease-out', style('*'))
        ]
      )]
    )
  ]
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
      const nextLevelThreshold = Object.keys(experienceLevelMapping).find(th => parseInt(th) > level.threshold);
      if (!nextLevelThreshold) {
        this.userLevelProgress = 0;
      } else {
        this.userLevelProgress = (experience  / parseInt(nextLevelThreshold)) * 100;
      }
    });
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
