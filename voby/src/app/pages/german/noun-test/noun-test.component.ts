import { Component, OnInit, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ExperienceService } from 'src/app/services/experience.service';
import { VobyService } from 'src/app/services/voby.service';
import { stringSimilarity } from 'src/app/string-similarity';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoadingIndComponent } from '../../../components/custom/loading-ind/loading-ind.component';

@Component({
  selector: 'noun-test',
  templateUrl: './noun-test.component.html',
  styleUrls: ['./noun-test.component.scss'],
  imports: [
    LoadingIndComponent,
    MatSlideToggleModule,
    MatIconModule,
    MatExpansionModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    MatButtonModule,
  ],
})
export class NounTestComponent implements OnInit {
  NOT_ANSWERED = 0;
  CORRECT = 1;
  INCORRECT = 2;
  questions: any[] = [];
  questionState: number[] = [];
  questionsValidated = false;
  loading = true;
  favoritesOnly = false;
  numberTestQuestions = 20;

  classId = -1;
  setId = -1;
  hasFavorites = false;

  @ViewChildren('input') inputs: any;

  constructor(
    private voby: VobyService,
    private exp: ExperienceService,
    private router: Router,
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.classId = state['classId'];
      this.setId = state['setId'];
      this.hasFavorites = state['hasFavorites'];
    }
  }

  ngOnInit(): void {
    this.getTestQuestions(this.classId, this.setId, this.favoritesOnly);
  }

  getTestQuestions(classId: number, setId: number, favoritesOnly: boolean) {
    this.voby.getOptions().subscribe({
      next: (data: any) => {
        this.numberTestQuestions = data.find(
          (o: any) => o.key === 'numTestQuestions',
        ).value;
        this.voby
          .getGermanNounTestWords(
            this.numberTestQuestions,
            classId,
            setId,
            favoritesOnly,
          )
          .subscribe({
            next: (data: any) => {
              this.questions = data;
              this.questions.forEach((e) => {
                this.questionState.push(this.NOT_ANSWERED);
              });
            },
            error: () => {
              this.loading = false;
            },
            complete: () => (this.loading = false),
          });
      },
      error: (error: any) => {
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  validateAnswers() {
    let correct = 0;
    if (this.inputs) {
      this.inputs._results.forEach((input: any, index: number) => {
        const userAnswer = input._elementRef.nativeElement.textContent;
        const correctAnswer = this.questions[index].gender;
        if (
          correctAnswer
            .split(' / ')
            .find((t: string) => stringSimilarity(t, userAnswer) >= 0.7)
        ) {
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
