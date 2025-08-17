import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { COUNTRY_MAPPING, getCountryEmoji } from 'src/app/countries';
import { VobyService } from 'src/app/services/voby.service';
import { HotkeysService } from 'src/app/services/hotkeys.service';
import { ClassFormComponent } from 'src/app/components/forms/class-form/class-form.component';
import { SnackbarComponent } from 'src/app/components/custom/snackbar/snackbar.component';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { SetFormComponent } from 'src/app/components/forms/set-form/set-form.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { LoadingIndComponent } from '../../components/custom/loading-ind/loading-ind.component';
import { DashboardFlashComponent } from '../../components/dashboard-flash/dashboard-flash.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


export interface DialogData {
  className: string;
}

@Component({
    selector: 'voby-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    imports: [MatButtonModule, MatIconModule, DashboardFlashComponent, LoadingIndComponent, MatSelectModule, MatOptionModule, MatCardModule, MatRippleModule, MatTooltipModule]
})
export class DashboardComponent implements OnInit {
  className = '';
  selectedClassId: number = -1;
  selectedClass: any = {};
  toShowQuizButton = false;
  getCountryEmoji = getCountryEmoji;
  shortcutSubscriptions$: Subscription[] = [];

  constructor(
    private router: Router,
    public voby: VobyService,
    private _snackBar: MatSnackBar,
    private hotkeys: HotkeysService,
    public dialog: MatDialog) {
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

  classes: any = [];
  loading = true;
  countryMapping = COUNTRY_MAPPING;
  @ViewChild('downloadZipLink') private downloadZipLink: ElementRef | undefined;

  ngOnInit(): void {
    this.getClasses();

    const quizShow = localStorage.getItem('quiz_show');
    this.toShowQuizButton =  quizShow === 'false' || quizShow === null;
  }

  ngOnDestroy() {
    for (const s of this.shortcutSubscriptions$) {
      s.unsubscribe();
    }
  }

  showQuiz() {
    this.toShowQuizButton = false;
    localStorage.setItem('quiz_show', 'true');
  }

  hideQuiz() {
    this.toShowQuizButton = true;
  }
  
  startTest(classId: number, setId: number) {
    const selectedSet = this.selectedClass.sets.find((s: any) => s.id === setId);
    let hasFavorites = false;
    if (selectedSet) {
      hasFavorites = selectedSet.has_favorites;
    } else {
      hasFavorites = this.selectedClass.sets.filter((s: any) => s.has_favorites).length > 0;
    }

    this.router.navigate(['/test/'], {state: {classId, setId, hasFavorites}});
  }

  startGermanNounTest(classId: number, setId: number) {
    const selectedSet = this.selectedClass.sets.find((s: any) => s.id === setId);

    let hasFavorites = false;
    if (selectedSet) {
      hasFavorites = selectedSet.has_favorites;
    } else {
      hasFavorites = this.selectedClass.sets.filter((s: any) => s.has_german_favorites).length > 0;
    }

    this.router.navigate(['/german/noun-test/'], {state: {classId, setId, hasFavorites}});
  }

  hasWords(classId: number) {
    const selectedClass = this.classes.find((o: any) => o.id === classId);
    return selectedClass.sets.flatMap((s: any) => s.has_words)[0];
  }

  redirect(setId: number) {
    const selectedClass = this.classes.find((o: any) => o.id === this.selectedClassId);
    const selectedSet = selectedClass.sets.find((s: any) => s.id === setId);
    this.router.navigate(['/set/' + setId], {state: {selectedSet, selectedClass}});
  }

  selectClass(classIdx: number) {
    if (classIdx === -1) {
      if (this.classes.length > 0) { // Separate if, to avoid recursion
        this.selectedClass = this.classes[0];
        this.selectedClassId = this.selectedClass.id;
      }
    } else {
      this.selectedClassId = classIdx;
      this.selectedClass = this.classes.find((c: any) => c.id === classIdx);
      if (!this.selectedClass) { // For some reason the specified class id was not found. Maybe it's a new user on the same browser
        this.selectClass(-1);
      }
    }
    
    window.localStorage.setItem('selectedClass', this.selectedClassId.toString());
  }

  openClassForm() {
    const dialogRef = this.dialog.open(ClassFormComponent, {
      width: '30%',
      data: {
        edit: false,
        firstClass: this.classes.length === 0
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.classes.push(result);
        this.selectClass(result.id);
      }
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
    const selectedClass = this.classes.find((o: any) => o.id === this.selectedClassId);

    this.router.navigate(['/class/' + classIdx], { state: {selectedClass} });
  }

  getClasses() {
    this.voby.getClasses()
    .subscribe({
      next: (data) => {
        this.classes = data;
        this.selectClass(Number(window.localStorage.getItem('selectedClass') || -1));
        this.dialog.closeAll();

        if (this.classes.length === 0) {
          this.openClassForm();
        }
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {});
    dialogRef.afterClosed().subscribe(res => {
      if (res.confirmed === true) {
        this.voby.deleteClass(index)
        .subscribe({
          next: () => {
            const classToRemove = this.classes.findIndex((c:any) => c.id === index);
            this.classes.splice(classToRemove, 1);

            this._snackBar.openFromComponent(SnackbarComponent, {
              data: {
                message: "Class successfuly deleted",
                icon: 'info'
              },
              duration: 3 * 1000
            });

            // If the last class was deleted, show the 
            // class creation form
            if (this.classes.length === 0) {
              this.openClassForm();
            } else {
              this.selectClass(-1);
            }
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
    })
  }

  editSet(event: any, setIdx: number) {
    event.stopPropagation();

    let setToChange = this.classes.flatMap((c: any) => c.sets).find((s: any) => s.id === setIdx);
    const dialogRef = this.dialog.open(SetFormComponent, {
      width: '30%',
      data: {
        setId: setIdx,
        name: setToChange.name
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        setToChange.name = res.name;
      }
    })
  }

  editClass(classIdx: number) {
    let classToChange = this.classes.find((c: any) => c.id === classIdx);
    const dialogRef = this.dialog.open(ClassFormComponent, {
      width: '30%',
      data: {
        edit: true,
        classId: classIdx,
        name: classToChange.name,
        sourceLanguage: classToChange.source_language,
        targetLanguage: classToChange.target_language
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        classToChange.name = res.name;
        classToChange.source_language = res.source_language;
        classToChange.target_language = res.target_language;
      }
    })
  }

  deleteSet(event: any, setIdx: number) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {});
    dialogRef.afterClosed().subscribe(res => {
      if (res.confirmed === true) {
        this.voby.deleteSet(setIdx)
        .subscribe({
          next: () => {
            const vclass = this.classes.find((c: any) => c.sets.find((c:any) => c.id == setIdx));
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
