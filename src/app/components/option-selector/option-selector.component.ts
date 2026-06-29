import { Component, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { combineLatestWith, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BoxStateService } from '../../box-state.service';
import { OPTION_CATEGORIES } from '../../models';

/**
 * Displays categorized options for the currently active box.
 * Visible only when a box is selected.
 * Option click events are modeled as an observable stream (optionClick$).
 */
@Component({
  selector: 'app-option-selector',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './option-selector.component.html',
  styleUrl: './option-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionSelectorComponent {
  private stateService = inject(BoxStateService);
  private destroyRef = inject(DestroyRef);

  /** Option categories to display */
  categories = OPTION_CATEGORIES;

  /** Active box ID */
  activeBoxId$ = this.stateService.activeBoxId$;

  /** Currently selected option ID for the active box (to highlight it) */
  currentOptionId$ = this.stateService.activeBoxId$.pipe(
    combineLatestWith(this.stateService.selections$),
    map(([activeId, selections]) => {
      if (activeId === null) return null;
      return selections[activeId] ?? null;
    })
  );

  /** Stream of option click events — modeled as an observable per spec */
  readonly optionClick$ = new Subject<string>();

  constructor() {
    // Wire option click stream to state service (auto-cleanup on destroy)
    this.optionClick$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(optionId => {
      this.stateService.selectOption(optionId);
    });
  }

  getColumnLimit(totalOptions: number): number {
    switch (true) {
      case totalOptions <= 20: return Math.ceil(totalOptions / 2);
      default: return 20;
    }
  }
}
