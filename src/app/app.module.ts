import { CUSTOM_ELEMENTS_SCHEMA, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideStorage,getStorage } from '@angular/fire/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { HttpClientModule } from '@angular/common/http'
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [	AppComponent ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    AppRoutingModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxChartsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
