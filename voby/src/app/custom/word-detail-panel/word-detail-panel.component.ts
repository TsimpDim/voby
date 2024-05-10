import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VobyService } from 'src/app/_services/voby.service';
import { Tag, Word } from 'src/app/interfaces';
import { WordFormComponent } from 'src/app/word-form/word-form.component';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { getCountryEmoji } from 'src/app/countries';

@Component({
  selector: 'voby-word-detail-panel',
  templateUrl: './word-detail-panel.component.html',
  styleUrls: ['./word-detail-panel.component.scss']
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
  @Output() wordDeleted: EventEmitter<any> = new EventEmitter();
  @Output() tagSelected: EventEmitter<any> = new EventEmitter();
  getCountryEmoji = getCountryEmoji;
  wordViewRelatedWord: Word|undefined = undefined;

  constructor(
    public dialog: MatDialog,
    public voby: VobyService,
    private _snackBar: MatSnackBar
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
    if(this.word) {
      this.voby.deleteWord(this.word.id)
      .subscribe({
        next: () => {
          this.wordDeleted.emit(this.word);
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
      })
    }
  }

  addTagToSearch(selectedTagId: number) {
    this.tagSelected.emit(selectedTagId);
  }

  @HostListener('document:keydown.alt.e', ['$event']) editWordFormAlt(event: KeyboardEvent) {
    event.preventDefault();
    this.editWord();
  }
}
