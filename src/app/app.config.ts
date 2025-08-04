import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor, DEFAULT_TIMEOUT } from '../core/auth.interceptor';
import { ErrorInterceptor } from '../core/error.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { RxStompService } from '@stomp/ng2-stompjs';

export const appConfig: ApplicationConfig = {
  providers: [
    RxStompService,
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimations(),
    provideToastr(), provideHttpClient(
      withInterceptorsFromDi()
    ), provideNativeDateAdapter(),
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    [{ provide: DEFAULT_TIMEOUT, useValue: 30000 }]
    , provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync()
  ],
};
