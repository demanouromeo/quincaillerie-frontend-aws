import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-search-input',
  template: `
    <label class="search-field">
      <svg class="search-field-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" stroke-width="1.6" />
        <line x1="13.2" y1="13.2" x2="17.5" y2="17.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
      <input
        type="search"
        class="search-field-input"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        [placeholder]="placeholder()"
      />
    </label>
  `
})
export class SearchInput {
  readonly value = model('');
  readonly placeholder = input('Rechercher...');
}
