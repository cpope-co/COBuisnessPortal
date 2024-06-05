import { ValidatorFn } from "@angular/forms"

export type FormHandling = {
    Validators: ValidatorFn[];
    ErrorMessages: {[key: string]: string};
    value: any;
}