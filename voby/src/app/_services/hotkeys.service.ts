import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { EventManager } from "@angular/platform-browser";
import { Observable } from "rxjs";

type Option = {
  element: any;
  keys: string;
}

@Injectable({ providedIn: 'root' })
export class HotkeysService {
  defaults: Partial<Option> = {
    element: this.document
  }
    
  constructor(private eventManager: EventManager,
              @Inject(DOCUMENT) private document: Document) {
  }

  addShortcut(option: Partial<Option>) {
    const merged = { ...this.defaults, ...option };
    const event = `keydown.${merged.keys}`;

    return new Observable(observer => {
      const handler = (e: any) => {
        e.preventDefault()
        observer.next(e);
      };
      
      const dispose = this.eventManager.addEventListener(
         merged.element, event, handler
      );

      return () => {
        dispose();
      };
    })
  }
}