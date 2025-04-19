import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'voby-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
    standalone: true,
    imports: []
})
export class ConfirmDialogComponent {
  verb: string = 'delete';

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: {verb: string}
  ) {
    if (data && data.verb) {
      this.verb = data.verb;
    }
  }

  onNoClick(): void {
    this.dialogRef.close({'confirmed': false});
  }

  onConfirm(): void {
    this.dialogRef.close({'confirmed': true});
  }
}
