import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import '@angular/compiler';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BooksComponent } from './components/books-items/books/books.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

//angular material
import { MatInputModule } from '@angular/material/input';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDialogModule } from '@angular/material/dialog';

import { NgToastModule } from 'ng-angular-popup';

import { HeaderComponent } from './components/layout/header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CartComponent } from './components/cart-items/cart//cart.component';
import { EmptyCartComponent } from './components/cart-items/empty-cart/empty-cart.component';
import { FilterPipe } from './shared/filter.pipe';
import { ProfileComponent } from './components/client-items/profile-items/profile/profile.component';
import { RegistrationComponent } from './components/client-items/registration/registration.component';
import { DropMenuComponent } from './components/books-items/drop-menu/drop-menu.component';
import { LoginComponent } from './components/client-items/login/login.component';
import { JwtInterceptor } from './shared/jwt.interceptor';
import { PurchasesComponent } from './components/client-items/profile-items/purchases/purchases.component';
import { SalesComponent } from './components/client-items/profile-items/sales/sales.component';
import { PersonalInformationComponent } from './components/client-items/profile-items/personal-information/personal-information.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DisplayPurchaseComponent } from './components/client-items/profile-items/display-purchase/display-purchase.component';
import { ConfirmCheckoutComponent } from './components/checkout/confirm-checkout/confirm-checkout.component';
import { EditProfileComponent } from './components/client-items/profile-items/edit-profile/edit-profile.component';
import { DisplaySaleComponent } from './components/client-items/profile-items/display-sale/display-sale.component';
import { RequestSaleComponent } from './components/client-items/profile-items/request-sale/request-sale.component';
import { DropMenuSaleComponent } from './components/client-items/profile-items/drop-menu-sale/drop-menu-sale.component';
import { AfterPaymentComponent } from './components/checkout/after-payment/after-payment.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { NewsletterComponent } from './components/common-items/newsletter/newsletter.component';
import { BookDetailComponent } from './components/books-items/book-detail/book-detail.component';
import { ReviewModalComponent } from './components/books-items/review-modal/review-modal.component';
import { AboutUsComponent } from './components/common-items/about-us/about-us.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorAfterPaymentComponent } from './components/checkout/error-after-payment/error-after-payment.component';
import { NotFoundComponent } from './components/common-items/not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    BooksComponent,
    HeaderComponent,
    CartComponent,
    EmptyCartComponent,
    DropMenuComponent,
    FilterPipe,
    LoginComponent,
    ProfileComponent,
    RegistrationComponent,
    PurchasesComponent,
    SalesComponent,
    PersonalInformationComponent,
    DisplayPurchaseComponent,
    ConfirmCheckoutComponent,
    EditProfileComponent,
    DisplaySaleComponent,
    RequestSaleComponent,
    DropMenuSaleComponent,
    AfterPaymentComponent,
    FooterComponent,
    NewsletterComponent,
    BookDetailComponent,
    ReviewModalComponent,
    AboutUsComponent,
    ErrorAfterPaymentComponent,
    NotFoundComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatListModule,
    MatBottomSheetModule,
    MatPaginatorModule,
    MatTableModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatMenuModule,
    MatSidenavModule,
    NgxPaginationModule,
    MatDialogModule,
    NgToastModule,
    ReactiveFormsModule,
    MatTooltipModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
