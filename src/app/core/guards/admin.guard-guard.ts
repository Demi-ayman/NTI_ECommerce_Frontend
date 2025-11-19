import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuardGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const isLoggedIn = authService.isLoggedIn();
  const role = authService.getUserRole();
  if(!isLoggedIn){
    router.navigate(['auth/login'],{queryParams:{returnURL:state.url}});
    return false ;
  }

  if(role!=='admin'){
    router.navigate(['/shop']);
    return false;
  }
  return true;
};
