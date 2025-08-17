
import { Inject, Injectable, DOCUMENT } from "@angular/core";
import { EventManager } from "@angular/platform-browser";
import { BehaviorSubject, Observable } from "rxjs";
import { VobyService } from "./voby.service";
import { FormDataService } from "./form-data.service";

type Option = {
  element: any;
  keys: string;
  result: string;
}

interface UserShortcut {
  key_1: string,
  key_2: string,
  result: string,
  id: number
}

@Injectable({ providedIn: 'root' })
export class HotkeysService {
  defaults: Partial<Option> = {
    element: this.document
  }

  shortcuts$: BehaviorSubject<Observable<unknown>[]> = new BehaviorSubject<Observable<unknown>[]>([]);
  shortcutBehaviors: Observable<unknown>[] = [];
  retrieved = false;
    
  constructor(
    private eventManager: EventManager,
    @Inject(DOCUMENT) private document: Document,
    private voby: VobyService,
    private formData: FormDataService
    ) {
      this.voby.getUserShortcuts().subscribe({
        next: (shortcuts: any) => {
          for (let s of shortcuts) {
            this.addShortcut({keys: s.key_1 + '.' + s.key_2, result: s.result});
          }
        },
        complete: () => this.retrieved = true
      });
    }

  addShortcut(option: Partial<Option>) {
    const merged = { ...this.defaults, ...option };
    const event = `keydown.${merged.keys}`;

    this.shortcutBehaviors.push(
      new Observable(observer => {
        const handler = (e: any) => {
          e.preventDefault();

          if(e.target.nodeName !== 'INPUT') {
            return;
          } else {
            const caretIdx = e.target.selectionStart;
            const targetValue = e.target.value;
            e.target.value = targetValue.substring(0, caretIdx) + merged.result + targetValue.substring(caretIdx, targetValue.length+1);
            this.formData.updateFormControlValue({fieldName: e.target.name, newValue: e.target.value});

            const newCaretIdx = caretIdx + merged.result?.length
            e.target.selectionStart = newCaretIdx;
            e.target.selectionEnd = newCaretIdx;
          }

          observer.next(e);
        };
        
        const dispose = this.eventManager.addEventListener(
          merged.element, event, handler
        );

        return () => {
          dispose();
        };
      })
    );

    this.shortcuts$.next(this.shortcutBehaviors);
  }
}