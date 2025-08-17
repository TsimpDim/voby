import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'voby-word-preview',
  templateUrl: './word-preview.component.html',
  styleUrls: ['./word-preview.component.scss'],
  imports: [MatCardModule],
})
export class WordPreviewComponent {
  // RelatedWord|Word
  @Input() word: any | undefined = undefined;
  @ViewChild('infoContainer') infoContainer:
    | ElementRef<HTMLElement>
    | undefined;
  @Output() clicked: EventEmitter<any> = new EventEmitter();

  constructor(private elementRef: ElementRef) {}

  updatePosition(posX: number, posY: number): void {
    const element = this.elementRef.nativeElement;
    element?.style.setProperty('top', `${posY}px`);
    element?.style.setProperty('left', `${posX}px`);
  }

  onClick() {
    this.clicked.emit();
  }
}
