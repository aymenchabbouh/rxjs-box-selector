import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { BoxState, ALL_OPTIONS, TOTAL_BOXES } from './models';

const STORAGE_KEY = 'boxSelectorState';

/**
 * Central state service for the RxJS version.
 * All state lives here — components read via observables and call methods to update.
 * State is persisted to localStorage so it survives page refreshes.
 */
@Injectable({ providedIn: 'root' })
export class BoxStateService {

  // Single BehaviorSubject holding the entire app state
  private state$ = new BehaviorSubject<BoxState>(this.loadState());

  // --- Observable selectors (components subscribe to these) ---

  /** Currently active box id */
  activeBoxId$ = this.state$.pipe(
    map(s => s.activeBoxId),
    distinctUntilChanged()
  );

  /** Full selections map */
  selections$ = this.state$.pipe(
    map(s => s.selections),
    distinctUntilChanged()
  );

  /** Total value = sum of all selected option values */
  totalValue$ = this.state$.pipe(
    map(s => {
      return Object.values(s.selections).reduce((sum, optionId) => {
        const opt = ALL_OPTIONS.find(o => o.id === optionId);
        return sum + (opt ? opt.value : 0);
      }, 0);
    }),
    distinctUntilChanged()
  );

  /** Get the selected option for a specific box (parameterized selector) */
  getSelectionForBox$(boxId: number) {
    return this.state$.pipe(
      map(s => {
        const optionId = s.selections[boxId];
        if (!optionId) return null;
        return ALL_OPTIONS.find(o => o.id === optionId) ?? null;
      }),
      distinctUntilChanged()
    );
  }

  /** Check if a specific box is the active one */
  isBoxActive$(boxId: number) {
    return this.activeBoxId$.pipe(
      map(activeId => activeId === boxId)
    );
  }

  // --- Actions (components call these to update state) ---

  /** Select/activate a box */
  selectBox(boxId: number): void {
    this.updateState({ activeBoxId: boxId });
  }

  /** Assign an option to the active box, then auto-advance to the next box */
  selectOption(optionId: string): void {
    const current = this.state$.value;
    if (current.activeBoxId === null) return;

    const boxId = current.activeBoxId;
    // Auto-advance: move to next box, or deselect if last box
    const nextBoxId = boxId < TOTAL_BOXES ? boxId + 1 : null;

    this.updateState({
      selections: { ...current.selections, [boxId]: optionId },
      activeBoxId: nextBoxId
    });
  }

  /** Clear all selections and hide the option selector */
  removeAll(): void {
    this.updateState({ selections: {}, activeBoxId: null });
  }

  // --- Private helpers ---

  /** Merge partial state, persist to localStorage, emit new state */
  private updateState(partial: Partial<BoxState>): void {
    const next = { ...this.state$.value, ...partial };
    this.saveState(next);
    this.state$.next(next);
  }

  /** Load state from localStorage (or return defaults) */
  private loadState(): BoxState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore corrupt data */ }
    return { selections: {}, activeBoxId: null };
  }

  /** Save state to localStorage */
  private saveState(state: BoxState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
