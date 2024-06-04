import { ValidatorFn } from "@angular/forms"

export type FormHandling = {
    Validators: ValidatorFn[];
    ErrorMessages: string[];
    value: any;
}