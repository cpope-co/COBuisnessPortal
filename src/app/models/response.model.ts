export type apiResponse = {
    success: boolean;
    data?: any;
    validationErrors?: {
        field?: string;
        errDesc: string;
    }[];
}