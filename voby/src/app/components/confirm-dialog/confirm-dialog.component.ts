import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA } from '@angular/material/legacy-dialog';
@Component({
  selector: 'voby-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  verb: string = 'delete';

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_LEGACY_DIALOG_DATA) data: {verb: string}
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
