import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { getCountryEmoji } from 'src/app/countries';
import { ProfileService } from 'src/app/services/profile.service';
import { HotkeysService } from 'src/app/services/hotkeys.service';
import { VobyService } from 'src/app/services/voby.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoadingIndComponent } from 'src/app/components/custom/loading-ind/loading-ind.component';

@Component({
  selector: 'voby-twenty-test',
  templateUrl: './twenty-test.component.html',
  styleUrls: ['./twenty-test.component.scss'],
  imports: [
    MatSlideToggleModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
    LoadingIndComponent,
  ],
})
export class TwentyTestComponent implements OnInit, OnDestroy {
  NOT_ANSWERED = 0;
  CORRECT = 1;
  INCORRECT = 2;
  questions: any[] = [];
  questionState: number[] = [];
  questionsValidated = false;
  loading = true;
  favoritesOnly = false;

  classId = -1;
  setId = -1;
  hasFavorites = false;
  shortcutSubscriptions$: Subscription[] = [];
  numberTestQuestions = 20;
  getCountryEmoji = getCountryEmoji;

  @ViewChildren('input') inputs: any;

  constructor(
    private voby: VobyService,
    private profile: ProfileService,
    private hotkeys: HotkeysService,
    private router: Router,
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.classId = state['classId'];
      this.setId = state['setId'];
      this.hasFavorites = state['hasFavorites'];
    }

    this.hotkeys.shortcuts$.subscribe((shortcuts) => {
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
    this.voby.getOptions().subscribe({
      next: (data: any) => {
        this.numberTestQuestions = data.find(
          (o: any) => o.key === 'numTestQuestions',
        ).value;
        this.voby
          .getTestWords(this.numberTestQuestions, classId, setId, favoritesOnly)
          .subscribe({
            next: (data: any) => {
              this.questions = data;
              this.questions.forEach(() => {
                this.questionState.push(this.NOT_ANSWERED);
              });
            },
            error: () => {
              this.loading = false;
            },
            complete: () => (this.loading = false),
          });
      },
      error: () => {
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  validateAnswers() {
    if (this.inputs) {
      const userAnswers = this.inputs
        .toArray()
        .map((input: ElementRef, index: number) => ({
          wordId: this.questions[index].id,
          answer: input?.nativeElement.value,
          targetLanguage: this.questions[index].target_language,
          classId: this.classId,
        }));

      this.voby.validateTestWords(userAnswers).subscribe({
        next: (validationResults: any) => {
          validationResults.forEach((result: any, index: number) => {
            if (result.isCorrect) {
              this.questionState[index] = this.CORRECT;
              this.profile.add(2);
            } else {
              this.questionState[index] = this.INCORRECT;
            }
          });

          this.questionsValidated = true;
        },
        error: () => {
          console.error('Validation failed');
        },
      });
    }
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
