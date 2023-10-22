import { Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { stringSimilarity } from '../string-similarity';
import { ExperienceService } from '../_services/experience.service';
import { VobyService } from '../_services/voby.service';

@Component({
  selector: 'voby-twenty-test',
  templateUrl: './twenty-test.component.html',
  styleUrls: ['./twenty-test.component.scss']
})
export class TwentyTestComponent implements OnInit {
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

  @ViewChildren('input') inputs: any;

  constructor(
    private voby: VobyService,
    private exp: ExperienceService,
    private router: Router
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
    this.voby.getTestWords(20, classId, setId, favoritesOnly)
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

