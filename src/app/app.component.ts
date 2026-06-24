import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { map } from 'rxjs/operators';
import { BoxStateService } from './box-state.service';
import { BoxComponent } from './components/box/box.component';
import { OptionSelectorComponent } from './components/option-selector/option-selector.component';
import { TOTAL_BOXES } from './models';

/**
 * Root component — horizontal box row with total value and option selector below.
 * All state accessed through BoxStateService.
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

  /** Clear everything */
  onRemoveAll(): void {
    this.stateService.removeAll();
  }
}
