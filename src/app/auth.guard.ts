import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, catchError, map, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    const token = localStorage.getItem('token'); 
    if (!token) {
      this.router.navigate(['/']);
      return false;
    }

    return this.authService.verifyToken(token).pipe(
      map(response => {
        if (response.data.verifyToken.valid) { 
          return true;
        } else {
          console.log("inside else")
          this.router.navigate(['/']);
          return false;
        }
      }),
      catchError(error => {
         this.authService.logOutTimer(localStorage.getItem('id') || '');
        console.error('Token verification failed:', error);
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
  
}
