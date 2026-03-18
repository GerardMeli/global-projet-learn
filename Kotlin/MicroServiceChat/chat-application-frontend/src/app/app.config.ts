import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { GlobalErrorHandler } from './global-error.handler';
import { CoreModule } from './core/core.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '@auth0/angular-jwt';
import { embedTokenInitializer } from './core/initializer/embed-token.initializer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    importProvidersFrom(CoreModule),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }

    {
      provide: APP_INITIALIZER,
      useFactory: embedTokenInitializer,
      multi: true
    }
 
  ]
};
