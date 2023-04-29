import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { experienceLevelMapping, UserLevel } from '../user-levels';
import { VobyService } from './voby.service';

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
        Object.keys(experienceLevelMapping).forEach((key) => {
          if (exp >= parseInt(key)) {
            this.userLevel$.next({level: experienceLevelMapping[parseInt(key)], threshold: parseInt(key)});
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
    })
  }

  forceRefresh() {
    this.getProfile();
  }

  add(amount: number) {
    this.experience$.next(this.experience$.value + amount);
  }
}