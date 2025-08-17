import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { getCountryEmoji } from 'src/app/countries';
import { TestWord } from 'src/app/interfaces';
import { ExperienceService } from 'src/app/services/experience.service';
import { VobyService } from 'src/app/services/voby.service';
import { stringSimilarity } from 'src/app/string-similarity';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingIndComponent } from '../custom/loading-ind/loading-ind.component';

@Component({
  selector: 'voby-dashboard-flash',
  templateUrl: './dashboard-flash.component.html',
  styleUrls: ['./dashboard-flash.component.scss'],
  imports: [
    LoadingIndComponent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class DashboardFlashComponent implements OnInit, OnChanges {
  @ViewChild('translation') translation: ElementRef | undefined;
  @Output() close = new EventEmitter<any>();

  testWord: TestWord | undefined;
  loading = false;
  @Input() hide = false;
  @Input() recalculate = false;
  getCountryEmoji = getCountryEmoji;

  answerCorrect: boolean | undefined;

  constructor(
    private voby: VobyService,
    private exp: ExperienceService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const toShow = localStorage.getItem('quiz_show');
    if (toShow === 'true' && changes['hide'].previousValue) {
      this.getTestWord();
    }
  }

  ngOnInit(): void {
    const toShow = localStorage.getItem('quiz_show');
    if (toShow === 'true') {
      this.getTestWord();
    } else {
      this.hide = true;
    }
  }

  closeTest() {
    localStorage.setItem('quiz_show', 'false');
    this.hide = true;
    this.close.emit();
  }

  getTestWord() {
    this.voby.getTestWords().subscribe({
      next: (data: any) => {
        this.testWord = data[0];
      },
      error: () => {
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  createTestAnswer(correct: boolean) {
    this.voby.createQuizAnswer(correct).subscribe();
  }

  checkAnswer() {
    if (this.testWord) {
      const answer = this.translation?.nativeElement.value;

      let timeToWait = 0;
      if (
        this.testWord.translations
          .split(' / ')
          .find((t) => stringSimilarity(t, answer) >= 0.7)
      ) {
        this.answerCorrect = true;
        timeToWait = 2000;
        this.exp.add(4);
      } else {
        this.answerCorrect = false;
        timeToWait = 3000;
        this.exp.add(1);
      }

      this.createTestAnswer(this.answerCorrect);

      setTimeout(() => {
        this.getTestWord();
        this.answerCorrect = undefined;
      }, timeToWait);
    }
  }
}
