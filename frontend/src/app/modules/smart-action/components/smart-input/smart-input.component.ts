import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import { APP_CONFIG } from '../../../../config/app.config';
import { FullState } from '../../../../models/full-state.model';
import {
  submitSmartActionCommand,
  undoSmartAction,
} from '../../state/smart-action.actions';
import {
  selectSmartActionCanUndo,
  selectSmartActionProcessing,
  selectSmartActionResult,
} from '../../state/smart-action.selectors';

@Component({
  selector: 'app-smart-input',
  templateUrl: './smart-input.component.html',
  styleUrls: ['./smart-input.component.scss'],
  standalone: false,
})
export class SmartInputComponent {
  private readonly _store = inject(Store<FullState>);

  protected readonly maxCommandLength =
    APP_CONFIG.SMART_ACTION.INPUT.MAX_COMMAND_LENGTH;

  protected readonly command = signal('');
  protected readonly isProcessing = toSignal(
    this._store.select(selectSmartActionProcessing),
    { initialValue: false }
  );
  protected readonly result = toSignal(
    this._store.select(selectSmartActionResult),
    {
      initialValue: null,
    }
  );
  protected readonly canUndo = toSignal(
    this._store.select(selectSmartActionCanUndo),
    { initialValue: false }
  );

  protected readonly canExecute = computed(
    () =>
      !this.isProcessing() &&
      this.command().trim().length > 0 &&
      this.command().length <= this.maxCommandLength
  );

  public constructor() {
    effect(() => {
      if (this.result()?.success) {
        this.command.set('');
      }
    });
  }

  protected onCommandChange(value: string): void {
    this.command.set(value);
  }

  protected onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) {
      return;
    }
    keyboardEvent.preventDefault();
    this.execute();
  }

  protected execute(): void {
    const commandText = this.command().trim();
    if (!commandText || this.isProcessing()) {
      return;
    }
    this._store.dispatch(submitSmartActionCommand({ command: commandText }));
  }

  protected undo(): void {
    if (!this.canUndo() || this.isProcessing()) {
      return;
    }
    this._store.dispatch(undoSmartAction());
  }
}
