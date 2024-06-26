export type apiResponse = {
    success: boolean;
    data?: any;
    validationErrors?: {
        errDesc: string;
    }[];
}