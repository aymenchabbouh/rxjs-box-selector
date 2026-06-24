import { Component, ChangeDetectionStrategy, Input, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { BoxStateService } from '../../box-state.service';
import { Option } from '../../models';

/**
 * Single box in the horizontal row.
 * Receives only its boxId as a classic @Input and fetches its own state from the service.
 */
@Component({
  selector: 'app-box',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './box.component.html',
  styleUrl: './box.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoxComponent implements OnInit {
  /** Box ID (1–10) passed from parent — classic @Input */
  @Input({ required: true }) boxId!: number;

  private stateService = inject(BoxStateService);

  /** The option selected for this box (or null) */
  selectedOption$!: Observable<Option | null>;

  /** Whether this box is currently active */
  isActive$!: Observable<boolean>;

  ngOnInit(): void {
    // Set up observables using the boxId — pure RxJS, no signal conversion
    this.selectedOption$ = this.stateService.getSelectionForBox$(this.boxId);
    this.isActive$ = this.stateService.isBoxActive$(this.boxId);
  }

  /** Click handler — activate this box */
  onBoxClick(): void {
    this.stateService.selectBox(this.boxId);
  }
}
