import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ClassFormComponent } from '../class-form/class-form.component';
import { VobyService } from '../_services/voby.service';
import { COUNTRY_MAPPING, getCountryEmoji } from '../countries';

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
  // classes: {id: number, name: string, sets: {id: number, name: string}[]}[] = [
  //   {id: 1, name: 'Barb\'s German B1', sets: [{id: 123, name: 'OESD Model Prufung B1 Deutsch'}, {id: 111, name: 'WIFI Practice Exam B1 Deutsch'}]},
  //   {id: 2, name: 'London\'s Calling', sets: [{id: 45, name:'Elections & Voting'}]}
  // ]

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
      width: '30%',
      data: {className: this.className},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getClasses();
    });
  }

  createVocabSet(classIdx: number) {
    this.voby.createSet(classIdx, 'New set')
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

  getClasses() {
    this.voby.getClasses()
    .subscribe({
      next: (data) => {
        this.classes = data;
        console.log(data);
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
}
