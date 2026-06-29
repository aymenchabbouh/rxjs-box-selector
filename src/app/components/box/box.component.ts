import { Component, ChangeDetectionStrategy, Input, OnInit, inject, DestroyRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BoxStateService } from '../../box-state.service';
import { Option } from '../../models';

/**
 * Single box in the horizontal row.
 * Receives only its boxId as a classic @Input and fetches its own state from the service.
 * Click events are modeled as an observable stream (boxClick$).
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
  private destroyRef = inject(DestroyRef);

  /** Stream of box click events — modeled as an observable per spec */
  readonly boxClick$ = new Subject<void>();

  /** The option selected for this box (or null) */
  selectedOption$!: Observable<Option | null>;

  /** Whether this box is currently active */
  isActive$!: Observable<boolean>;

  ngOnInit(): void {
    // Set up observables using the boxId — pure RxJS, no signal conversion
    this.selectedOption$ = this.stateService.getSelectionForBox$(this.boxId);
    this.isActive$ = this.stateService.isBoxActive$(this.boxId);

    // Wire box click stream to state service (auto-cleanup on destroy)
    this.boxClick$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.stateService.selectBox(this.boxId);
    });
  }
}
