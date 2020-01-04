import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [ 
    AppComponent
  ],
  imports: [
    RouterModule.forRoot([
      { path: '**', component: AppComponent }
      //{ path: 'home', component: HomeViewComponent },
      //{ path: 'catalog', component: CatalogViewComponent },
      //{ path: '**', redirectTo: 'login' }
    ])
  ],
  exports: [
    RouterModule,
  ],
  providers: [],

})
export class AppRoutingModule {}


