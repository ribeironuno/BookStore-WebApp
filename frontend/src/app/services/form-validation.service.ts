import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormValidationService {
  constructor() {}

  isDOBClient = (control: AbstractControl) => {
    try {
      let year = control.value.slice(0, 4);
      let month = control.value.slice(5, 7);
      let days = control.value.slice(8, 10);

      let composedDate = new Date(year + '-' + month + '-' + days);

      let actualDate = new Date();

      //Should be at least 10
      let maxDate = new Date(
        actualDate.getFullYear() - 10,
        actualDate.getMonth(),
        actualDate.getDay()
      );

      //Cannot be more than 120
      let minDate = new Date(
        actualDate.getFullYear() - 120,
        actualDate.getMonth(),
        actualDate.getDay()
      );

      return null;
    } catch {
      return { dobInvalid: true };
    }
  };

  isZipCode = (control: AbstractControl) => {
    return /\d{4}-\d{3}/.test(control.value) && control.value.length == 8
      ? null
      : { zipInvalid: true };
  };

  isEmail = (control: AbstractControl) => {
    return /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(control.value) &&
      !/^(?!.*(\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}\b)).*/.test(
        control.value
      )
      ? null
      : { emailInvalid: true };
  };

  isName = (control: AbstractControl) => {
    return /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(control.value) &&
      !/[^A-Za-zÀ-ÖØ-öø-ÿ\s]+/.test(control.value)
      ? null
      : { nameInvalid: true };
  };

  isCellPhone = (control: AbstractControl) => {
    let tmpCellPhone: String = new String(control.value);
    return /9[1236][0-9]{7}|2[1-9][0-9]{7}/.test(control.value) &&
      tmpCellPhone.length == 9
      ? null
      : { cellPhoneInvalid: true };
  };

  isNIF = (control: AbstractControl) => {
    let tmpNif: String = new String(control.value);
    return /\d{9}/.test(control.value) && tmpNif.length == 9
      ? null
      : { nifInvalid: true };
  };

  isPassword = (control: AbstractControl) => {
    return control.value.length >= 5 ? null : { passwordInvalid: true };
  };
}
