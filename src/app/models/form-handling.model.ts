import { AbstractControlOptions, ValidatorFn } from "@angular/forms"

export type FormHandling = {
    Validators: ValidatorFn[];
    ErrorMessages: {[key: string]: string};
    value: any;
    formGroup?: {
        name: string;
        options?: AbstractControlOptions;
    }
}