import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  takeUntil,
} from 'rxjs/operators';
import { OCCUPATION_LIST, OCCUPATION_RATING } from './app.constants';
import { PremiumCalculatorService, PremiumOptions } from './calculator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  sumAssured: string;
  formGroup = this.getForm();
  destroyed$ = new Subject();
  occupations = OCCUPATION_LIST;

  get nameControl() {
    return this.formGroup.get('name') as AbstractControl;
  }

  get ageControl(): AbstractControl {
    return this.formGroup.get('age') as AbstractControl;
  }

  get dateOfBirthControl(): AbstractControl {
    return this.formGroup.get('dateOfBirth') as AbstractControl;
  }
  get occupationControl(): AbstractControl {
    return this.formGroup.get('occupation') as AbstractControl;
  }

  get deathCoverAmountControl(): AbstractControl {
    return this.formGroup.get('deathCoverAmount') as AbstractControl;
  }

  get isPremiumVisible() {
    return (
      this.isControlValid(this.nameControl) &&
      this.isControlValid(this.ageControl) &&
      this.isControlValid(this.dateOfBirthControl) &&
      this.isControlValid(this.occupationControl) &&
      this.isControlValid(this.deathCoverAmountControl)
    );
  }

  constructor(
    private fb: FormBuilder,
    private premiumCalculator: PremiumCalculatorService
  ) {
    this.formGroup = this.getForm();
  }

  ngOnInit() {
    this.registerFormControlChanges();
  }
  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public calculateSumAssured(
    age: number,
    occupationRatingFactor: number,
    deathCoverAmount: number
  ) {
    this.sumAssured = this.premiumCalculator
      .calculate({
        age,
        occupationRatingFactor,
        deathCoverAmount,
      })
      .toFixed(2);
  }

  private isControlValid(control: AbstractControl | null): boolean {
    return !!(control && control.valid && control.touched);
  }

  private registerFormControlChanges() {
    const age$ = this.liveValueChanges(this.ageControl);
    const occupation$ = this.liveValueChanges(this.occupationControl);
    const deathCoverAmount$ = this.liveValueChanges(
      this.deathCoverAmountControl
    );

    combineLatest([
      age$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map((val) => parseInt(val))
      ),
      occupation$.pipe(distinctUntilChanged()),
      deathCoverAmount$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map((val) => parseInt(val))
      ),
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        ([age = 0, occupation, deathCoverAmount = 0]: [
          age: number,
          occupation: string,
          deathCoverAmount: number
        ]) => {
          const occupationRatingFactor = OCCUPATION_LIST.filter(
            (oc) => oc.key === occupation
          )[0].value;

          console.log(
            `Age:  ${age}, occupationRatingFactor: ${occupationRatingFactor}, deathCoverAmount: ${deathCoverAmount}`
          );

          this.calculateSumAssured(
            age,
            occupationRatingFactor,
            deathCoverAmount
          );
        }
      );
  }
  private liveValueChanges(control: AbstractControl) {
    return control.valueChanges.pipe(takeUntil(this.destroyed$));
  }
  private getForm() {
    return this.fb.group({
      name: ['', Validators.required],
      age: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      occupation: ['', Validators.required],
      deathCoverAmount: ['', Validators.required],
    });
  }
}
