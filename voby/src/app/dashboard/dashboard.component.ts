import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ClassFormComponent } from '../class-form/class-form.component';
import { VobyService } from '../_services/voby.service';
import { COUNTRY_MAPPING, getCountryEmoji } from '../countries';
import { SetFormComponent } from '../set-form/set-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../custom/snackbar/snackbar.component';

export interface DialogData {
  className: string;
}

@Component({
  selector: 'voby-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  className = '';
  selectedClass: number = -1;
  toShowQuizButton = false;
  getCountryEmoji = getCountryEmoji;

  constructor(
    private router: Router,
    public voby: VobyService,
    private _snackBar: MatSnackBar, 
    public dialog: MatDialog) { }

  classes: any = null;
  loading = true;
  countryMapping = COUNTRY_MAPPING;
  @ViewChild('downloadZipLink') private downloadZipLink: ElementRef | undefined;

  ngOnInit(): void {
    this.getClasses();

    const quizShow = localStorage.getItem('quiz_show');
    this.toShowQuizButton =  quizShow === 'false' || quizShow === null;
  }

  showQuiz() {
    this.toShowQuizButton = false;
    localStorage.setItem('quiz_show', 'true');
  }

  hideQuiz() {
    this.toShowQuizButton = true;
  }
  
  startTest(classId: number, setId: number) {
    this.router.navigate(['/test/'], {state: {classId, setId}});
  }

  redirect(setId: number) {
    const selectedClass = this.classes.find((o: any) => o.id === this.selectedClass);
    const selectedSet = selectedClass.sets.find((s: any) => s.id === setId);
    const classWords: any[] = [];
    selectedClass.sets.forEach((set: any) => {
      set.words.forEach((word: any) => {
        classWords.push({id: word.id, word: word.word});
      });
    });
    this.router.navigate(['/set/' + setId], {state: {selectedSet, selectedClass, allWords: classWords}});
  }

  selectClass(classIdx: number) {
    this.selectedClass = classIdx;
  }

  openClassForm() {
    const dialogRef = this.dialog.open(ClassFormComponent, {
      width: '30%'
    });

    //  TODO:: Remove this
    dialogRef.afterClosed().subscribe(result => {
      this.getClasses();
    });
  }

  createVocabSet(classIdx: number) {
    this.voby.createSet(classIdx, 'New set')
    .subscribe({
      next: (data) => {
        this.classes.find((c: any) => c.id === classIdx).sets.push(data);
      },
      error: (error: any) => {
        this.loading = false;
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: 'Error: ' + error.statusText,
            icon: 'error'
          },
          duration: 3 * 1000
        });
      },
      complete: () => this.loading = false
    })
  }

  showAllWordsOfClass(classIdx: number) {
    const selectedClass = this.classes.find((o: any) => o.id === this.selectedClass);
    const allWords = selectedClass.sets.map((s: any) => s.words).flat();

    this.router.navigate(['/class/' + classIdx], { state: {selectedClass, allWords} });
  }

  getClasses() {
    this.voby.getClasses()
    .subscribe({
      next: (data) => {
        this.classes = data;
        if (this.classes.length === 1) {
          this.selectClass(this.classes[0].id);
        }
        this.dialog.closeAll();
      },
      error: (error: any) => {
        this.loading = false;
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: 'Error: ' + error.statusText,
            icon: 'error'
          },
          duration: 3 * 1000
        });
      },
      complete: () => this.loading = false
    })
  }

  deleteClass(index: number) {
    this.voby.deleteClass(index)
    .subscribe({
      next: () => {
        this.getClasses();
      },
      error: (error: any) => {
        this.loading = false;
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: 'Error: ' + error.statusText,
            icon: 'error'
          },
          duration: 3 * 1000
        });
      },
      complete: () => this.loading = false
    })
  }

  editSet(event: any, classIdx: number, setIdx: number) {
    event.stopPropagation();

    let setToChange = this.classes.find((c: any) => c.id === classIdx).sets.find((s: any) => s.id === setIdx);
    const dialogRef = this.dialog.open(SetFormComponent, {
      width: '30%',
      data: {
        classId: classIdx,
        setId: setIdx,
        name: setToChange.name
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      setToChange.name = res.name;
    })
  }

  editClass(classIdx: number) {
    let classToChange = this.classes.find((c: any) => c.id === classIdx);
    const dialogRef = this.dialog.open(ClassFormComponent, {
      width: '30%',
      data: {
        classId: classIdx,
        name: classToChange.name,
        source_language: classToChange.source_language,
        target_language: classToChange.target_language
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      classToChange.name = res.name;
      classToChange.source_language = res.source_language;
      classToChange.target_language = res.target_language;
    })
  }

  deleteSet(event: any, classIdx: number, setIdx: number) {
    event.stopPropagation();

    this.voby.deleteSet(setIdx)
    .subscribe({
      next: () => {
        const vclass = this.classes.find((c: any) => c.id === classIdx);
        vclass.sets.splice(vclass.sets.findIndex((s: any) => s.id === setIdx), 1);
      },
      error: (error: any) => {
        this.loading = false;
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: 'Error: ' + error.statusText,
            icon: 'error'
          },
          duration: 3 * 1000
        });
      },
      complete: () => this.loading = false
    })
  }

  downloadClassReport(classId: number) {
    this.voby.downloadClassReport(classId)
    .subscribe({
      next: (blob: any) => {
        const vclass = this.classes.find((c: any) => c.id === classId);
        const url = window.URL.createObjectURL(blob);
  
        const link = this.downloadZipLink?.nativeElement;
        link.href = url;
        link.download = vclass.name + '.xls';
        link.click();
       
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        this.loading = false;
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: 'Error: ' + error.statusText,
            icon: 'error'
          },
          duration: 3 * 1000
        });
      },
      complete: () => this.loading = false
    })
  }
}
