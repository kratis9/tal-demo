import { Directive, ElementRef, HostListener } from '@angular/core';

const REGEX_FOR_ONLY_LETTERS = /^[0-9]+$/g;

@Directive({
  selector: '[numberOnly]',
})
export class NumberOnlyDirective {
  constructor() {}
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home'];
  @HostListener('keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    if (!event.key.match(REGEX_FOR_ONLY_LETTERS)) {
      event.preventDefault();
    }
  }
}
