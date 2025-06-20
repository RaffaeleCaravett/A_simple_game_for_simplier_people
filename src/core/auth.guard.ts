import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }


  isAuthenticated: boolean = false;


  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.isAuthenticated) {
      this.router.navigate(['/home'])
    }
    return this.isAuthenticated;
  }
  authenticateUser(bool?: boolean) {
    if (bool) {
      this.isAuthenticated = bool
    } else {
      this.isAuthenticated = false
    }
  }
}