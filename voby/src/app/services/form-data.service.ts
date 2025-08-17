import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface Change {
  fieldName: string;
  newValue: any;
}

@Injectable({
  providedIn: 'root',
})
export class FormDataService {
  private formControlValueSubject = new BehaviorSubject<Change>({
    fieldName: '',
    newValue: '',
  });
  formControlValue$: Observable<Change> =
    this.formControlValueSubject.asObservable();

  updateFormControlValue(change: Change) {
    this.formControlValueSubject.next(change);
  }

  clearQueue() {
    this.formControlValueSubject.next({ fieldName: 'null', newValue: 'null' });
  }
}
