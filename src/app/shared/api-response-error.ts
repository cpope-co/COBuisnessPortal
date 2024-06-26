export class ApiResponseError extends Error {
  constructor(message: string, public validationErrors: any[]) {
    super(message);
    this.name = "ApiResponseError";
  }
}