import { Component, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BoxStateService } from './box-state.service';
import { BoxComponent } from './components/box/box.component';
import { OptionSelectorComponent } from './components/option-selector/option-selector.component';
import { TOTAL_BOXES } from './models';

/**
 * Root component — horizontal box row with total value and option selector below.
 * All state accessed through BoxStateService.
 * User actions are modeled as observable streams (removeAll$).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BoxComponent, OptionSelectorComponent, AsyncPipe, DecimalPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private stateService = inject(BoxStateService);
  private destroyRef = inject(DestroyRef);

  /** Array [1..10] for rendering boxes */
  boxIds = Array.from({ length: TOTAL_BOXES }, (_, i) => i + 1);

  /** Whether a box is currently active */
  hasActiveBox$ = this.stateService.activeBoxId$.pipe(map(id => id !== null));

  /** Whether any selections exist */
  hasSelections$ = this.stateService.selections$.pipe(
    map(sel => Object.keys(sel).length > 0)
  );

  /** Sum of all selected option values */
  totalValue$ = this.stateService.totalValue$;

  /** Stream of "remove all" button click events — modeled as an observable per spec */
  readonly removeAll$ = new Subject<void>();

  constructor() {
    // Wire remove-all click stream to state service (auto-cleanup on destroy)
    this.removeAll$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.stateService.removeAll();
    });
  }
}
