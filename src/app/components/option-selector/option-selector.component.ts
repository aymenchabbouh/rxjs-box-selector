import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { BoxStateService } from '../../box-state.service';
import { OPTION_CATEGORIES } from '../../models';

/**
 * Displays categorized options for the currently active box.
 * Visible only when a box is selected.
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

  /** Option categories to display */
  categories = OPTION_CATEGORIES;

  /** Active box ID */
  activeBoxId$ = this.stateService.activeBoxId$;

  /** Currently selected option ID for the active box (to highlight it) */
  currentOptionId$ = combineLatest([
    this.stateService.activeBoxId$,
    this.stateService.selections$
  ]).pipe(
    map(([activeId, selections]) => {
      if (activeId === null) return null;
      return selections[activeId] ?? null;
    })
  );

  /** When user picks an option */
  onOptionClick(optionId: string): void {
    this.stateService.selectOption(optionId);
  }
}
