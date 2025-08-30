import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Set } from 'src/app/interfaces';
import { VobyService } from 'src/app/services/voby.service';
import { SetFormComponent } from '../forms/set-form/set-form.component';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { SnackbarComponent } from '../custom/snackbar/snackbar.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'voby-set-card',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './set-card.component.html',
  styleUrl: './set-card.component.scss',
})
export class SetCardComponent {
  @Input() setData!: Set;
  @Input() vclassId = -1;
  @Output() setDeleted = new EventEmitter<number>();
  generateWordsLoading = false;

  constructor(
    private router: Router,
    public voby: VobyService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) {}

  redirect() {
    this.router.navigate(['/set/' + this.setData?.id], {
      state: { selectedSet: this.setData, selectedClass: undefined },
    });
  }

  startTest() {
    this.router.navigate(['/test/'], {
      state: {
        classId: this.vclassId,
        setId: this.setData?.id,
        hasFavorites: this.setData?.has_favorites,
      },
    });
  }

  editSet(event: any) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(SetFormComponent, {
      width: '30%',
      data: {
        setId: this.setData?.id,
        name: this.setData?.name,
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res && this.setData) {
        this.setData.name = res.name;
      }
    });
  }

  deleteSet(event: any) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {});
    dialogRef.afterClosed().subscribe((res) => {
      if (res.confirmed === true) {
        this.voby.deleteSet(this.setData.id).subscribe({
          next: () => {
            this.setDeleted.emit(this.setData.id);
          },
          error: (error: any) => {
            this._snackBar.openFromComponent(SnackbarComponent, {
              data: {
                message: 'Error: ' + error.statusText,
                icon: 'error',
              },
              duration: 3 * 1000,
            });
          },
        });
      }
    });
  }

  generateWords(event: any) {
    event.stopPropagation();
    if (!this.generateWordsLoading) {
      this.generateWordsLoading = true;
      this.voby.generateWords(this.setData.id).subscribe({
        next: (data: any) => {
          if (data.length > 0) {
            // this.getClasses();
          } else {
            this._snackBar.openFromComponent(SnackbarComponent, {
              data: {
                message: 'Info: No words could be created, please try again.',
                icon: 'info',
              },
              duration: 3 * 1000,
            });
          }

          this.generateWordsLoading = false;
        },
        error: (error: any) => {
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: {
              message:
                'Error: ' +
                (error.error?.detail ||
                  error.message ||
                  error.statusText ||
                  'Unknown error'),
              icon: 'error',
            },
            duration: 3 * 1000,
          });
          this.generateWordsLoading = false;
        },
      });
    }
  }
}
