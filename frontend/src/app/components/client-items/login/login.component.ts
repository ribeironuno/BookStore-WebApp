import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  showError1 = false;
  loading = false;

  ngOnInit(): void {
    this.showError1 = this.loading = false;
  }

  /**
   * Attempts to login
   */
  login(email: string, pass: string) {
    this.loading = true;
    this.auth.login(email, pass).subscribe(
      (res) => {
        this.loading = false;
        localStorage.setItem('currentUser', JSON.stringify(res));
        this.auth.loggedIn(); //notify header of logged in

        let returnUrl = this.route.snapshot.queryParams['returnUrl'];
        console.log(returnUrl);

        if (returnUrl) {
          if (returnUrl.includes('?')) {
            location.href = returnUrl;
          }
          this.router.navigate([returnUrl]);
        } else {
          this.router.navigate(['products']);
        }
      },
      (err) => {
        this.loading = false;
        this.showError1 = true;
      }
    );
  }

  closeError1() {
    this.showError1 = false;
  }
}
