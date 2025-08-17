import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Tag, Word } from 'src/app/interfaces';
import { getCountryEmoji } from 'src/app/countries';
import { Router } from '@angular/router';
import { VobyService } from 'src/app/services/voby.service';
import { WordFormComponent } from '../forms/word-form/word-form.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { SnackbarComponent } from '../custom/snackbar/snackbar.component';
import { WordPreviewComponent } from '../word-preview/word-preview.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';

@Component({
    selector: 'voby-word-detail-panel',
    templateUrl: './word-detail-panel.component.html',
    styleUrls: ['./word-detail-panel.component.scss'],
    imports: [NgIf, MatCardModule, MatButtonModule, MatTooltipModule, MatIconModule, NgFor, MatDividerModule, MatChipsModule, NgClass, WordPreviewComponent, DatePipe]
})
export class WordDetailPanelComponent {

  @Input() word: Word|undefined = undefined;
  @Input() allTags: Tag[] = [];
  @Input() setId: number = -1;
  @Input() vclass: any|undefined;
  @Input() isSet: boolean = true;
  @Output() wordSelected: EventEmitter<any> = new EventEmitter();
  @Output() wordDeselected: EventEmitter<any> = new EventEmitter();
  @Output() wordEdited: EventEmitter<any> = new EventEmitter();
  @Output() wordDeletedOrUnlinked: EventEmitter<any> = new EventEmitter();
  @Output() tagSelected: EventEmitter<any> = new EventEmitter();
  getCountryEmoji = getCountryEmoji;
  wordViewRelatedWord: Word|undefined = undefined;

  constructor(
    public dialog: MatDialog,
    public voby: VobyService,
    private _snackBar: MatSnackBar,
    private router: Router
  ) { }

  deselectWord() {
    this.wordDeselected.emit();
  }

  selectWord(id: number) {
    this.wordSelected.emit(id);
  }

  getFullWordFromId(id:number){ 
    this.voby.getWord(id).subscribe({
      next: (data: any) => {
        this.wordViewRelatedWord = data;
      },
      error: () => {}
    })  
  }

  editWord() {
    const dialogRef = this.dialog.open(WordFormComponent, {
      width: '30%',
      data: {
        word: this.word,
        vclassId: this.vclass.id,
        allTags: this.allTags,
        edit: true
      },
    });

    dialogRef.afterClosed().subscribe((res: any) => {
      this.wordEdited.emit(res);
    })
  }

  deleteWord() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {});
    dialogRef.afterClosed().subscribe(res => {
      if (res && res.confirmed === true) {
        if(this.word) {
          this.voby.deleteWord(this.word.id)
          .subscribe({
            next: () => {
              this.wordDeletedOrUnlinked.emit(this.word);
            },
            error: (error: any) => {
              this._snackBar.openFromComponent(SnackbarComponent, {
                data: {
                  message: 'Error: ' + error.statusText,
                  icon: 'error'
                },
                duration: 3 * 1000
              });
            }
          });
        }
      }
    });
  }

  unlinkWord() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {data: {verb: 'unlink'}});
    dialogRef.afterClosed().subscribe(res => {
      if (res && res.confirmed === true) {
        if (this.word) {
          const setIdx = this.word.sets.findIndex(s => s === this.setId);

          if (setIdx !== -1) {
            const newSets = structuredClone(this.word.sets);
            newSets.splice(setIdx, 1);

            this.voby.editSets(newSets, this.word.id)
            .subscribe({
              next: () => {
                this.wordDeletedOrUnlinked.emit(this.word);
              }
            });
          }
        }
      }
    });
  }

  addTagToSearch(selectedTagId: number) {
    this.tagSelected.emit(selectedTagId);
  }

  relatedWordExit() {
    setTimeout(() => {
      this.wordViewRelatedWord = undefined;
    }, 500);
  }

  selectOrRedirectPreviewWord(word: any) {
    if (!this.isSet) {
      this.router.navigate([`/set/${word?.sets[0]}`], {state: {selectedWord: word}})
    }

    if (this.isSet && word?.sets.includes(this.setId)) {
      this.selectWord(word.id);
    } else {
      this.router.navigate([`/set/${word?.sets[0]}`], {state: {selectedWord: word}})
    }
  }

  @HostListener('document:keydown.alt.e', ['$event']) editWordFormAlt(event: KeyboardEvent) {
    event.preventDefault();
    this.editWord();
  }
}
