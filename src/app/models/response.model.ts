export type apiReponse = {
    success: boolean;
    data?: any;
    validationErrors?: {
        errDesc: string;
    };
}