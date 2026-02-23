import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { GlobalErrorHandler } from './global-error.handler';
import { CoreModule } from './core/core.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '@auth0/angular-jwt';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    importProvidersFrom(CoreModule),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ]
};
