import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { PapaParseModule } from 'ngx-papaparse';


@NgModule({
  declarations: [
    AppComponent
  ], 
  imports: [
    BrowserModule
    , PapaParseModule
  ], 
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
