import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BooksComponent } from './components/books-items/books/books.component';
import { CartComponent } from './components/cart-items/cart/cart.component';
import { ProfileComponent } from './components/client-items/profile-items/profile/profile.component';
import { ConfirmCheckoutComponent } from './components/checkout/confirm-checkout/confirm-checkout.component';
import { LoginComponent } from './components/client-items/login/login.component';
import { AuthGuard } from './services/auth/auth.guard';
import { RegistrationComponent } from './components/client-items/registration/registration.component';
import { AfterPaymentComponent } from './components/checkout/after-payment/after-payment.component';
import { NewsletterComponent } from './components/common-items/newsletter/newsletter.component';
import { AboutUsComponent } from './components/common-items/about-us/about-us.component';
import { ErrorAfterPaymentComponent } from './components/checkout/error-after-payment/error-after-payment.component';
import { NotFoundComponent } from './components/common-items/not-found/not-found.component';

const routes: Routes = [
  { path: 'products', component: BooksComponent },
  { path: 'cart', component: CartComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'client/registration/:type',
    component: RegistrationComponent,
  },
  {
    path: 'client/profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'confirm-checkout',
    component: ConfirmCheckoutComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'after-payment',
    component: AfterPaymentComponent,
  },
  {
    path: 'newsletter',
    component: NewsletterComponent,
  },
  {
    path: 'about-us',
    component: AboutUsComponent,
  },
  {
    path: 'error-after-payment',
    component: ErrorAfterPaymentComponent,
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
  },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  {
    path: '**',
    redirectTo: '/not-found',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
