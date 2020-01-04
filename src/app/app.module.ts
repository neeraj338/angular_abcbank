import 'hammerjs';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HttpClientModule } from '@angular/common/http';

import { AppMaterialModule } from './AppMaterialModule';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppMaterialModule,
    HttpModule,
    BrowserAnimationsModule
  ],
  declarations: [AppComponent],
  providers: [
 ],
  entryComponents: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
