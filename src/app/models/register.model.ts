import { Validators } from "@angular/forms";
import { FormHandling } from "./form-handling.model";

export type Register = {
  usemail: FormHandling;
  verifyEmail: FormHandling;
  usfname: FormHandling;
  uslname: FormHandling;
  usabnum?: FormHandling;
  wcatmgr?: FormHandling;
  wacctname: FormHandling;
  wregtype: FormHandling;
  wphone: FormHandling;
  wrecaptchatoken: FormHandling;
}

export enum RegistrationTypes {
  s = 'Supplier',
  r = 'Retailer',
}

export const register: Register = {
  usemail: {
    Validators: [Validators.email, Validators.required],
    ErrorMessages: { 'email': 'Please enter a valid email address.', 'required': 'Please enter your email address.' },
    value: ''
  },
  verifyEmail: {
    Validators: [Validators.email, Validators.required],
    ErrorMessages: { 'email': 'Please enter a valid email address.', 'required': 'Please enter your email address.'},
    value: ''
  },
  usfname: {
    Validators: [Validators.required],
    ErrorMessages: { 'required': 'Please enter your first name.' },
    value: ''
  },
  uslname: {
    Validators: [Validators.required],
    ErrorMessages: { 'required': 'Please enter your last name.' },
    value: ''
  },
  usabnum: {
    Validators: [],
    ErrorMessages: {},
    value: ''
  },
  wcatmgr: {
    Validators: [],
    ErrorMessages: {},
    value: ''
  },
  wacctname: {
    Validators: [Validators.required],
    ErrorMessages: { 'required': 'Please enter your account name.' },
    value: ''
  },
  wregtype: {
    Validators: [Validators.required],
    ErrorMessages: { 'required': 'Please select a registration type.' },
    value: ''
  },
  wphone: {
    Validators: [Validators.required],
    ErrorMessages: { 'required': 'Please enter your phone number.' },
    value: ''
  },
  wrecaptchatoken: {
    Validators: [],
    ErrorMessages: {},
    value: ''
  }

}
