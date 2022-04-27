import { Injectable } from '@angular/core';
import {
    HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';
import { AuthService } from '../services/auth.service';

import { Observable } from 'rxjs';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private auth: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {

        const authToken = this.auth.getAuthorizationToken();

        const authReq = req.clone({
            headers: req.headers.set('Authorization', authToken)
        });

        return next.handle(authReq);
    }
}