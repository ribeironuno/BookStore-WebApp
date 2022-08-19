import { Component, OnInit } from '@angular/core';
import { NewsletterRestService } from 'src/app/services/newsletter-rest.service';
import { NewsletterSubscriber } from 'src/app/models/client';
import { NgToastService } from 'ng-angular-popup';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.css'],
})
export class NewsletterComponent implements OnInit {
  loading = false;
  unsubscribeForm = false;
  subscribeNewsletterForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
  });
  unsubscribeNewsletterForm = new FormGroup({
    email: new FormControl(''),
  });

  constructor(
    private newsletterservice: NewsletterRestService,
    private toast: NgToastService
  ) {}

  ngOnInit(): void {}

  subscribeNewsletter() {
    this.loading = true;
    let newsletterSubscriber = new NewsletterSubscriber(
      this.subscribeNewsletterForm.get('name')?.value,
      this.subscribeNewsletterForm.get('email')?.value
    );
    this.newsletterservice.subscribeNewsletter(newsletterSubscriber).subscribe(
      (res) => {
        //Return the pop up sucess message
        this.toast.success({
          detail: 'Adicionado com sucesso',
          summary: 'Fica atento à tua caixa de email!',
          duration: 5000,
        });
        //Reset the data from input form
        this.subscribeNewsletterForm.reset();
        this.loading = false;
      },
      (err) => {
        //Return the pop up error message
        this.toast.error({
          detail: 'Ocorreu um erro!',
          summary: 'Tenta novamente ou contacta-nos',
          duration: 5000,
        });
        this.loading = false;
      }
    );
  }

  unsubscribe() {
    this.unsubscribeForm = true;
  }

  unsubscribeNewsletter() {
    this.loading = true;
    this.newsletterservice
      .unsubscribeNewsletter(this.unsubscribeNewsletterForm.get('email')?.value)
      .subscribe(
        (res) => {
          //Return the pop up sucess message
          this.toast.success({
            detail: 'Removido com sucesso',
            duration: 5000,
          });
          //Reset the data from input form
          this.unsubscribeNewsletterForm.reset();
          this.loading = false;
        },
        (err) => {
          //Return the pop up error message
          this.toast.error({
            detail: 'Ocorreu um erro!',
            summary: 'Tenta novamente ou contacta-nos',
            duration: 5000,
          });
          this.loading = false;
        }
      );
  }
}
