import { Injectable } from '@angular/core';

export interface PremiumOptions {
  age: number;
  deathCoverAmount: number;
  occupationRatingFactor: number;
}

@Injectable({ providedIn: 'root' })
export class PremiumCalculatorService {
  constructor() {}
  calculate(options: PremiumOptions) {
    //Death Premium = (Death Cover amount * Occupation Rating Factor * Age) /1000 * 12
    return (
      ((options.deathCoverAmount *
        options.occupationRatingFactor *
        options.age) /
        1000) *
      12
    );
  }
}
