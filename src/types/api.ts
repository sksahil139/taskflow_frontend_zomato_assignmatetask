export interface FieldErrors {
  [key: string]: string;
}

export interface ApiErrorResponse {
  error: string;
  fields?: FieldErrors;
}