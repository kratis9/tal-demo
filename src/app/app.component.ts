import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  takeUntil,
} from 'rxjs/operators';
import { OCCUPATION_LIST } from './app.constants';
import { PremiumCalculatorService } from './calculator';

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
    this.autoPopulateAge();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onReset() {
    this.formGroup.reset();
    this.formGroup.setErrors(null);
  }

  autoPopulateAge() {
    this.dateOfBirthControl.valueChanges.subscribe((value) => {
      if (value) {
        this.ageControl.setValue(this.ageFromDateOfBirthday(value));
        this.ageControl.markAsTouched();
        this.ageControl.updateValueAndValidity();
      }
    });
  }

  calculateSumAssured(
    age: number,
    occupationRatingFactor: number,
    deathCoverAmount: number
  ) {
    setTimeout(() => {
      this.sumAssured = this.premiumCalculator
        .calculate({
          age,
          occupationRatingFactor,
          deathCoverAmount,
        })
        .toFixed(2);
    }, 0);
  }

  registerFormControlChanges() {
    const age$ = this.liveValueChanges(this.ageControl);
    const dob$ = this.liveValueChanges(this.dateOfBirthControl);
    const occupation$ = this.liveValueChanges(this.occupationControl);
    const deathCoverAmount$ = this.liveValueChanges(
      this.deathCoverAmountControl
    );

    combineLatest([
      dob$.pipe(distinctUntilChanged()),
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
        ([datOfBirth, age = 0, occupation, deathCoverAmount = 0]: [
          datOfBirth: number,
          age: number,
          occupation: string,
          deathCoverAmount: number
        ]) =>
          this.calculateSumAssured(
            age,
            this.extractRatingFactor(occupation),
            deathCoverAmount
          )
      );
  }

  private extractRatingFactor(occupation: string) {
    return OCCUPATION_LIST.filter((oc) => oc.key === occupation)[0].value;
  }

  private isControlValid(control: AbstractControl | null): boolean {
    return !!(control && control.valid && control.touched);
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
  private ageFromDateOfBirthday(dateOfBirth: any): number | null {
    if (!dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age < 1 ? null : age;
  }
}
