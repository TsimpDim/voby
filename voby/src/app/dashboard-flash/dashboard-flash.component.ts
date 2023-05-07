import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { VobyService } from '../_services/voby.service';
import { stringSimilarity } from '../string-similarity';
import { ExperienceService } from '../_services/experience.service';

@Component({
  selector: 'voby-dashboard-flash',
  templateUrl: './dashboard-flash.component.html',
  styleUrls: ['./dashboard-flash.component.scss']
})
export class DashboardFlashComponent implements OnInit, OnChanges {

  @ViewChild('translation') translation: ElementRef | undefined;
  @Output() close: EventEmitter<any> = new EventEmitter();

  testWord: {word: string, translation: string} | undefined;
  loading = false;
  @Input() hide = false;
  @Input() recalculate = false;

  answerCorrect: boolean | undefined;

  constructor(private voby: VobyService, private exp: ExperienceService) { }

  ngOnChanges(changes: SimpleChanges): void {
    const toShow = localStorage.getItem('quiz_show');
    if (toShow === 'true') {
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
    this.voby.getTestWord()
    .subscribe({
      next: (data: any) => {
        this.testWord = data[0];
      },
      error: () => {
        this.loading = false;
      },
      complete: () => this.loading = false
    })
  }

  createTestAnswer(correct: boolean) {
    this.voby.createQuizAnswer(correct).subscribe();
  }

  checkAnswer() {
    if (this.testWord) {
      const answer = this.translation?.nativeElement.value;
      const similarity = stringSimilarity(answer, this.testWord.translation);

      let timeToWait = 0;
      if (similarity >= 0.7) {
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
