import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VobyService } from '../_services/voby.service';

@Component({
  selector: 'voby-set-form',
  templateUrl: './set-form.component.html',
  styleUrls: ['./set-form.component.scss']
})
export class SetFormComponent {
  setForm: FormGroup;
  loading = false;
  data: {classId: number, setId: number, name: string};

  constructor(
    public dialogRef: MatDialogRef<SetFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: {classId: number, setId: number, name: string},
    public voby: VobyService
  ) {
    this.setForm = new FormGroup({
      name: new FormControl(data.name, [Validators.required])
    });
    this.data = data;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    console.log(this.setForm);
    this.updateSet(this.data.setId, this.setForm.get('name')?.value)
  }

  updateSet(setId: number, name: string) {
    this.voby.updateSet(setId, name)
    .subscribe({
      next: (data) => {
        this.dialogRef.close(data);
      },
      error: () => {
        this.loading = false;
      },
      complete: () => this.loading = false
    })
  }
}
