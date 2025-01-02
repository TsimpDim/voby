import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { experienceLevelMapping, UserLevel } from '../user-levels';
import { VobyService } from './voby.service';

interface LevelMapping {level: number, requiredXp: number};

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  experience$ = new BehaviorSubject<number>(0);
  userLevel$ = new BehaviorSubject<UserLevel>({level: 0, threshold: 0});

  constructor(private voby: VobyService) {
    this.getProfile();
    this.getUserLevel();
  }

  private getUserLevel() {
    this.experience$.subscribe({
      next: (exp: number) => {
        experienceLevelMapping.find((l: LevelMapping) => {
          if (exp < l.requiredXp) {
            const level: LevelMapping = experienceLevelMapping.find(lM => lM.level == l.level-1) || {level: 0, requiredXp: 0};
            this.userLevel$.next({level: level.level, threshold: level.requiredXp});
          }
        });
      }
    })
  }

  private getProfile() {
    this.voby.getProfile().subscribe({
      next: (data: any) => {
        this.experience$.next(data[0].experience);
      }
    });
  }

  forceRefresh() {
    this.getProfile();
  }

  add(amount: number) {
    this.experience$.next(this.experience$.value + amount);
  }
}