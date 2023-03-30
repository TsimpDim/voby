import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ClassFormComponent } from '../class-form/class-form.component';
import { VobyService } from '../_services/voby.service';
import { COUNTRY_MAPPING, getCountryEmoji } from '../countries';
import { SetFormComponent } from '../set-form/set-form.component';

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
  getCountryEmoji = getCountryEmoji;

  constructor(
    private router: Router,
    public voby: VobyService,
    public dialog: MatDialog) { }

  classes: any = null;
  loading = true;
  countryMapping = COUNTRY_MAPPING;

  ngOnInit(): void {
    this.getClasses();
  }

  redirect(setId: number) {
    const selectedClass = this.classes.find((o: any) => o.id === this.selectedClass);
    const selectedSet = selectedClass.sets.find((s: any) => s.id === setId);
    this.router.navigate(['/set/' + setId], {state: {selectedSet, selectedClass}});
  }

  selectClass(classIdx: number) {
    this.selectedClass = classIdx;
  }

  openClassForm() {
    const dialogRef = this.dialog.open(ClassFormComponent, {
      width: '30%'
    });

    // TODO:: Remove this
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
      error: () => {
        this.loading = false;
      },
      complete: () => this.loading = false
    })
  }

  getClasses() {
    this.voby.getClasses()
    .subscribe({
      next: (data) => {
        this.classes = data;
        this.dialog.closeAll();
      },
      error: () => {
        this.loading = false;
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
      error: () => {
        this.loading = false;
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
      error: () => {
        this.loading = false;
      },
      complete: () => this.loading = false
    })
  }
}
