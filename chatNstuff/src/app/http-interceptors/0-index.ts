import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { CredentialsInterceptor } from './1-CredentialsInterceptor';
import { AuthInterceptor } from './2-AuthInterceptor';

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];