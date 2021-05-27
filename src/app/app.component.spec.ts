import {
  ComponentFixture,
  fakeAsync,
  flush,
  flushMicrotasks,
  TestBed,
  tick,
} from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatDatepickerInputHarness } from '@angular/material/datepicker/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { TALMaterialModule } from './material.module';
import { PremiumCalculatorService } from './calculator';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let loader: HarnessLoader;
  let service: PremiumCalculatorService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TALMaterialModule,
        BrowserAnimationsModule,
      ],
      declarations: [AppComponent],
      providers: [
        {
          provide: PremiumCalculatorService,
          useValue: {
            calculate() {
              return 10;
            },
          },
        },
      ],
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    service = TestBed.inject(PremiumCalculatorService);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('premium amount section should not be visible when the formControls are invalid', () => {
    expect(component.isPremiumVisible).toEqual(false);
  });
  it('premium amount section should be visible when the formControls are valid', () => {
    component.nameControl.setValue('Test');
    component.ageControl.setValue(12);
    component.occupationControl.setValue('Doctor');
    component.dateOfBirthControl.setValue(Date.now());
    component.deathCoverAmountControl.setValue(10000);
    component.formGroup.markAllAsTouched();
    component.formGroup.updateValueAndValidity();

    expect(component.isPremiumVisible).toEqual(true);
  });

  it('premium amount section should not be visible when the age is not present', () => {
    component.nameControl.setValue('Test');
    component.occupationControl.setValue('Doctor');
    component.dateOfBirthControl.setValue(Date.now());
    component.deathCoverAmountControl.setValue(10000);
    component.formGroup.markAllAsTouched();
    component.formGroup.updateValueAndValidity();

    expect(component.isPremiumVisible).toEqual(false);
  });

  fit(`should call 'calculateSumAssured' when form is valid`, async () => {
    const spy = spyOn(component.premiumCalculator, 'calculate');

    const select = await loader.getHarness(MatSelectHarness);
    await select.clickOptions();

    const datePicker = await loader.getHarness(MatDatepickerInputHarness);
    await datePicker.setValue('2021-12-10');

    const deathCoverAmountInput = fixture.debugElement.query(
      By.css('input[formcontrolname="deathCoverAmount"]')
    );

    deathCoverAmountInput.nativeElement.blur();
    deathCoverAmountInput.nativeElement.value = 12000;
    await deathCoverAmountInput.nativeElement.dispatchEvent(new Event('input'));

    const ageInput = fixture.debugElement.query(
      By.css('input[formcontrolname="age"]')
    );
    ageInput.nativeElement.value = 12;
    await ageInput.nativeElement.dispatchEvent(new Event('input'));

    component.nameControl.setValue('Test');
    component.formGroup.markAllAsTouched();
    component.formGroup.updateValueAndValidity();

    fixture.detectChanges();

    expect(component.formGroup.valid).toBe(true);
    expect(spy).toHaveBeenCalled();
  });
});
