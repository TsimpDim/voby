import { Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { getCountryEmoji } from 'src/app/countries';
import { ExperienceService } from 'src/app/services/experience.service';
import { HotkeysService } from 'src/app/services/hotkeys.service';
import { VobyService } from 'src/app/services/voby.service';
import { stringSimilarity } from 'src/app/string-similarity';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoadingIndComponent } from '../../components/custom/loading-ind/loading-ind.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'voby-twenty-test',
    templateUrl: './twenty-test.component.html',
    styleUrls: ['./twenty-test.component.scss'],
    standalone: true,
    imports: [NgIf, LoadingIndComponent, MatSlideToggleModule, MatIconModule, NgFor, MatCardModule, MatFormFieldModule, MatInputModule, MatTooltipModule, MatButtonModule]
})
export class TwentyTestComponent implements OnInit, OnDestroy {
  NOT_ANSWERED = 0
  CORRECT = 1
  INCORRECT = 2
  questions: any[] = [];
  questionState: number[] = [];
  questionsValidated = false;
  loading = true;
  favoritesOnly = false;

  classId = -1;
  setId = -1;
  hasFavorites = false;
  shortcutSubscriptions$: Subscription[] = [];
  numberTestQuestions: number = 20;
  getCountryEmoji = getCountryEmoji;

  @ViewChildren('input') inputs: any;

  constructor(
    private voby: VobyService,
    private exp: ExperienceService,
    private hotkeys: HotkeysService,
    private router: Router
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.classId = state['classId'];
      this.setId = state['setId'];
      this.hasFavorites = state['hasFavorites'];
    }

    this.hotkeys.shortcuts$.subscribe(shortcuts => {
      for (const s of this.shortcutSubscriptions$) {
        s.unsubscribe();
      }

      this.shortcutSubscriptions$ = [];

      for (const s of shortcuts) {
        this.shortcutSubscriptions$.push(s.subscribe());
      }
    });
  }

  ngOnInit(): void {
    this.getTestQuestions(this.classId, this.setId, this.favoritesOnly);
  }

  ngOnDestroy() {
    for (const s of this.shortcutSubscriptions$) {
      s.unsubscribe();
    }
  }

  getTestQuestions(classId: number, setId: number, favoritesOnly: boolean) {
    this.voby.getOptions()
    .subscribe({
      next: (data: any) => {
        this.numberTestQuestions = data.find((o: any) => o.key === 'numTestQuestions').value;
        this.voby.getTestWords(this.numberTestQuestions, classId, setId, favoritesOnly)
        .subscribe({
          next: (data: any) => {
            this.questions = data;
            this.questions.forEach(e => {
              this.questionState.push(this.NOT_ANSWERED);
            });
          },
          error: () => {
            this.loading = false;
          },
          complete: () => this.loading = false
        })
      },
      error: (error: any) => {
        this.loading = false;
      },
      complete: () => this.loading = false
    })
  }

  validateAnswers() {
    let correct = 0;
    if (this.inputs) {
      this.inputs.toArray().forEach((input: ElementRef, index: number) => {
        const userAnswer = input?.nativeElement.value;
        const correctAnswer = this.questions[index].translations;

        if (correctAnswer.split(' / ').find((t: string) => stringSimilarity(t, userAnswer) >= 0.7)) {
          this.questionState[index] = this.CORRECT;
          this.exp.add(2);
          correct += 1;
        } else {
          this.questionState[index] = this.INCORRECT;
        }
      });

      this.questionsValidated = true;
      this.createTestAttempt(correct);
    }
  }

  createTestAttempt(questionsCorrect: number) {
    this.voby.createTestAttempt(questionsCorrect).subscribe();
  }

  refreshTest() {
    this.questionsValidated = false;
    this.questionState = [];
    this.getTestQuestions(this.classId, this.setId, this.favoritesOnly);
  }

  toggleFavorites() {
    if (this.hasFavorites) {
      this.favoritesOnly = !this.favoritesOnly;
      this.refreshTest();
    }
  }
}

