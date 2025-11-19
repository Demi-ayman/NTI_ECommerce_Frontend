import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuardGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router)
  const role = authService.getUserRole();

  const isLoggedIn = authService.isLoggedIn();
  if(!isLoggedIn){
    router.navigate(['/login'],{queryParams:{returnURL:state.url}});
    return false;
  }
  if (role === 'admin' && state.url.startsWith('/admin')) {
    router.navigate(['/admin/dashboard']);
    return false;
  }
  return true;
};
