import {
  ComponentFixture,
  fakeAsync,
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
import { TALMaterialModule } from 'src/app/material.module';
import { PremiumCalculatorService } from 'src/app/services/calculator';
import { PremiumCalculatorComponent } from './premium-calculator.component';
import { CommonModule } from '@angular/common';

describe('PremiumCalculatorComponent', () => {
  let component: PremiumCalculatorComponent;
  let fixture: ComponentFixture<PremiumCalculatorComponent>;
  let loader: HarnessLoader;
  let service: PremiumCalculatorService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TALMaterialModule,
        BrowserAnimationsModule,
        CommonModule,
      ],
      declarations: [PremiumCalculatorComponent],
      providers: [PremiumCalculatorService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PremiumCalculatorComponent);
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

  it(`should call 'calculateSumAssured' when form is valid`, fakeAsync(async () => {
    const spyCalculateSumAssured = spyOn(component, 'calculateSumAssured');
    const spyCalculate = spyOn(service, 'calculate');
    await initializeFormControl(loader, fixture);

    tick(2000);
    fixture.detectChanges();
    expect(component.formGroup.valid).toBe(true);
    expect(spyCalculateSumAssured).toHaveBeenCalledTimes(1);
  }));

  it(`should call 'calculateSumAssured' when form is valid`, fakeAsync(async () => {
    const spyCalculate = spyOn(service, 'calculate').and.returnValue(10);
    await initializeFormControl(loader, fixture);

    tick(2000);
    fixture.detectChanges();

    expect(spyCalculate).toHaveBeenCalledTimes(1);
  }));
});

async function initializeFormControl(
  loader: HarnessLoader,
  fixture: ComponentFixture<PremiumCalculatorComponent>
) {
  let component = fixture.componentInstance;
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
}
