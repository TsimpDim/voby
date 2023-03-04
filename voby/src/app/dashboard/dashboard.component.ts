import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ClassFormComponent } from '../class-form/class-form.component';

@Component({
  selector: 'voby-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(private router: Router, public dialog: MatDialog) { }

  classes: {id: number, name: string, sets: {id: number, name: string}[]}[] = [
    {id: 1, name: 'Barb\'s German B1', sets: [{id: 123, name: 'OESD Model Prufung B1 Deutsch'}, {id: 111, name: 'WIFI Practice Exam B1 Deutsch'}]},
    {id: 2, name: 'London\'s Calling', sets: [{id: 45, name:'Elections & Voting'}]}
  ]

  redirect(id: number) {
    this.router.navigate(['/set/' + id]);
  }

  openClassForm() {
    this.dialog.open(ClassFormComponent, {
      width: '30%',
    });
  }

  createVocabSet(idx: number) {
    this.classes[idx].sets.push({
      id: 1234,
      name: 'New set'  
    })
  }
}
