import { Directive, ElementRef, HostListener } from '@angular/core';

const REGEX_FOR_ONLY_LETTERS = /^[A-Za-z ]+$/;

@Directive({
  selector: '[lettersOnly]',
})
export class RestrictLettersOnlyDirective {
  constructor() {}

  @HostListener('keydown', ['$event'])
  public onKeyDown(e: KeyboardEvent) {
    if (!e.key.match(REGEX_FOR_ONLY_LETTERS)) {
      e.preventDefault();
    }
  }
}
