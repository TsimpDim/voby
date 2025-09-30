import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { experienceLevelMapping, UserLevel } from '../user-levels';
import { VobyService } from './voby.service';

interface LevelMapping {
  level: number;
  requiredXp: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  experience$ = new BehaviorSubject<number>(0);
  streak$ = new BehaviorSubject<number>(0);
  userLevel$ = new BehaviorSubject<UserLevel>({ level: 0, threshold: 0 });
  streak_date = new Date();

  constructor(private voby: VobyService) {
    this.getProfile();
    this.getUserLevel();
  }

  private getUserLevel() {
    this.experience$.subscribe({
      next: (exp: number) => {
        experienceLevelMapping.find((l: LevelMapping) => {
          if (exp < l.requiredXp) {
            const level: LevelMapping = experienceLevelMapping.find(
              (lM) => lM.level == l.level - 1,
            ) || { level: 0, requiredXp: 0 };
            this.userLevel$.next({
              level: level.level,
              threshold: level.requiredXp,
            });
          }
        });
      },
    });
  }

  private getProfile() {
    this.voby.getProfile().subscribe({
      next: (data: any) => {
        this.experience$.next(data[0].experience);
        this.streak$.next(data[0].streak);
        this.streak_date = new Date(data[0].date_streak_set);
      },
    });
  }

  checkUpdateStreak() {
    const today = new Date();
    const lastStreakDate = new Date(this.streak_date);
    const diffTime = today.getTime() - lastStreakDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      this.streak$.next(this.streak$.value + 1);
    } else {
      this.streak$.next(1);
    }
  }

  forceRefresh() {
    this.getProfile();
  }

  add(amount: number) {
    this.experience$.next(this.experience$.value + amount);
    this.checkUpdateStreak();
  }
}
