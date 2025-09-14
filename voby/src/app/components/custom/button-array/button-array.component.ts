import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VobyButtonArrayButton } from 'src/app/interfaces';

@Component({
  selector: 'voby-button-array',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './button-array.component.html',
  styleUrl: './button-array.component.scss',
})
export class ButtonArrayComponent {
  @Input() buttons: VobyButtonArrayButton[] = [];
}
