import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ShowErrorService } from '../services/show-error.service';
import { FormsService } from '../services/forms.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private showError: ShowErrorService,
    private formsService: FormsService
  ) { }
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: any) => {
        setTimeout(() => {
          if (err instanceof HttpErrorResponse) {
              if (
                (err.error &&
                  err.error.message &&
                  err.error.message ==
                  'Il token non è valido! Per favore effettua nuovamente il login o refresha la pagina!') ||
                (err.error &&
                  err.error.message &&
                  err.error.message ==
                  'Il token non è valido.') ||
                  (err.status === 401 || err.status === 403)
              ) {
                this.formsService.requestLoginCode.next("");
                let refreshToken = localStorage.getItem('refreshToken');
                let location = localStorage.getItem('location');
                if (refreshToken) {
                  this.authService
                    .verifyRefreshToken(refreshToken!)
                    .subscribe({
                      next: (tokens: any) => {
                        localStorage.setItem('accessToken', tokens.accessToken);
                        localStorage.setItem('refreshToken', tokens.refreshToken);
                        this.authService.setToken(tokens.accessToken);
                        this.authService
                          .verifyAccessToken(tokens.accessToken)
                          .subscribe({
                            next: (user: any) => {
                              if (user) {
                                localStorage.setItem(
                                  'user',
                                  JSON.stringify(user)
                                );
                                this.authService.setUser(user);
                                this.authService.authenticateUser(true);
                                this.router.navigate([`/${location || 'home'}`]);
                              }
                            },
                          });
                      }
                    });
                } else {
                  localStorage.clear();
                  this.authService.authenticateUser(false);
                  this.authService.setUser(null);
                  this.authService.setToken('');
                  if(err?.error?.message != "La password è errata.") this.router.navigate(['/home']);
                }
              } else if (
                err.error &&
                err.error.message &&
                err.error.message ==
                'Il refresh token non è valido. Accedi nuovamente.') {
                this.formsService.requestLoginCode.next("");
                localStorage.clear()
              } else if (err.error &&
                err.error.message &&
                err.error.message ==
                "Abbiamo inviato un codice alla mail da te indicata. Inseriscilo qui sotto.") {
                this.formsService.requestLoginCode.next(err.error.message);
                this.toastr.show("Abbiamo inviato un codice alla mail da te indicata. Inseriscilo qui sotto.");
              } else {
                this.formsService.requestLoginCode.next("");
                let error = null;
                if (null != err?.error?.messageList && err?.error?.messageList.length > 0) {
                  error = err?.error?.messageList[0];
                }
                this.toastr.show(
                  err?.error?.message ||
                  error ||
                  err?.message ||
                  "E' successo qualcosa nell'elaborazione della richiesta"
                );
              }
          }

          this.showError.emitShowSpinner(false);
        }, 1500)
        return new Observable<HttpEvent<any>>();
      })
    );
  }
}