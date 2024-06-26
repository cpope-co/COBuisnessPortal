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

const emailErrorMessages = {
    'email': 'Please enter a valid email address.',
    'required': 'Please enter your email address.'
}

export const profileAccount: Partial<UserAccount> = {
    usemail: {
        Validators: [Validators.email, Validators.required],
        ErrorMessages: emailErrorMessages,
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
}
export const userAccount: Partial<UserAccount> = {
    usemail: {
        Validators: [Validators.email, Validators.required],
        ErrorMessages: emailErrorMessages,
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
export const statuses = [
    { id: 'A', name: 'Active' },
    { id: 'I', name: 'Inactive' },
    { id: 'P', name: 'Pending' },
    { id: 'L', name: 'Locked out' }
]
export const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Customer' },
    { id: 3, name: 'Vendor' },
    { id: 4, name: 'Employee' },
    { id: 5, name: 'API Consumer' },
    { id: 6, name: 'Salesperson' }
];
