import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { FormClient } from 'src/app/models/formClient';
import { ClientRestService } from 'src/app/services/client-rest.service';
import { FormValidationService } from 'src/app/services/form-validation.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  @Input() client: FormClient;

  //flags to components
  fullRegister!: boolean;
  error1 = false;
  error2 = false;
  error3 = false;

  clientForm!: FormGroup;

  constructor(
    private clientService: ClientRestService,
    private router: Router,
    private route: ActivatedRoute,
    private validatorService: FormValidationService,
    private toast: NgToastService
  ) {
    this.client = new FormClient();
  }

  ngOnInit(): void {
    let type = this.route.snapshot.params['type'];

    //if type received
    if (type) {
      this.fullRegister = type == 'notFull' ? false : true;
    } else {
      this.fullRegister = true;
    }

    this.clientForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(60),
        this.validatorService.isName,
      ]),

      email: new FormControl('', [
        Validators.required,
        this.validatorService.isEmail,
      ]),
      zip: new FormControl('', [
        Validators.required,
        this.validatorService.isZipCode,
      ]),
      cellPhone: new FormControl('', [
        Validators.required,
        this.validatorService.isCellPhone,
      ]),
      dob: new FormControl('', [
        Validators.required,
        this.validatorService.isDOBClient,
      ]),
      gender: new FormControl('', [Validators.required]),
      address: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30),
      ]),
      nif: new FormControl('', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9),
        this.validatorService.isNIF,
      ]),
      city: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30),
      ]),
      password: new FormControl('', [
        Validators.required,
        this.validatorService.isPassword,
      ]),
    });
  }
  get name() {
    return this.clientForm.get('name')!;
  }
  get email() {
    return this.clientForm.get('email')!;
  }
  get zip() {
    return this.clientForm.get('zip')!;
  }
  get cellPhone() {
    return this.clientForm.get('cellPhone')!;
  }
  get address() {
    return this.clientForm.get('address')!;
  }
  get city() {
    return this.clientForm.get('city')!;
  }
  get password() {
    return this.clientForm.get('password')!;
  }
  get dob() {
    return this.clientForm.get('dob')!;
  }
  get gender() {
    return this.clientForm.get('gender')!;
  }
  get nif() {
    return this.clientForm.get('nif')!;
  }

  /*
   * Registration of a client
   */
  createClient() {
    if (!this.clientForm.valid) {
      this.toast.error({
        detail: 'Há campos inválidos!',
        summary: 'Garanta primeiro que os campos estão corretos',
        duration: 5000,
      });
      return;
    }
    this.clientService
      .createClient(this.clientForm.value as FormClient)
      .subscribe(
        (res) => {
          this.toast.success({
            detail: 'Sucesso!',
            summary: 'A sua conta foi registada no sistema.',
            duration: 5000,
          });
          this.router.navigate(['/login']);
        },
        (err) => {
          console.log(err.error);
          this.toast.error({
            detail: 'Erro!',
            summary: 'Houve um problema no registo. Contacte-nos.',
            duration: 5000,
          });
        }
      );
  }

  partialRegistration() {
    this.clientService
      .completeRegistration(this.client.email!, this.client.password!)
      .subscribe(
        (res) => {
          this.toast.success({
            detail: 'Sucesso!',
            summary: 'O seu registo foi guardado',
            duration: 5000,
          });
          location.href = 'client/profile';
        },
        (err) => {
          let response = err.error;
          console.log(response);

          if (response.error.code == 2) {
            this.error2 = true;
          } else if (response.error.code == 1) {
            this.error1 = true;
          } else if (response.error.code == 3) {
            this.error3 = true;
          } else {
            this.toast.error({
              detail: 'Erro!',
              summary: 'Houve um problema no registo. Contacte-nos.',
              duration: 5000,
            });
          }
        }
      );
  }

  //Client must be at least 10
  getMaxDobClient() {
    let actualDate = new Date();

    //Should be at least 10
    let maxDate = new Date(
      actualDate.getFullYear() - 10,
      actualDate.getMonth(),
      actualDate.getDay()
    );

    return maxDate.toISOString().slice(0, 10);
  }

  //errors alert management
  closeError(num: number) {
    if (num == 1) {
      this.error1 = false;
    } else if (num == 2) {
      this.error2 = false;
    } else if (num == 3) {
      this.error3 = false;
    }
  }
}
