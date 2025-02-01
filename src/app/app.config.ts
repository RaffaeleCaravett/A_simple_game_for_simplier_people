import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from '../core/auth.interceptor';
import { ErrorInterceptor } from '../core/error.interceptor';

export const appConfig: ApplicationConfig = {

  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimations(), 
          provideToastr(),provideHttpClient(
            withInterceptorsFromDi()
          ),
          { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
          { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }]
};
