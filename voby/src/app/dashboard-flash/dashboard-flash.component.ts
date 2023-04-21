import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { VobyService } from '../_services/voby.service';
import { stringSimilarity } from '../string-similarity';

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

  constructor(private voby: VobyService) { }

  ngOnChanges(changes: SimpleChanges): void {
    const toShow = localStorage.getItem('test_show');
    if (toShow === 'true') {
      this.getTestWord();
    }
  }

  ngOnInit(): void {
    const toShow = localStorage.getItem('test_show');
    if (toShow === 'true') {
      this.getTestWord();
    } else {
      this.hide = true;
    }
  }

  closeTest() {
    localStorage.setItem('test_show', 'false');
    this.hide = true;
    this.close.emit();
  }

  getTestWord() {
    this.voby.getTestWord()
    .subscribe({
      next: (data: any) => {
        this.testWord = data;
      },
      error: () => {
        this.loading = false;
      },
      complete: () => this.loading = false
    })
  }

  checkAnswer() {
    if (this.testWord) {
      const answer = this.translation?.nativeElement.value;
      const similarity = stringSimilarity(answer, this.testWord.translation);

      let timeToWait = 0;
      if (similarity >= 0.7) {
        this.answerCorrect = true;
        timeToWait = 2000;
      } else {
        this.answerCorrect = false;
        timeToWait = 3000;
      }

      setTimeout(() => {
        this.getTestWord();
        this.answerCorrect = undefined;
    }, timeToWait);
    }
  }
}
