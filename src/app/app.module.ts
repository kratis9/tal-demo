import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TALMaterialModule } from './material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RestrictLettersOnlyDirective } from './character-only.directive';
import { NumberOnlyDirective } from './number-only.directive';

@NgModule({
  declarations: [
    AppComponent,
    RestrictLettersOnlyDirective,
    NumberOnlyDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TALMaterialModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
