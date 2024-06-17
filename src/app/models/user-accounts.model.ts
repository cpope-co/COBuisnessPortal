import { Validators } from "@angular/forms";
import { FormHandling } from "./form-handling.model";

export type UserAccount = {
    usunbr: number;
    usemail: string | FormHandling;
    usfname: string | FormHandling;
    uslname: string | FormHandling;
    usstat: string | FormHandling;
    usfpc: boolean;
    usnfla: number;
    usibmi: boolean;
    usroleid: number | FormHandling;
    usidle: number | FormHandling;
    usabnum: number | FormHandling;
    usplcts: Date;
    uslflats: Date;
    usllts: Date;
    uscrts: Date;
    [key: string]: any;
}

export const userAccount: Partial<UserAccount> = {
    usemail: {
        Validators: [Validators.email, Validators.required],
        ErrorMessages: {
            'email': 'Please enter a valid email address.',
            'required': 'Please enter your email address.'
        },
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
    usstat: {
        Validators: [Validators.required],
        ErrorMessages: { 'required': 'Please enter your status.' },
        value: ''
    },
    usroleid: {
        Validators: [Validators.required],
        ErrorMessages: { 'required': 'Please enter your role id.' },
        value: ''
    },
    usidle: {
        Validators: [Validators.required],
        ErrorMessages: { 'required': 'Please enter your idle.' },
        value: ''
    },
    usabnum: {
        Validators: [Validators.required],
        ErrorMessages: { 'required': 'Please enter your address book number.' },
        value: ''
    }
}