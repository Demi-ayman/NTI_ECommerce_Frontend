import { Routes } from '@angular/router';
import { User } from './layout/user/user';
import { Home } from './pages/home/home';
import { Shop } from './pages/shop/shop';
import { ProductDetails } from './pages/product-details/product-details';
import { Wishlist } from './pages/wishlist/wishlist';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { Profile } from './pages/profile/profile';
import { Orders } from './pages/orders/orders';
import { Auth } from './layout/auth/auth';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { Admin } from './layout/admin/admin';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { ProductList } from './pages/admin/products/product-list/product-list';
import { ProductForm } from './pages/admin/products/product-form/product-form';
import { CategoryList } from './pages/admin/categories/category-list/category-list';
import { Orders as OrdersAdmin  } from './pages/admin/orders/orders';
import { Users } from './pages/admin/users/users';

import { authGuardGuard } from './core/guards/auth.guard-guard';
import { adminGuardGuard } from './core/guards/admin.guard-guard';
import { Subcategories } from './pages/admin/subcategories/subcategories';
import { Testimonials } from './pages/admin/testimonials/testimonials';
import { Faq as FaqUser } from './pages/faq/faq';
import { Faq } from './pages/admin/faq/faq';
import { Testimonials as TestimonialsUser} from './pages/testimonials/testimonials';

export const routes: Routes = [
  {
    path:'',
    component:User,
    children:[
      {path:'home',component:Home},
      {path:'shop',component:Shop},
      {path:'product/:id',component:ProductDetails},
      {path:'wishlist',component:Wishlist,canActivate:[authGuardGuard]},
      {path:'cart',component:Cart,canActivate:[authGuardGuard]},
      {path:'checkout',component:Checkout,canActivate:[authGuardGuard]},
      {path:'profile',component:Profile,canActivate:[authGuardGuard]},
      {path:'orders',component:Orders,canActivate:[authGuardGuard]},
      {path:'faq',component:FaqUser,canActivate:[authGuardGuard]},
      {path:'testimonials',component:TestimonialsUser}
    ] 
  },
  {
    path:'auth',component:Auth,children:[
      {path:'login',component:Login},
      {path:'register',component:Register}
    ]
  },
  {
    path:'admin',component:Admin,canActivate: [adminGuardGuard],children:[
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {path:'dashboard',component:Dashboard},
      {path:'products',component:ProductList},
      {path:'products/new',component:ProductForm},
      {path:'products/edit/:id',component:ProductForm},
      {path:'categories',component:CategoryList},
      {path:'orders-admin',component:OrdersAdmin},
      {path:'users',component:Users},
      {path:'subcategories',component:Subcategories},
      {path:'testimonials',component:Testimonials},
      {path:'faq',component:Faq}
    ]
  }
];
