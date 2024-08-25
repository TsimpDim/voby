import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
@Component({
  selector: 'voby-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {}


  onNoClick(): void {
    this.dialogRef.close({'confirmed': false});
  }

  onConfirm(): void {
    this.dialogRef.close({'confirmed': true});
  }
}
